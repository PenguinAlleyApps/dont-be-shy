/**
 * Sample questions from a question bank.
 * Ported from modules/consulting/interview_prep/src/questions.py.
 */

import type { QuestionMeta } from "@/types/interview";

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sampleQuestions(
  bank: QuestionMeta[],
  n: number = 5,
  categories?: string[],
  forceClosing: boolean = true,
): QuestionMeta[] {
  let pool = bank;

  if (categories?.length) {
    pool = pool.filter((q) => categories.includes(q.category));
  }

  const closing = pool.filter((q) => q.category === "closing");
  const rest = pool.filter((q) => q.category !== "closing");

  const needClosing = forceClosing && closing.length > 0;
  const mainCount = Math.min(n - (needClosing ? 1 : 0), rest.length);

  const chosen = shuffle(rest).slice(0, mainCount);

  if (needClosing) {
    chosen.push(closing[Math.floor(Math.random() * closing.length)]);
  }

  return chosen;
}
