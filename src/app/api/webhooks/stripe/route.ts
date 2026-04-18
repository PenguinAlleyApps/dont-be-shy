/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler. Critical events:
 *   - charge.refunded → revoke the JWT minted from that checkout session
 *   - charge.dispute.created → revoke + log
 *
 * Pro entitlement minting itself happens in /api/pro/activate (success URL
 * path). The webhook is for after-the-fact revocation only.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { STRIPE_WEBHOOK_SECRET } from "@/lib/config";
import { getDb, revokeJti } from "@/lib/db";

export const runtime = "nodejs";

async function revokeForCharge(chargeId: string, reason: string) {
  // Trace charge → payment_intent → checkout.session → claim → jti
  const stripe = getStripe();

  const charge = await stripe.charges.retrieve(chargeId);
  if (!charge.payment_intent) {
    console.warn(`[stripe-webhook] charge ${chargeId} has no payment_intent`);
    return;
  }

  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent.id;

  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });

  const session = sessions.data[0];
  if (!session) {
    console.warn(`[stripe-webhook] no checkout session for payment_intent ${paymentIntentId}`);
    return;
  }

  const { data } = await getDb()
    .from("dbs_claimed_sessions")
    .select("jti")
    .eq("session_id", session.id)
    .maybeSingle();

  if (!data?.jti) {
    console.info(`[stripe-webhook] no jti claimed for session ${session.id} — nothing to revoke`);
    return;
  }

  await revokeJti(data.jti as string, reason, session.id);
  console.info(`[stripe-webhook] revoked jti ${data.jti} for ${session.id} (${reason})`);
}

export async function POST(request: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "charge.refunded":
        await revokeForCharge(event.data.object.id, "stripe:charge.refunded");
        break;
      case "charge.dispute.created":
        await revokeForCharge(event.data.object.charge as string, "stripe:dispute");
        break;
      case "checkout.session.completed":
        // No-op: activation happens via the success URL → /api/pro/activate
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    // Still return 200 to acknowledge receipt; Stripe will not retry, and we
    // don't want to enter an endless retry loop on transient issues. The
    // event is logged; manual recovery is possible via Stripe dashboard.
  }

  return NextResponse.json({ received: true });
}
