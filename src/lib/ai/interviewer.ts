/**
 * Interviewer agent — Claude drives the mock interview conversation.
 * Ported from modules/consulting/interview_prep/src/interviewer.py.
 */

import Anthropic from "@anthropic-ai/sdk";
import { RUBRIC } from "./rubric";
import type { InterviewQuestion, ConversationMessage } from "@/types/interview";

export function buildSystemPrompt(
  personaText: string,
  questions: InterviewQuestion[],
): string {
  return `You are running a mock interview in ENGLISH ONLY.

PERSONA (follow this exactly):
${personaText}

QUESTION BANK to draw from for this session (ask these in order, adapting based on candidate answers):
${JSON.stringify(questions, null, 2)}

RULES FOR YOUR OUTPUT:
- Plain text only. No markdown. No emojis. No lists with dashes or numbers. Your text will be spoken aloud by a TTS engine — write for the ear.
- 1 to 3 sentences per turn. Max 5. Long paragraphs sound unnatural when spoken.
- Ask ONE question at a time. Never stack.
- Start the session with a warm 30-second opener: introduce yourself, invite a brief self-intro.
- After each candidate answer, react briefly (1 sentence acknowledgement OR one clarifying follow-up), then ask the next question from the bank.
- When you reach the end of the question bank, close: invite candidate's own questions, respond briefly, thank them.
- Do NOT coach or give feedback mid-interview. That is the Judge's job, separate.
- Do NOT score out loud. Do NOT reveal the rubric.
- If candidate switches to another language, gently redirect to English.
- If candidate goes silent, wait once, then gently prompt: "Take your time" or "Would you like me to rephrase?"

RUBRIC (for your internal awareness only — never lecture on it):
${RUBRIC}

End each turn with a clear question mark or a handoff cue. Do not end with a trailing comment that invites confusion.`;
}

/** Get next interviewer utterance (non-streaming). */
export async function nextTurn(
  conversation: ConversationMessage[],
  system: string,
  apiKey: string,
  model: string,
  maxTokens = 500,
): Promise<string> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: conversation,
  });

  const block = response.content[0];
  if (block.type === "text") return block.text.trim();
  return "";
}

/** Get next interviewer utterance as a ReadableStream for streaming to client. */
export function nextTurnStream(
  conversation: ConversationMessage[],
  system: string,
  apiKey: string,
  model: string,
  maxTokens = 500,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const client = new Anthropic({ apiKey });
        const stream = client.messages.stream({
          model,
          max_tokens: maxTokens,
          system,
          messages: conversation,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
