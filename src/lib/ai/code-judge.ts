/**
 * Code Judge — phase-aware evaluator for coding interview turns.
 *
 * Three actions:
 *   - observe   (silent — Haiku, never surfaces): logs an observation for the dimension
 *   - milestone (Sonnet): may return ONE probe to surface in chat + a list of observations
 *   - submit    (Sonnet, Byteboard 5-dim rubric): final CodeVerdict
 *
 * The judge writes back in the candidate's language (en/es) detected from the transcript.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  CodeVerdict,
  CodingPhase,
  CodingQuestion,
  TestResult,
} from "@/types/interview";

export type CodeJudgeAction = "observe" | "milestone" | "submit";

export interface CodeJudgeRequest {
  action: CodeJudgeAction;
  phase: CodingPhase;
  question: CodingQuestion;
  code: string;
  /** Recent transcript chunk (last ~30s of voice or full text-mode message). */
  transcript: string;
  /** Latest test results, if any have been run yet. */
  testResults?: TestResult[];
  /** Why the milestone fired — informs the probe choice. */
  milestoneReason?: "phase_change" | "test_run" | "idle_60s" | "function_complete";
}

export interface CodeJudgeMilestoneResponse {
  probe: string | null;
  observations: { dimension: string; note: string }[];
}

export interface CodeJudgeObserveResponse {
  observations: { dimension: string; note: string }[];
}

const DIMENSIONS = [
  "problem_understanding",
  "approach_quality",
  "code_quality",
  "testing_rigor",
  "communication",
] as const;

const SHARED_CONTEXT = (req: CodeJudgeRequest, lang: "en" | "es") => {
  const langInstruction =
    lang === "es"
      ? "Responde SIEMPRE en español. El candidato está hablando español."
      : "Respond in English. The candidate is speaking English.";
  return `${langInstruction}

INTERVIEW CONTEXT
Question: ${req.question.title} (${req.question.difficulty}, ${req.question.language})
Prompt: ${req.question.prompt}
Current phase: ${req.phase}
${req.milestoneReason ? `Milestone trigger: ${req.milestoneReason}` : ""}

CANDIDATE'S CURRENT CODE:
\`\`\`${req.question.language}
${req.code || "(empty)"}
\`\`\`

RECENT TRANSCRIPT (what the candidate said in the last ~30s):
${req.transcript || "(silence)"}

${req.testResults && req.testResults.length > 0
    ? `LAST TEST RUN: ${req.testResults.filter((t) => t.passed).length}/${req.testResults.length} passed`
    : "No tests have been run yet."
  }`;
};

/* -------------------------------------------------------------------------- */
/* observe — cheap silent pass with Haiku                                      */
/* -------------------------------------------------------------------------- */

export async function observe(
  req: CodeJudgeRequest,
  apiKey: string,
  model: string,
  lang: "en" | "es",
): Promise<CodeJudgeObserveResponse> {
  const system = `You are a senior interviewer silently observing a coding candidate. Do NOT speak to them.
Output a JSON array of brief observations across these dimensions:
${DIMENSIONS.join(", ")}.

Format: [{"dimension":"...", "note":"..."}, ...]
Maximum 3 observations. Each note <= 20 words. JSON only, no prose.`;

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model,
      max_tokens: 350,
      system,
      messages: [{ role: "user", content: SHARED_CONTEXT(req, lang) }],
    });
    const block = result.content[0];
    if (block.type !== "text") return { observations: [] };
    const obs = parseJsonArray(block.text);
    return { observations: obs };
  } catch {
    return { observations: [] };
  }
}

/* -------------------------------------------------------------------------- */
/* milestone — Sonnet, may surface ONE probe                                   */
/* -------------------------------------------------------------------------- */

