/**
 * Judge agent — evaluates each candidate response on the 4-axis rubric.
 * Ported from modules/consulting/interview_prep/src/judge.py.
 */

import Anthropic from "@anthropic-ai/sdk";
import { JUDGE_OUTPUT_SCHEMA } from "./rubric";
import { parseJudgeVerdict } from "./parse-verdict";
import type { JudgeVerdict } from "@/types/interview";

const JUDGE_SYSTEM = `You are an expert interview coach evaluating a candidate's response.

Grade on a 4-axis rubric (each 0 to 5):

1. domain_expertise: Accuracy, completeness, depth for the role being interviewed for.
2. english_fluency: Fluency, grammar, vocabulary. Also estimate CEFR (A2, B1, B2, C1, C2).
3. structure: Did they use clear structure (STAR in behavioral, listed axes, signposted transitions)?
4. confidence: Pacing, decisiveness, use of senior-signal phrases. Count filler words ("um", "uh", "like" non-comparative, "you know", "basically" as filler, "so..." as opener, "actually" non-contrastive, "literally" non-literal).

Also compute: filler_count, word_count, fillers_per_100_words.

Return ONLY a JSON object matching this schema. No prose, no markdown fences. Just the JSON:

${JUDGE_OUTPUT_SCHEMA}

Tone of strengths/gaps: direct, specific, actionable. Not generic.`;

/** Evaluate a single candidate response. Returns the JSON verdict. */
export async function evaluate(
  question: string,
  responseText: string,
  apiKey: string,
  model: string,
  questionSignals?: string[],
): Promise<JudgeVerdict | { error: string; raw?: string }> {
  let signalsHint = "";
  if (questionSignals?.length) {
    signalsHint = `\n\nGOOD ANSWER SIGNALS (for your reference, not to share):\n- ${questionSignals.join("\n- ")}`;
  }

  const prompt = `QUESTION: ${question}${signalsHint}\n\nCANDIDATE RESPONSE (transcribed, may have filler artifacts):\n${responseText}`;

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model,
      max_tokens: 800,
      system: JUDGE_SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const block = result.content[0];
    if (block.type !== "text") {
      return { error: "unexpected response type" };
    }

    return parseJudgeVerdict(block.text);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "judge evaluation failed",
    };
  }
}
