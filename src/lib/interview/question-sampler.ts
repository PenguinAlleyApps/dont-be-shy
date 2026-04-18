/**
 * Sample questions from a question bank.
 * Ported from modules/consulting/interview_prep/src/questions.py.
 */

import type { QuestionMeta, CodingQuestion, InterviewQuestion } from "@/types/interview";

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

/**
 * Build a mixed interview that intersperses talk and coding questions.
 * Default mix is 60% talk / 40% code (for n=5: 3 talk + 2 code, with talk first
 * and last so the candidate warms up and closes verbally).
 *
 * If codingBank is empty, returns a pure-talk sample.
 */
export function sampleMixedQuestions(
  talkBank: QuestionMeta[],
  codingBank: CodingQuestion[],
  n: number = 5,
  codingRatio: number = 0.4,
): InterviewQuestion[] {
  if (!codingBank.length || codingRatio <= 0) {
    return sampleQuestions(talkBank, n);
  }

  const codingCount = Math.min(Math.max(1, Math.round(n * codingRatio)), codingBank.length);
  // Always reserve a talk closing at the end and a talk opener at index 0.
  const talkCount = n - codingCount;
  if (talkCount <= 0) {
    // Edge: very small n with high ratio. Drop to one talk, fill rest with code.
    return [
      ...sampleQuestions(talkBank, 1).slice(0, 1),
      ...shuffle(codingBank).slice(0, n - 1),
    ];
  }

  const talkPicked = sampleQuestions(talkBank, talkCount);
  const codingPicked = shuffle(codingBank).slice(0, codingCount);

  // Layout: [opener-talk, code, talk, code, ..., closing-talk]
  // Move closing to the end if present.
  const closingIdx = talkPicked.findIndex((q) => q.category === "closing");
  const closing = closingIdx >= 0 ? talkPicked.splice(closingIdx, 1)[0] : null;
  const opener = talkPicked.shift() ?? null;

  const middle: InterviewQuestion[] = [];
  let t = 0;
  let c = 0;
  // Alternate, code-first inside the middle.
  while (t < talkPicked.length || c < codingPicked.length) {
    if (c < codingPicked.length) middle.push(codingPicked[c++]);
    if (t < talkPicked.length) middle.push(talkPicked[t++]);
  }

  const out: InterviewQuestion[] = [];
  if (opener) out.push(opener);
  out.push(...middle);
  if (closing) out.push(closing);
  return out.slice(0, n);
}
