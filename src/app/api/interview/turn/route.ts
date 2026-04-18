/**
 * POST /api/interview/turn
 * Get next interviewer utterance with streaming response.
 */
import { NextRequest } from "next/server";
import { nextTurnStream } from "@/lib/ai/interviewer";
import { ANTHROPIC_API_KEY, DEFAULT_INTERVIEWER_MODEL } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation, system, model } = body as {
      conversation: { role: "user" | "assistant"; content: string }[];
      system: string;
      model?: string;
    };

    if (!conversation || !system) {
      return new Response(JSON.stringify({ error: "conversation and system are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const effectiveModel = model || DEFAULT_INTERVIEWER_MODEL;
    const stream = nextTurnStream(conversation, system, ANTHROPIC_API_KEY, effectiveModel);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get interviewer response";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
