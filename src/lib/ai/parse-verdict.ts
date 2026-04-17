/**
 * Pure function to parse a Judge model response into a verdict.
 * Extracted from judge.ts so it can be tested without an API call.
 */
import type { JudgeVerdict } from "@/types/interview";

export type ParseResult =
  | JudgeVerdict
  | { error: string; raw?: string };

export function parseJudgeVerdict(rawText: string): ParseResult {
  let text = rawText.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(text) as JudgeVerdict;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as JudgeVerdict;
      } catch {
        // fall through
      }
    }
    return { error: "could not parse judge response", raw: text };
  }
}
