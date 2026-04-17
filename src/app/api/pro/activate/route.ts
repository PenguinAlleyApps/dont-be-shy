/**
 * POST /api/pro/activate
 * Verify a paid Stripe Checkout Session and mint a Pro JWT.
 *
 * The /pro/welcome page calls this with the session_id from the success URL.
 * Idempotent — a refresh on /pro/welcome remints the same-shape token.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { mintProToken } from "@/lib/pro-token";
import { PRO_SKUS, type ProSku } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body?.sessionId;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Payment not completed (status: ${session.payment_status})` },
        { status: 402 },
      );
    }

    const sku = session.metadata?.sku as ProSku | undefined;
    if (!sku || !PRO_SKUS[sku]) {
      return NextResponse.json({ error: "Session has no valid sku metadata" }, { status: 400 });
    }

    const token = await mintProToken(sku, session.id);
    const meta = PRO_SKUS[sku];

    return NextResponse.json({
      token,
      sku,
      durationDays: meta.durationDays,
      expiresAt: Math.floor(Date.now() / 1000) + meta.durationDays * 24 * 60 * 60,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate Pro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
