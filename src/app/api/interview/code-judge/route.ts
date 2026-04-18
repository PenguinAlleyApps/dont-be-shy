/**
 * POST /api/interview/code-judge
 * Phase-aware judge for coding turns. Three actions:
 *   - observe   (cheap, silent — Haiku 4.5)
 *   - milestone (Sonnet 4 — may surface a probe)
 *   - submit    (Sonnet 4 — full Byteboard CodeVerdict)
 *
 * Cost per coding turn (typical): 2 milestones + 1 submit ≈ 3 Sonnet calls + maybe 1 Haiku.
 * That's the basis for the COST_CENTS_PER_SESSION bump in v0.9 (21¢ → 35¢).
 */
import { NextRequest, NextResponse } from "next/server";
import {
  observe,
  milestone,
  submitVerdict,
  detectLanguage,
  type CodeJudgeRequest,
} from "@/lib/ai/code-judge";
import {
  ANTHROPIC_API_KEY,
  DEFAULT_JUDGE_MODEL,
  DEFAULT_OBSERVE_MODEL,
  CODING_MODE_ENABLED,
} from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!CODING_MODE_ENABLED) {
    return NextResponse.json({ error: "coding mode disabled" }, { status: 503 });
  }
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "server missing key" }, { status: 503 });
  }

  try {
    const req = (await request.json()) as CodeJudgeRequest;
    if (!req?.action || !req?.question || !req?.phase) {
      return NextResponse.json(
        { error: "action, question, phase required" },
        { status: 400 },
      );
    }

    const lang = detectLanguage(req.transcript || "");

    if (req.action === "observe") {
      const out = await observe(req, ANTHROPIC_API_KEY, DEFAULT_OBSERVE_MODEL, lang);
      return NextResponse.json(out);
    }

    if (req.action === "milestone") {
      const out = await milestone(req, ANTHROPIC_API_KEY, DEFAULT_JUDGE_MODEL, lang);
      return NextResponse.json(out);
    }

    // submit
    const verdict = await submitVerdict(req, ANTHROPIC_API_KEY, DEFAULT_JUDGE_MODEL, lang);
    return NextResponse.json(verdict);
  } catch (err) {
    const message = err instanceof Error ? err.message : "code-judge failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
