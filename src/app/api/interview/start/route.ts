/**
 * POST /api/interview/start
 * Generate persona + questions, return opening message.
 *
 * v0.4 hardening enforces (in order):
 *   1. Pro JWT (Authorization Bearer) — bypasses demo cap, subject to Pro rate limit
 *   2. User-supplied Anthropic key — unmetered (user pays Anthropic directly)
 *   3. Demo mode — capped at DEMO_MAX_QUESTIONS per session, DEMO_MAX_SESSIONS_PER_HOUR
 *      per IP, AND DEMO_MONTHLY_CAP_CENTS aggregate spend (circuit breaker)
 */
import { NextRequest, NextResponse } from "next/server";
import { generatePersona } from "@/lib/ai/persona-generator";
import { generateQuestions } from "@/lib/ai/question-generator";
import { buildSystemPrompt, nextTurn } from "@/lib/ai/interviewer";
import { sampleQuestions, sampleMixedQuestions } from "@/lib/interview/question-sampler";
import { ROLE_TEMPLATES } from "@/lib/interview/templates";
import {
  ANTHROPIC_API_KEY,
  DEFAULT_INTERVIEWER_MODEL,
  DEMO_MAX_QUESTIONS,
  DEMO_MODE_ENABLED,
  CODING_MODE_ENABLED,
} from "@/lib/config";
import { extractBearer, verifyProToken } from "@/lib/pro-token";
import {
  checkProRateLimit,
  checkDemoRateLimit,
  recordSpendAndCheck,
} from "@/lib/db";
import type { RoleType } from "@/types/interview";

export const runtime = "nodejs";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobTitle,
      jobDescription,
      companyName,
      roleType,
      questionCount = 5,
      model,
    } = body as {
      jobTitle: string;
      jobDescription?: string;
      companyName?: string;
      roleType: RoleType;
      questionCount?: number;
      model?: string;
    };

    if (!jobTitle) {
      return NextResponse.json({ error: "jobTitle is required" }, { status: 400 });
    }

    /* ----- Tier resolution --------------------------------------------------
     * Hosted version is intentionally NOT BYOK. Pasting your `sk-ant-...` on
     * a public site is a trust nightmare. Two tiers only:
     *   - Demo: server-funded, 3 questions, 5/hr/IP, $300/mo cap
     *   - Pro: signed JWT (Authorization Bearer), unlimited, 30/day cap
     * Devs who want unlimited free can self-host (it's open source).
     */

    const proToken = extractBearer(request.headers.get("authorization"));
    const proPayload = proToken ? await verifyProToken(proToken) : null;
    const isPro = !!proPayload;

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY. Self-host with your own key." },
        { status: 503 },
      );
    }
    const apiKey = ANTHROPIC_API_KEY;

    const isDemo = !isPro;

    /* ----- Pro rate limit --------------------------------------------------- */

    if (isPro && proPayload) {
      const limit = await checkProRateLimit(proPayload.jti);
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: `You hit the daily Pro limit (${limit.cap} sessions). Resets at UTC midnight. Reach out at hello@penguinalley.com if this is wrong.`,
            code: "pro_daily_cap",
          },
          { status: 429 },
        );
      }
      // Track Pro spend (informational only — no cap)
      await recordSpendAndCheck("pro").catch(() => {});
    }

    /* ----- Demo mode gates -------------------------------------------------- */

    if (isDemo) {
      if (!DEMO_MODE_ENABLED) {
        return NextResponse.json(
          {
            error:
              "Demo mode temporarily disabled. Bring your own Anthropic key (free) or upgrade to Pro at /pricing.",
            code: "demo_disabled",
          },
          { status: 429 },
        );
      }

      // Per-IP rate limit (5 sessions/hr per Ledger spec)
      const ip = getClientIp(request);
      const ipLimit = await checkDemoRateLimit(ip);
      if (!ipLimit.allowed) {
        return NextResponse.json(
          {
            error: `Demo limit hit (${ipLimit.cap} sessions/hour). Try again next hour, or upgrade to Pro at /pricing for unlimited practice.`,
            code: "demo_rate_limit",
          },
          { status: 429 },
        );
      }

      // Monthly cost circuit breaker
      const breaker = await recordSpendAndCheck("demo");
      if (!breaker.allowed) {
        return NextResponse.json(
          {
            error:
              "Free demo budget exhausted for this month. Bring your own Anthropic key (free) or upgrade to Pro at /pricing.",
            code: "demo_monthly_cap",
          },
          { status: 429 },
        );
      }
    }

    /* ----- Generate the interview ------------------------------------------ */

    const effectiveCount = isDemo
      ? Math.min(questionCount, DEMO_MAX_QUESTIONS)
      : questionCount;
    const effectiveModel = model || DEFAULT_INTERVIEWER_MODEL;

    const template = ROLE_TEMPLATES.find((t) => t.id === roleType);
    let questions;
    let personaText: string;

    if (template && template.questions.length > 0) {
      const codingBank = template.codingQuestions ?? [];
      // Demo gets talk-only to stay cheap; Pro and full sessions get the mix.
      const useCoding = CODING_MODE_ENABLED && !isDemo && codingBank.length > 0;
      questions = useCoding
        ? sampleMixedQuestions(template.questions, codingBank, effectiveCount, 0.4)
        : sampleQuestions(template.questions, effectiveCount);
      personaText = await generatePersona(
        jobTitle,
        apiKey,
        effectiveModel,
        jobDescription,
        companyName,
      );
    } else {
      const [persona, generatedQuestions] = await Promise.all([
        generatePersona(jobTitle, apiKey, effectiveModel, jobDescription, companyName),
        generateQuestions(jobTitle, apiKey, effectiveModel, jobDescription, effectiveCount + 3),
      ]);
      personaText = persona;
      questions = sampleQuestions(generatedQuestions, effectiveCount);
    }

    const system = buildSystemPrompt(personaText, questions);
    const openingMessage = await nextTurn(
      [{ role: "user", content: "Begin the interview now. Start with your warm opener." }],
      system,
      apiKey,
      effectiveModel,
    );

    const sessionId = crypto.randomUUID();

    return NextResponse.json({
      sessionId,
      persona: personaText,
      questions,
      system,
      openingMessage,
      isDemo,
      isPro,
      questionCount: effectiveCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start interview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
