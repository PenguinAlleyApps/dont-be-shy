import { describe, it, expect } from "vitest";
import { parseJudgeVerdict } from "./parse-verdict";

const FULL_VERDICT = {
  domain_expertise: 4,
  english_fluency: 4,
  cefr_estimate: "C1",
  structure: 3,
  confidence: 4,
  filler_count: 2,
  word_count: 110,
  fillers_per_100_words: 1.82,
  strengths: ["concrete tradeoffs", "named alternatives"],
  gaps: ["no metric on result"],
  one_line_improvement: "quantify the result with a number or %",
};

describe("parseJudgeVerdict", () => {
  it("parses a clean JSON object", () => {
    const raw = JSON.stringify(FULL_VERDICT);
    const result = parseJudgeVerdict(raw);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.cefr_estimate).toBe("C1");
      expect(result.domain_expertise).toBe(4);
    }
  });

  it("strips ```json fences", () => {
    const raw = "```json\n" + JSON.stringify(FULL_VERDICT) + "\n```";
    const result = parseJudgeVerdict(raw);
    expect("error" in result).toBe(false);
  });

  it("strips bare ``` fences", () => {
    const raw = "```\n" + JSON.stringify(FULL_VERDICT) + "\n```";
    const result = parseJudgeVerdict(raw);
    expect("error" in result).toBe(false);
  });

  it("falls back to regex extraction for prose-wrapped JSON", () => {
    const raw =
      "Here is my evaluation:\n\n" +
      JSON.stringify(FULL_VERDICT) +
      "\n\nLet me know if you need more.";
    const result = parseJudgeVerdict(raw);
    expect("error" in result).toBe(false);
  });

  it("returns error for non-JSON text", () => {
    const result = parseJudgeVerdict("I cannot evaluate this response.");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toMatch(/could not parse/);
      expect(result.raw).toBeDefined();
    }
  });

  it("trims surrounding whitespace", () => {
    const raw = "   \n\n" + JSON.stringify(FULL_VERDICT) + "\n  ";
    const result = parseJudgeVerdict(raw);
    expect("error" in result).toBe(false);
  });
});
