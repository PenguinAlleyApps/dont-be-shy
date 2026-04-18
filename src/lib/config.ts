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

/** Supabase persistence — used for one-shot activation, revoke list, rate limits, cost tracker. */
export const SUPABASE_URL = process.env.SUPABASE_URL || "";
export const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

/** ElevenLabs TTS — premium neural voice for the interviewer. */
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
/** Default voice: Rachel — calm, US English female, the canonical "warm interviewer". */
export const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

/** Hard limits (Ledger spec) */
export const PRO_MAX_SESSIONS_PER_DAY = Number(process.env.PRO_MAX_SESSIONS_PER_DAY ?? 30);
export const DEMO_MAX_SESSIONS_PER_HOUR = Number(process.env.DEMO_MAX_SESSIONS_PER_HOUR ?? 5);
/** Estimated cost in cents per session (interviewer + judge × ~6 turns).
 *  v0.9 bump: coding turns add ~14¢ on top of talk baseline due to phase-aware
 *  judge calls (observe/milestone/submit). 21¢ → 35¢ for mixed sessions. */
export const COST_CENTS_PER_SESSION = Number(process.env.COST_CENTS_PER_SESSION ?? 35);
/** Monthly hard cap for demo-mode spend in cents. Default $300. */
export const DEMO_MONTHLY_CAP_CENTS = Number(process.env.DEMO_MONTHLY_CAP_CENTS ?? 30000);

/** Judge0 configuration for executing user-submitted code (C# in v0.9, more later).
 *  - JUDGE0_URL empty → C# execution returns 503 with code `judge0_not_configured`
 *  - Browser-runnable languages (Python via Pyodide, JS/TS via Web Worker) bypass Judge0 entirely.
 *  - When using RapidAPI tier, set both URL and AUTH_TOKEN. */
export const JUDGE0_URL = process.env.JUDGE0_URL || "";
export const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || "";
/** Master kill switch for the v0.9 coding mode. Set CODING_MODE_ENABLED=false in
 *  Vercel to revert to talk-only flow if costs spike or Judge0 is misbehaving. */
export const CODING_MODE_ENABLED = process.env.CODING_MODE_ENABLED !== "false";

/** Cheaper model for the silent observation pass (judge watches, doesn't surface). */
export const DEFAULT_OBSERVE_MODEL = "claude-haiku-4-5-20251001";

/** Public app URL — used in Stripe success/cancel URLs. */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
