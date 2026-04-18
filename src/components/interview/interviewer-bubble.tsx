"use client";

import { Volume2 } from "lucide-react";
import { speak } from "@/lib/audio/speech-synthesis";

interface InterviewerBubbleProps {
  text: string;
  isStreaming?: boolean;
  ttsEnabled?: boolean;
}

export function InterviewerBubble({ text, isStreaming, ttsEnabled }: InterviewerBubbleProps) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold uppercase tracking-widest"
        style={{
          background: "var(--color-oxblood)",
          color: "var(--color-bone)",
        }}
      >
        IV
      </span>
      <div className="max-w-[80%] space-y-1.5">
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "var(--surface-accent)",
            color: "var(--surface-ink)",
            fontFamily: "var(--font-inter-tight)",
          }}
        >
          {text}
          {isStreaming && (
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-4 w-[3px] animate-pulse align-middle"
              style={{ background: "var(--color-oxblood)" }}
            />
          )}
        </div>
        {ttsEnabled && text && !isStreaming && (
          <button
            type="button"
            onClick={() => speak(text)}
            aria-label="Replay this question"
            className="flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{ color: "var(--color-deep-green)" }}
          >
            <Volume2 className="h-3 w-3" aria-hidden="true" />
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
