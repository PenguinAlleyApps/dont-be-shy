"use client";

import { Mic, Keyboard } from "lucide-react";
import { BreathingWaveform } from "@/components/brand/breathing-waveform";

interface ModeSelectorProps {
  mode: "voice" | "text";
  onSelect: (mode: "voice" | "text") => void;
}

interface RowProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  caption: string;
  isVoice?: boolean;
}

function Row({ active, onClick, icon, title, caption, isVoice }: RowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="relative flex h-16 w-full items-center gap-4 px-5 text-left transition-colors"
      style={{
        borderLeft: active ? "2px solid var(--color-oxblood)" : "2px solid transparent",
        background: isVoice ? "rgba(255, 94, 71, 0.05)" : "transparent",
      }}
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        style={{ color: active ? "var(--color-oxblood)" : "var(--muted)" }}
      >
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span
          className="text-[15px] font-medium"
          style={{ color: "var(--surface-ink)", fontFamily: "var(--font-inter-tight)" }}
        >
          {title}
        </span>
        <span
          className="text-[13px]"
          style={{ color: "var(--muted)", fontFamily: "var(--font-inter-tight)" }}
        >
          {caption}
        </span>
      </span>

      {isVoice && (
        <span aria-hidden="true" className="w-12 shrink-0 opacity-80">
          <BreathingWaveform color="var(--color-oxblood)" bars={24} />
        </span>
      )}

      <span
        aria-hidden="true"
        className="ml-2 h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          background: active ? "var(--color-oxblood)" : "transparent",
          border: active ? "none" : "1px solid var(--hairline)",
        }}
      />
    </button>
  );
}

export function ModeSelector({ mode, onSelect }: ModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Response mode"
      style={{
        border: "1px solid var(--hairline)",
      }}
    >
      <Row
        active={mode === "voice"}
        onClick={() => onSelect("voice")}
        icon={<Mic className="h-5 w-5" aria-hidden="true" />}
        title="Voice"
        caption="Spoken answers, live transcription. Chrome or Edge."
        isVoice
      />
      <div style={{ height: 1, background: "var(--hairline)" }} aria-hidden="true" />
      <Row
        active={mode === "text"}
        onClick={() => onSelect("text")}
        icon={<Keyboard className="h-5 w-5" aria-hidden="true" />}
        title="Text"
        caption="Type if you'd rather. Works in any browser."
      />
    </div>
  );
}
