/**
 * Pro entitlement tokens — stateless JWT.
 *
 * Why stateless: we ship without a user database. Token contains expiry +
 * sku; server verifies signature; no DB lookup needed.
 *
 * Trade-off: revocation requires a deny-list (not implemented). For a $19
 * 7-day product this is acceptable — refunds are rare and handled manually
 * via Stripe dashboard.
 */
import { SignJWT, jwtVerify } from "jose";
import { PRO_TOKEN_SECRET, PRO_SKUS, type ProSku } from "./config";

const ISSUER = "dont-be-shy.vercel.app";
const AUDIENCE = "dont-be-shy:pro";

function getSecret(): Uint8Array {
  if (!PRO_TOKEN_SECRET) {
    throw new Error("PRO_TOKEN_SECRET env var is not set");
  }
  return new TextEncoder().encode(PRO_TOKEN_SECRET);
}

export interface ProTokenPayload {
  sku: ProSku;
  stripeSessionId: string;
  /** Unix seconds */
  exp: number;
  /** Unix seconds */
  iat: number;
}

export async function mintProToken(
  sku: ProSku,
  stripeSessionId: string,
): Promise<string> {
  const meta = PRO_SKUS[sku];
  if (!meta) throw new Error(`Unknown SKU: ${sku}`);

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + meta.durationDays * 24 * 60 * 60;

  return new SignJWT({ sku, stripeSessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(getSecret());
}

export async function verifyProToken(
  token: string,
): Promise<ProTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as unknown as ProTokenPayload;
  } catch {
    return null;
  }
}

/** Extract Bearer token from Authorization header. */
export function extractBearer(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
