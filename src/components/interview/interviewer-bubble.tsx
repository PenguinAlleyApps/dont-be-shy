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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
        IV
      </div>
      <div className="max-w-[80%] space-y-1">
        <div className="rounded-2xl rounded-tl-sm bg-indigo-50 px-4 py-3 text-sm text-slate-800">
          {text}
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-indigo-400 align-middle" />
          )}
        </div>
        {ttsEnabled && text && !isStreaming && (
          <button
            onClick={() => speak(text)}
            className="flex items-center gap-1 px-1 text-xs text-slate-400 transition-colors hover:text-indigo-600"
          >
            <Volume2 className="h-3 w-3" />
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
