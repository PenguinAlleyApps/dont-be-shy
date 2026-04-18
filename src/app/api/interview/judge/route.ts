/**
 * POST /api/interview/judge
 * Evaluate a candidate response on the 4-axis rubric.
 */
import { NextRequest, NextResponse } from "next/server";
import { evaluate } from "@/lib/ai/judge";
import { ANTHROPIC_API_KEY, DEFAULT_JUDGE_MODEL } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, response: userResponse, signals, model } = body as {
      question: string;
      response: string;
      signals?: string[];
      model?: string;
    };

    if (!question || !userResponse) {
      return NextResponse.json(
        { error: "question and response are required" },
        { status: 400 },
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Server is missing ANTHROPIC_API_KEY" }, { status: 503 });
    }

    const effectiveModel = model || DEFAULT_JUDGE_MODEL;
    const verdict = await evaluate(question, userResponse, ANTHROPIC_API_KEY, effectiveModel, signals);

    return NextResponse.json(verdict);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Judge evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
