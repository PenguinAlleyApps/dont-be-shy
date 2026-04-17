/**
 * POST /api/interview/start
 * Generate persona + questions, return opening message.
 */
import { NextRequest, NextResponse } from "next/server";
import { generatePersona } from "@/lib/ai/persona-generator";
import { generateQuestions } from "@/lib/ai/question-generator";
import { buildSystemPrompt, nextTurn } from "@/lib/ai/interviewer";
import { sampleQuestions } from "@/lib/interview/question-sampler";
import { ROLE_TEMPLATES } from "@/lib/interview/templates";
import {
  ANTHROPIC_API_KEY,
  DEFAULT_INTERVIEWER_MODEL,
  DEMO_MAX_QUESTIONS,
} from "@/lib/config";
import type { RoleType } from "@/types/interview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobTitle,
      jobDescription,
      companyName,
      roleType,
      questionCount = 5,
      apiKey: userKey,
      model,
    } = body as {
      jobTitle: string;
      jobDescription?: string;
      companyName?: string;
      roleType: RoleType;
      questionCount?: number;
      apiKey?: string;
      model?: string;
    };

    if (!jobTitle) {
      return NextResponse.json({ error: "jobTitle is required" }, { status: 400 });
    }

    const apiKey = userKey || ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key provided. Add your Anthropic API key or use demo mode." },
        { status: 401 },
      );
    }

    const isDemo = !userKey;
    const effectiveCount = isDemo
      ? Math.min(questionCount, DEMO_MAX_QUESTIONS)
      : questionCount;
    const effectiveModel = model || DEFAULT_INTERVIEWER_MODEL;

    // Check if we have a pre-built template
    const template = ROLE_TEMPLATES.find((t) => t.id === roleType);
    let questions;
    let personaText: string;

    if (template && template.questions.length > 0) {
      // Use static template — instant, no generation latency
      questions = sampleQuestions(template.questions, effectiveCount);
      personaText = await generatePersona(
        jobTitle,
        apiKey,
        effectiveModel,
        jobDescription,
        companyName,
      );
    } else {
      // Generate dynamically from job description
      const [persona, generatedQuestions] = await Promise.all([
        generatePersona(jobTitle, apiKey, effectiveModel, jobDescription, companyName),
        generateQuestions(jobTitle, apiKey, effectiveModel, jobDescription, effectiveCount + 3),
      ]);
      personaText = persona;
      questions = sampleQuestions(generatedQuestions, effectiveCount);
    }

    // Build system prompt and get opening message
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
      questionCount: effectiveCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start interview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
