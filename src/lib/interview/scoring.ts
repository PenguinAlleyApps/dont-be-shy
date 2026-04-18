/**
 * Aggregate scoring across interview turns.
 * Ported from modules/consulting/interview_prep/src/session.py:aggregate_scores().
 */

import type { TurnRecord, AggregateScores, JudgeVerdict } from "@/types/interview";

/** True iff judge is a talk-style JudgeVerdict (not a CodeVerdict and not an error). */
function isValidVerdict(judge: TurnRecord["judge"]): judge is JudgeVerdict {
  if (!judge || typeof judge !== "object") return false;
  const obj = judge as unknown as Record<string, unknown>;
  if ("error" in obj) return false;
  // CodeVerdict has a "scores" object; JudgeVerdict has flat domain_expertise/etc.
  if ("scores" in obj) return false;
  return "domain_expertise" in obj;
}

export function aggregateScores(turns: TurnRecord[]): AggregateScores {
  const valid = turns.filter((t) => isValidVerdict(t.judge));

  if (valid.length === 0) {
    return {
      domain_expertise: 0,
      english_fluency: 0,
      structure: 0,
      confidence: 0,
      total_fillers: 0,
      total_words: 0,
      overall_fillers_per_100_words: 0,
      turns_scored: 0,
    };
  }

  const keys = ["domain_expertise", "english_fluency", "structure", "confidence"] as const;
  const averages: Record<string, number> = {};

  for (const key of keys) {
    const values = valid.map((t) => (t.judge as JudgeVerdict)[key] ?? 0);
    averages[key] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  }

  // CEFR mode (most common)
  const cefrs = valid
    .map((t) => (t.judge as JudgeVerdict).cefr_estimate)
    .filter(Boolean);

  let cefrMode: string | undefined;
  if (cefrs.length > 0) {
    const counts = new Map<string, number>();
    for (const c of cefrs) {
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    cefrMode = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  // Aggregate fillers
  const totalFillers = valid.reduce(
    (sum, t) => sum + ((t.judge as JudgeVerdict).filler_count ?? 0),
    0,
  );
  const totalWords = valid.reduce(
    (sum, t) => sum + ((t.judge as JudgeVerdict).word_count ?? 0),
    0,
  );

  return {
    domain_expertise: averages.domain_expertise,
    english_fluency: averages.english_fluency,
    structure: averages.structure,
    confidence: averages.confidence,
    cefr_mode: cefrMode,
    total_fillers: totalFillers,
    total_words: totalWords,
    overall_fillers_per_100_words:
      Math.round((totalFillers / Math.max(totalWords, 1)) * 100 * 100) / 100,
    turns_scored: valid.length,
  };
}
