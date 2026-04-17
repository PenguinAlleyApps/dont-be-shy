/** Don't Be Shy configuration — environment variables and constants. */

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export const DEFAULT_INTERVIEWER_MODEL = "claude-sonnet-4-20250514";
export const DEFAULT_JUDGE_MODEL = "claude-sonnet-4-20250514";

/** Demo mode limits */
export const DEMO_MAX_QUESTIONS = 3;
export const DEMO_RATE_LIMIT_PER_HOUR = 5;

/** App metadata */
export const APP_VERSION = "0.3.0";
export const APP_NAME = "Don't Be Shy";

/** Stripe + Pro tier */
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/** JWT secret for signing Pro tokens. Generate via `openssl rand -hex 32`. */
export const PRO_TOKEN_SECRET = process.env.PRO_TOKEN_SECRET || "";

/** Pricing — single source of truth */
export const PRO_SKUS = {
  pro_7day: {
    name: "Don't Be Shy Pro — 7 days",
    priceCents: 1900,
    durationDays: 7,
    lookupKey: "pro_7day",
  },
  pro_30day: {
    name: "Don't Be Shy Pro — 30 days",
    priceCents: 4900,
    durationDays: 30,
    lookupKey: "pro_30day",
  },
} as const;

export type ProSku = keyof typeof PRO_SKUS;

/** Demo kill switch — set DEMO_MODE_ENABLED=false in Vercel to disable demo if costs spike. */
export const DEMO_MODE_ENABLED = process.env.DEMO_MODE_ENABLED !== "false";

/** Public app URL — used in Stripe success/cancel URLs. */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
