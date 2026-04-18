/**
 * POST /api/interview/code-execute
 * Server-side code execution. Used for C# (Judge0) and as fallback for
 * languages where the browser path is disabled.
 *
 * Security: NEVER eval user code in this Vercel function directly.
 * Always proxy to Judge0 (which runs sandboxed elsewhere).
 */
import { NextRequest, NextResponse } from "next/server";
import { runJudge0 } from "@/lib/sandbox/judge0";
import { CODING_MODE_ENABLED } from "@/lib/config";
import type { CodingLanguage, TestCase } from "@/types/interview";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!CODING_MODE_ENABLED) {
    return NextResponse.json({ error: "coding mode disabled" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      language: CodingLanguage;
      code: string;
      testCases: TestCase[];
    };

    if (!body?.language || typeof body.code !== "string" || !Array.isArray(body.testCases)) {
      return NextResponse.json({ error: "language, code, testCases required" }, { status: 400 });
    }

    if (body.code.length > 50_000) {
      return NextResponse.json({ error: "code too long (max 50k chars)" }, { status: 400 });
    }
    if (body.testCases.length > 20) {
      return NextResponse.json({ error: "too many test cases (max 20)" }, { status: 400 });
    }

    // Browser-runnable languages should NOT be hitting this endpoint normally.
    // We allow them as fallback but route everything through Judge0 to keep one path.
    const result = await runJudge0(body.language, body.code, body.testCases);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "code execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
