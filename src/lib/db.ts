/**
 * Don't Be Shy persistence layer (Supabase Postgres).
 *
 * Tables (all prefixed dbs_ in the shared penguin-alley project):
 * - dbs_claimed_sessions: one-shot Pro activation guard
 * - dbs_revoked_jtis: deny-list for refunded/abused tokens
 * - dbs_pro_usage: per-token per-day session counter
 * - dbs_demo_usage: per-IP per-hour demo rate limit
 * - dbs_cost_tracking: monthly Anthropic spend (demo + pro split)
 *
 * EO-016 footnote: this layer is server-only. Anon key is used because RLS
 * is intentionally disabled on dbs_* tables (server is the only writer).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_KEY,
  PRO_MAX_SESSIONS_PER_DAY,
  DEMO_MAX_SESSIONS_PER_HOUR,
  COST_CENTS_PER_SESSION,
  DEMO_MONTHLY_CAP_CENTS,
} from "./config";

let _client: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be set");
  }
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
      global: { fetch: fetch.bind(globalThis) },
    });
  }
  return _client;
}

/* -------------------------------------------------------------------------- */
/* Claimed sessions — one-shot Pro activation                                 */
/* -------------------------------------------------------------------------- */

export interface ClaimedSession {
  session_id: string;
  jti: string;
  sku: string;
  expires_at: string;
}

/** Returns existing claim if any (idempotent), else null. */
export async function getClaim(sessionId: string): Promise<ClaimedSession | null> {
  const { data } = await getDb()
    .from("dbs_claimed_sessions")
    .select("session_id, jti, sku, expires_at")
    .eq("session_id", sessionId)
    .maybeSingle();
  return (data as ClaimedSession | null) ?? null;
}

/** Insert a new claim. Throws on conflict (caller must check getClaim first). */
export async function insertClaim(claim: ClaimedSession): Promise<void> {
  const { error } = await getDb().from("dbs_claimed_sessions").insert(claim);
  if (error) throw new Error(`insertClaim failed: ${error.message}`);
}

/* -------------------------------------------------------------------------- */
/* Revoked JTIs                                                                */
/* -------------------------------------------------------------------------- */

export async function isRevoked(jti: string): Promise<boolean> {
  const { data } = await getDb()
    .from("dbs_revoked_jtis")
    .select("jti")
    .eq("jti", jti)
    .maybeSingle();
  return data !== null;
}

export async function revokeJti(
  jti: string,
  reason: string,
  sessionId?: string,
): Promise<void> {
  await getDb()
    .from("dbs_revoked_jtis")
    .upsert({ jti, reason, session_id: sessionId ?? null }, { onConflict: "jti" });
}

/* -------------------------------------------------------------------------- */
/* Pro usage rate limit                                                        */
/* -------------------------------------------------------------------------- */

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Atomically increment per-Pro-token daily counter.
 * Returns new count. Caller checks against PRO_MAX_SESSIONS_PER_DAY.
 */
export async function bumpProUsage(jti: string): Promise<number> {
  const date = todayUtc();
  const db = getDb();
  // Upsert with increment via raw SQL fallback — Supabase JS doesn't have native increment.
  const { data: existing } = await db
    .from("dbs_pro_usage")
    .select("session_count")
    .eq("jti", jti)
    .eq("usage_date", date)
    .maybeSingle();

  const next = ((existing?.session_count as number | undefined) ?? 0) + 1;
  await db
    .from("dbs_pro_usage")
    .upsert(
      { jti, usage_date: date, session_count: next },
      { onConflict: "jti,usage_date" },
    );
  return next;
}

export interface ProRateLimitResult {
  allowed: boolean;
  count: number;
  cap: number;
}

export async function checkProRateLimit(jti: string): Promise<ProRateLimitResult> {
  const count = await bumpProUsage(jti);
  return { allowed: count <= PRO_MAX_SESSIONS_PER_DAY, count, cap: PRO_MAX_SESSIONS_PER_DAY };
}

/* -------------------------------------------------------------------------- */
/* Demo IP rate limit                                                          */
/* -------------------------------------------------------------------------- */

