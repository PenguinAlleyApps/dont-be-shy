/**
 * POST /api/webhooks/stripe
 * Stripe webhook handler. Currently logs events; the actual Pro entitlement
 * is minted via /api/pro/activate (which uses the success URL's session_id).
 *
 * Future: when refund/dispute fires, write the session_id to a deny-list so
 * the JWT can be invalidated server-side. Out of scope for v0.3.0.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { STRIPE_WEBHOOK_SECRET } from "@/lib/config";

export const runtime = "nodejs";

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

  switch (event.type) {
    case "checkout.session.completed":
      console.info("[stripe] checkout.session.completed", event.data.object.id);
      break;
    case "charge.refunded":
      console.info("[stripe] charge.refunded — manual intervention required to revoke JWT");
      break;
    default:
      console.info("[stripe] received event", event.type);
  }

  return NextResponse.json({ received: true });
}
