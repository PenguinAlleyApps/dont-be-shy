/**
 * POST /api/interview/summary
 * Aggregate scores across all turns in a session.
 */
import { NextRequest, NextResponse } from "next/server";
import { aggregateScores } from "@/lib/interview/scoring";
import type { TurnRecord } from "@/types/interview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turns } = body as { turns: TurnRecord[] };

    if (!turns || !Array.isArray(turns)) {
      return NextResponse.json({ error: "turns array is required" }, { status: 400 });
    }

    const scores = aggregateScores(turns);
    return NextResponse.json(scores);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summary failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
