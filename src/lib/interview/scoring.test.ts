import { describe, it, expect } from "vitest";
import { aggregateScores } from "./scoring";
import type { TurnRecord, JudgeVerdict } from "@/types/interview";

function turn(judge: Partial<JudgeVerdict> | { error: string }, idx = 1): TurnRecord {
  return {
    idx,
    questionMeta: {
      id: `q-${idx}`,
      question: "test?",
      category: "test",
      difficulty: "easy",
      good_answer_signals: [],
      followup: null,
    },
    interviewerText: "test question",
    userResponse: "test answer",
    judge: ("error" in judge
      ? judge
      : ({
          domain_expertise: 0,
          english_fluency: 0,
          cefr_estimate: "B2",
          structure: 0,
          confidence: 0,
          filler_count: 0,
          word_count: 0,
          fillers_per_100_words: 0,
          strengths: [],
          gaps: [],
          one_line_improvement: "",
          ...judge,
        } as JudgeVerdict)) as TurnRecord["judge"],
  };
}

describe("aggregateScores", () => {
  it("returns zeros when no turns", () => {
    const result = aggregateScores([]);
    expect(result.turns_scored).toBe(0);
    expect(result.domain_expertise).toBe(0);
    expect(result.cefr_mode).toBeUndefined();
  });

  it("ignores turns with judge errors", () => {
    const turns = [
      turn({ error: "parse failed" }),
      turn({ domain_expertise: 4, english_fluency: 4, structure: 4, confidence: 4 }, 2),
    ];
    const result = aggregateScores(turns);
    expect(result.turns_scored).toBe(1);
    expect(result.domain_expertise).toBe(4);
  });

  it("averages 4-axis scores across valid turns", () => {
    const turns = [
      turn({ domain_expertise: 5, english_fluency: 4, structure: 3, confidence: 4 }, 1),
      turn({ domain_expertise: 3, english_fluency: 4, structure: 5, confidence: 2 }, 2),
    ];
    const result = aggregateScores(turns);
    expect(result.domain_expertise).toBe(4); // (5+3)/2
    expect(result.english_fluency).toBe(4);
    expect(result.structure).toBe(4);
    expect(result.confidence).toBe(3); // (4+2)/2
  });

  it("computes CEFR mode (most common)", () => {
    const turns = [
      turn({ cefr_estimate: "B2" }, 1),
      turn({ cefr_estimate: "C1" }, 2),
      turn({ cefr_estimate: "B2" }, 3),
    ];
    const result = aggregateScores(turns);
    expect(result.cefr_mode).toBe("B2");
  });

  it("aggregates fillers across turns", () => {
    const turns = [
      turn({ filler_count: 3, word_count: 100 }, 1),
      turn({ filler_count: 5, word_count: 150 }, 2),
    ];
    const result = aggregateScores(turns);
    expect(result.total_fillers).toBe(8);
    expect(result.total_words).toBe(250);
    expect(result.overall_fillers_per_100_words).toBe(3.2);
  });

  it("handles zero words without dividing by zero", () => {
    const turns = [turn({ filler_count: 0, word_count: 0 }, 1)];
    const result = aggregateScores(turns);
    expect(result.overall_fillers_per_100_words).toBe(0);
  });

  it("rounds averages to 2 decimal places", () => {
    const turns = [
      turn({ domain_expertise: 4, english_fluency: 0, structure: 0, confidence: 0 }, 1),
      turn({ domain_expertise: 5, english_fluency: 0, structure: 0, confidence: 0 }, 2),
      turn({ domain_expertise: 5, english_fluency: 0, structure: 0, confidence: 0 }, 3),
    ];
    const result = aggregateScores(turns);
    expect(result.domain_expertise).toBe(4.67);
  });
});
