/**
 * Generate a question bank dynamically from a job description.
 * Returns questions in the same schema as the static templates.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { QuestionMeta } from "@/types/interview";

const QUESTION_GENERATION_PROMPT = `You are a senior interviewer designing questions for a mock interview simulator.

Given a job title and optional job description, generate a question bank as a JSON array.

Each question MUST follow this exact schema:
{
  "id": "category-NNN",
  "category": "string (e.g. 'technical', 'behavioral', 'scenario', 'domain', 'closing')",
  "difficulty": "easy|medium|hard",
  "question": "The full interview question as a single sentence or short paragraph",
  "good_answer_signals": ["signal 1", "signal 2", "signal 3"],
  "followup": "A follow-up question to dig deeper, or null"
}

RULES:
- Generate 8-12 questions total
- Mix categories: ~40% domain/technical, ~20% behavioral, ~20% scenario/case, ~10% culture-fit, ~10% closing
- Difficulty distribution: 2 easy, 4-6 medium, 2-3 hard
- Questions must be SPECIFIC to the role and industry — never generic
- good_answer_signals: 3-5 concrete things a strong candidate would mention
- Always include exactly 1 "closing" category question asking the candidate what questions they have
- For non-technical roles: replace "technical" with role-appropriate domain questions (e.g., metrics for marketing, stakeholder management for PM, pipeline for sales)
- Return ONLY the JSON array. No prose, no markdown fences.`;

export async function generateQuestions(
  jobTitle: string,
  apiKey: string,
  model: string,
  jobDescription?: string,
  count?: number,
): Promise<QuestionMeta[]> {
  const client = new Anthropic({ apiKey });

  let userPrompt = `Generate a question bank for:\n\nJob Title: ${jobTitle}`;
  if (count) userPrompt += `\nNumber of questions: ${count}`;
  if (jobDescription) userPrompt += `\n\nFull Job Description:\n${jobDescription}`;

  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system: QUESTION_GENERATION_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") return [];

  let text = block.text.trim();

  // Strip code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(text) as QuestionMeta[];
  } catch {
    // Try to extract array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as QuestionMeta[];
      } catch {
        return [];
      }
    }
    return [];
  }
}
