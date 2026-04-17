/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for the requested SKU.
 * Returns { url } for client-side redirect.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPriceIdForSku } from "@/lib/stripe";
import { PRO_SKUS, APP_URL, type ProSku } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sku = body?.sku as ProSku | undefined;

    if (!sku || !PRO_SKUS[sku]) {
      return NextResponse.json(
        { error: `Invalid sku. Expected one of: ${Object.keys(PRO_SKUS).join(", ")}` },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const priceId = await getPriceIdForSku(sku);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types: ["card"],
      success_url: `${APP_URL}/pro/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing?canceled=1`,
      metadata: { sku },
      automatic_tax: { enabled: false },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a Checkout URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
