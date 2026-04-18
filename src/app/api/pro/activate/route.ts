/**
 * POST /api/pro/activate
 * Verify a paid Stripe Checkout Session and mint a Pro JWT.
 *
 * v0.4 hardening: ONE-SHOT per session_id. Subsequent calls return the
 * already-minted token (no fresh mint, prevents enumerating sessions to
 * generate multiple tokens off a single payment).
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { mintProToken } from "@/lib/pro-token";
import { getClaim, insertClaim } from "@/lib/db";
import { PRO_SKUS, type ProSku } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body?.sessionId;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // One-shot guard: if this session already minted a token, refuse to mint another
    const existing = await getClaim(sessionId);
    if (existing) {
      return NextResponse.json(
        {
          error:
            "This checkout session has already been activated. If you lost access to the original Pro token, contact hello@penguinalley.com with your Stripe receipt.",
          code: "already_claimed",
        },
        { status: 409 },
      );
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

    const { token, jti, expiresAt } = await mintProToken(sku, session.id);
    const meta = PRO_SKUS[sku];

    // Persist the claim. If two activations race, one will get a unique-key
    // violation; that one returns the already-claimed error.
    try {
      await insertClaim({
        session_id: session.id,
        jti,
        sku,
        expires_at: new Date(expiresAt * 1000).toISOString(),
      });
    } catch (err) {
      // Race condition: someone else claimed in the meantime
      const claimNow = await getClaim(sessionId);
      if (claimNow) {
        return NextResponse.json(
          {
            error: "This checkout session has already been activated.",
            code: "already_claimed",
          },
          { status: 409 },
        );
      }
      throw err;
    }

    return NextResponse.json({
      token,
      sku,
      durationDays: meta.durationDays,
      expiresAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate Pro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
