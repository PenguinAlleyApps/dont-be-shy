/**
 * Pro entitlement tokens — signed JWT with server-side revoke check.
 *
 * v0.4 changes:
 *  - Adds a `jti` (token id) so individual tokens can be revoked
 *  - verifyProToken is async and consults the revoke deny-list
 */
import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import { PRO_TOKEN_SECRET, PRO_SKUS, type ProSku } from "./config";
import { isRevoked } from "./db";

const ISSUER = "dont-be-shy.vercel.app";
const AUDIENCE = "dont-be-shy:pro";

function getSecret(): Uint8Array {
  if (!PRO_TOKEN_SECRET) {
    throw new Error("PRO_TOKEN_SECRET env var is not set");
  }
  return new TextEncoder().encode(PRO_TOKEN_SECRET);
}

function newJti(): string {
  return randomBytes(16).toString("hex");
}

export interface ProTokenPayload {
  sku: ProSku;
  stripeSessionId: string;
  jti: string;
  exp: number;
  iat: number;
}

export async function mintProToken(
  sku: ProSku,
  stripeSessionId: string,
): Promise<{ token: string; jti: string; expiresAt: number }> {
  const meta = PRO_SKUS[sku];
  if (!meta) throw new Error(`Unknown SKU: ${sku}`);

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + meta.durationDays * 24 * 60 * 60;
  const jti = newJti();

  const token = await new SignJWT({ sku, stripeSessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setJti(jti)
    .sign(getSecret());

  return { token, jti, expiresAt };
}

/** Verify signature + expiry + revoke deny-list. Returns null if invalid for any reason. */
export async function verifyProToken(
  token: string,
): Promise<ProTokenPayload | null> {
  let payload: ProTokenPayload;
  try {
    const result = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    payload = result.payload as unknown as ProTokenPayload;
  } catch {
    return null;
  }

  if (!payload.jti) return null;
  // Revoked tokens (refunds, abuse) are denied even if signature is valid
  if (await isRevoked(payload.jti)) return null;

  return payload;
}

/** Extract Bearer token from Authorization header. */
export function extractBearer(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
