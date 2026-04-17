/**
 * BYOK (Bring Your Own Key) utilities.
 * Client-side: store/retrieve from localStorage.
 * Server-side: validate format, create Anthropic client.
 */

const STORAGE_KEY = "dont-be-shy-api-key";

/** Store API key in localStorage. */
export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, key);
}

/** Retrieve API key from localStorage. */
export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/** Remove stored API key. */
export function clearApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Basic format validation for Anthropic API keys. */
export function isValidKeyFormat(key: string): boolean {
  return key.startsWith("sk-ant-") && key.length > 20;
}