export async function milestone(
  req: CodeJudgeRequest,
  apiKey: string,
  model: string,
  lang: "en" | "es",
): Promise<CodeJudgeMilestoneResponse> {
  const probeRules =
    lang === "es"
      ? "El probe debe sentirse natural: una sola pregunta, conversacional, NO didáctica. Ejemplo: '¿Cuál crees que sería la complejidad de ese loop?' o '¿Probaste con input vacío?'"
      : "The probe should feel natural: a single question, conversational, NOT didactic. Example: 'What's the time complexity of that inner loop?' or 'Did you consider the empty input case?'";

  const system = `You are a senior interviewer at a hitting a milestone in the candidate's coding session.
Decide whether to ask ONE probing question. Be sparing — most milestones get probe=null.
Probe only if there's a real gap worth surfacing right now (missed edge case, vague approach, untested complexity).

${probeRules}

Output JSON ONLY in this shape:
{
  "probe": "string or null",
  "observations": [{"dimension":"...", "note":"..."}, ...]
}

Maximum 3 observations. JSON only, no prose, no markdown fences.`;

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model,
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: SHARED_CONTEXT(req, lang) }],
    });
    const block = result.content[0];
    if (block.type !== "text") return { probe: null, observations: [] };
    const parsed = parseJsonObject(block.text);
    return {
      probe: typeof parsed.probe === "string" && parsed.probe.trim() ? parsed.probe : null,
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
    };
  } catch {
    return { probe: null, observations: [] };
  }
}

/* -------------------------------------------------------------------------- */
/* submit — Byteboard 5-dim rubric, full CodeVerdict                           */
/* -------------------------------------------------------------------------- */

const RUBRIC_EXAMPLE = `EXAMPLE OUTPUT (for a candidate who built two-sum with hash map and stated O(n)):
{
  "scores": {
    "problem_understanding": {"score": 5, "evidence": "Asked about negative numbers and duplicates before coding."},
    "approach_quality": {"score": 5, "evidence": "Chose hash-map for O(n) instead of brute O(n²)."},
    "code_quality": {"score": 4, "evidence": "Clean code, but used 'd' as variable name."},
    "testing_rigor": {"score": 3, "evidence": "Ran provided tests; did not add an empty-array test."},
    "communication": {"score": 4, "evidence": "Stated complexity correctly. Quiet for 40s mid-implementation."}
  },
  "tests_passed": 3,
  "tests_total": 3,
  "complexity_stated": "O(n)",
  "complexity_actual": "O(n)",
  "one_line_improvement": "Add one edge-case test before declaring done.",
  "verdict_language": "en"
}`;

export async function submitVerdict(
  req: CodeJudgeRequest,
  apiKey: string,
  model: string,
  lang: "en" | "es",
): Promise<CodeVerdict | { error: string; raw?: string }> {
  const system = `You are an expert technical interviewer scoring a candidate's full coding turn using the Byteboard rubric.

Score each of these 5 dimensions 0-5 with a one-line evidence quote anchored in what the candidate did/said:
${DIMENSIONS.map((d) => `- ${d}`).join("\n")}

Also fill: tests_passed, tests_total, complexity_stated (what THEY said, not your inference — null if they never said), complexity_actual (your read), one_line_improvement (the single most-leveraged thing for them to fix), verdict_language ("${lang}").

${RUBRIC_EXAMPLE}

Output ONLY JSON matching the example shape. No prose, no markdown fences. Evidence quotes in the candidate's language (${lang}).`;

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model,
      max_tokens: 900,
      system,
      messages: [{ role: "user", content: SHARED_CONTEXT(req, lang) }],
    });
    const block = result.content[0];
    if (block.type !== "text") return { error: "unexpected response type" };
    const parsed = parseJsonObject(block.text);
    if (!parsed.scores) return { error: "missing scores", raw: block.text.slice(0, 400) };
    return parsed as unknown as CodeVerdict;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "judge failed" };
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

export function detectLanguage(transcript: string): "en" | "es" {
  if (!transcript || transcript.length < 5) return "en";
  // Cheap heuristic: count common Spanish stopwords vs English.
  const es = (transcript.match(/\b(el|la|los|las|de|que|y|un|una|para|con|esto|esta|si|cómo|qué|porque|entonces|también|aquí|hace|tener|hacer)\b/gi) || []).length;
  const en = (transcript.match(/\b(the|and|of|to|in|that|is|it|for|with|this|how|what|because|then|also|here|do|have|make)\b/gi) || []).length;
  return es > en ? "es" : "en";
}

function parseJsonArray(text: string): { dimension: string; note: string }[] {
  let t = text.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  try {
    const v = JSON.parse(t);
    return Array.isArray(v) ? v : [];
  } catch {
    const m = t.match(/\[[\s\S]*\]/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return [];
      }
    }
    return [];
  }
}

function parseJsonObject(text: string): Record<string, unknown> {
  let t = text.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(t);
  } catch {
    const m = t.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return {};
      }
    }
    return {};
  }
}