function currentHourBucket(): string {
  const d = new Date();
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

export async function bumpDemoUsage(ip: string): Promise<number> {
  const hour = currentHourBucket();
  const db = getDb();
  const { data: existing } = await db
    .from("dbs_demo_usage")
    .select("session_count")
    .eq("ip", ip)
    .eq("hour_bucket", hour)
    .maybeSingle();

  const next = ((existing?.session_count as number | undefined) ?? 0) + 1;
  await db
    .from("dbs_demo_usage")
    .upsert(
      { ip, hour_bucket: hour, session_count: next },
      { onConflict: "ip,hour_bucket" },
    );
  return next;
}

export interface DemoRateLimitResult {
  allowed: boolean;
  count: number;
  cap: number;
}

export async function checkDemoRateLimit(ip: string): Promise<DemoRateLimitResult> {
  const count = await bumpDemoUsage(ip);
  return { allowed: count <= DEMO_MAX_SESSIONS_PER_HOUR, count, cap: DEMO_MAX_SESSIONS_PER_HOUR };
}

/* -------------------------------------------------------------------------- */
/* Cost tracker + monthly circuit breaker                                      */
/* -------------------------------------------------------------------------- */

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export interface CostBreaker {
  /** True if we are still under the monthly cap and demo is allowed to spend. */
  allowed: boolean;
  demoCents: number;
  proCents: number;
  capCents: number;
}

/**
 * Record a session's estimated cost and return the new running totals.
 * Demo costs count against the monthly circuit breaker; Pro costs are tracked
 * for reporting only.
 */
export async function recordSpendAndCheck(
  bucket: "demo" | "pro",
): Promise<CostBreaker> {
  const month = currentMonth();
  const db = getDb();
  const { data: existing } = await db
    .from("dbs_cost_tracking")
    .select("demo_cents, pro_cents")
    .eq("month", month)
    .maybeSingle();

  const demoCents = (existing?.demo_cents as number | undefined) ?? 0;
  const proCents = (existing?.pro_cents as number | undefined) ?? 0;

  const nextDemo = bucket === "demo" ? demoCents + COST_CENTS_PER_SESSION : demoCents;
  const nextPro = bucket === "pro" ? proCents + COST_CENTS_PER_SESSION : proCents;

  await db.from("dbs_cost_tracking").upsert(
    {
      month,
      demo_cents: nextDemo,
      pro_cents: nextPro,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "month" },
  );

  return {
    allowed: nextDemo <= DEMO_MONTHLY_CAP_CENTS,
    demoCents: nextDemo,
    proCents: nextPro,
    capCents: DEMO_MONTHLY_CAP_CENTS,
  };
}

export async function readSpend(): Promise<{ demoCents: number; proCents: number; month: string }> {
  const month = currentMonth();
  const { data } = await getDb()
    .from("dbs_cost_tracking")
    .select("demo_cents, pro_cents")
    .eq("month", month)
    .maybeSingle();
  return {
    month,
    demoCents: (data?.demo_cents as number | undefined) ?? 0,
    proCents: (data?.pro_cents as number | undefined) ?? 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Session replay — coding turn keystroke streams + final verdict             */
/* -------------------------------------------------------------------------- */

export interface ReplayInsert {
  session_id: string;
  turn_idx: number;
  question_id: string;
  language: string;
  code_snapshots: unknown; // CodeSnapshot[]
  final_code: string;
  final_verdict: unknown; // CodeVerdict
  duration_ms: number;
}

export async function saveReplay(replay: ReplayInsert): Promise<void> {
  const { error } = await getDb()
    .from("dbs_session_replay")
    .upsert(replay, { onConflict: "session_id,turn_idx" });
  if (error) {
    console.error("[saveReplay]", error.message);
  }
}

export async function loadReplay(
  sessionId: string,
): Promise<ReplayInsert[]> {
  const { data, error } = await getDb()
    .from("dbs_session_replay")
    .select("*")
    .eq("session_id", sessionId)
    .order("turn_idx", { ascending: true });
  if (error) {
    console.error("[loadReplay]", error.message);
    return [];
  }
  return (data as ReplayInsert[] | null) ?? [];
}
