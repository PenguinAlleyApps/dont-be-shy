/** Server-side Stripe client + price helpers. */
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, PRO_SKUS, type ProSku } from "./config";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!_stripe) {
    _stripe = new Stripe(STRIPE_SECRET_KEY, { typescript: true });
  }
  return _stripe;
}

const _priceCache = new Map<string, string>();

/**
 * Resolve a Stripe price ID by lookup_key. Cached in module memory.
 * On first call, lists prices to find by lookup_key. If missing, creates the
 * product + price idempotently.
 */
export async function getPriceIdForSku(sku: ProSku): Promise<string> {
  const meta = PRO_SKUS[sku];
  if (!meta) throw new Error(`Unknown SKU: ${sku}`);

  const cached = _priceCache.get(meta.lookupKey);
  if (cached) return cached;

  const stripe = getStripe();

  const existing = await stripe.prices.list({
    lookup_keys: [meta.lookupKey],
    active: true,
    limit: 1,
  });

  if (existing.data.length > 0) {
    _priceCache.set(meta.lookupKey, existing.data[0].id);
    return existing.data[0].id;
  }

  // Idempotent create: find or create the parent product first
  const products = await stripe.products.search({
    query: `metadata['product_slug']:'dbs-pro'`,
    limit: 1,
  });

  const product =
    products.data[0] ??
    (await stripe.products.create({
      name: "Don't Be Shy Pro",
      description:
        "Hosted Pro tier — unlimited mock interviews, no BYOK required. Open source under AGPL-3.0.",
      metadata: { product_slug: "dbs-pro" },
    }));

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: meta.priceCents,
    currency: "usd",
    lookup_key: meta.lookupKey,
    nickname: meta.name,
    metadata: { duration_days: String(meta.durationDays), sku },
  });

  _priceCache.set(meta.lookupKey, price.id);
  return price.id;
}
