/**
 * Client-side Pro entitlement helpers.
 * Pro JWT lives in localStorage. Decoding is done server-side; client only
 * stores the opaque token and reads expiry from a sibling key for UI hints.
 */

const TOKEN_KEY = "dont-be-shy:pro-token";
const META_KEY = "dont-be-shy:pro-meta";

export interface ProMeta {
  sku: string;
  durationDays: number;
  expiresAt: number;
}

export function saveProToken(token: string, meta: ProMeta): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function getProToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const meta = getProMeta();
  if (!token || !meta) return null;
  if (meta.expiresAt * 1000 < Date.now()) {
    clearProToken();
    return null;
  }
  return token;
}

export function getProMeta(): ProMeta | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProMeta;
  } catch {
    return null;
  }
}

export function clearProToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(META_KEY);
}

export function hasActivePro(): boolean {
  return getProToken() !== null;
}

export function authHeader(): Record<string, string> {
  const token = getProToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
