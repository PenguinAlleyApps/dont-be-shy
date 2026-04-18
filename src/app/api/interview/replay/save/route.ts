/**
 * POST /api/interview/replay/save
 * Persist one coding turn's full keystroke stream + final verdict for replay.
 *
 * Soft-fails: if Supabase is down, we still let the interview continue (replay
 * is a nice-to-have, not a blocker). Returns { ok: true } on best-effort save.
 */
import { NextRequest, NextResponse } from "next/server";
import { saveReplay } from "@/lib/db";
import { CODING_MODE_ENABLED } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: NextRequest) {
  if (!CODING_MODE_ENABLED) {
    return NextResponse.json({ ok: false, reason: "disabled" }, { status: 503 });
  }
  try {
    const body = await request.json();
    if (!body?.session_id || typeof body.turn_idx !== "number") {
      return NextResponse.json({ error: "session_id and turn_idx required" }, { status: 400 });
    }
    await saveReplay({
      session_id: String(body.session_id),
      turn_idx: Number(body.turn_idx),
      question_id: String(body.question_id ?? ""),
      language: String(body.language ?? ""),
      code_snapshots: body.code_snapshots ?? [],
      final_code: String(body.final_code ?? ""),
      final_verdict: body.final_verdict ?? null,
      duration_ms: Number(body.duration_ms ?? 0),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "save failed";
    return NextResponse.json({ ok: false, reason: message }, { status: 500 });
  }
}
