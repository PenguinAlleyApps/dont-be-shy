"use client";

import { Mic, Keyboard } from "lucide-react";

interface ModeSelectorProps {
  mode: "voice" | "text";
  onSelect: (mode: "voice" | "text") => void;
}

interface OptionProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  caption: string;
  ariaLabel: string;
}

function Option({ active, onClick, icon, title, caption, ariaLabel }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className="flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        borderColor: active ? "var(--color-oxblood)" : "var(--color-charcoal-soft)",
        background: active ? "var(--color-bone-200)" : "var(--color-bone-50)",
        borderWidth: active ? "2px" : "1px",
        padding: active ? "19px" : "20px",
      }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{
          background: active ? "var(--color-oxblood)" : "var(--color-bone-200)",
          color: active ? "var(--color-bone)" : "var(--color-deep-green)",
        }}
      >
        {icon}
      </span>
      <span
        className="text-lg"
        style={{
          fontFamily: "var(--font-fraunces)",
          fontWeight: 500,
          color: "var(--color-charcoal)",
        }}
      >
        {title}
      </span>
      <span className="text-sm leading-snug" style={{ color: "var(--color-charcoal-soft)" }}>
        {caption}
      </span>
    </button>
  );
}

export function ModeSelector({ mode, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Option
        active={mode === "voice"}
        onClick={() => onSelect("voice")}
        icon={<Mic className="h-5 w-5" aria-hidden="true" />}
        title="Voice"
        caption="Speak your answers naturally. Requires Chrome or Edge."
        ariaLabel="Use voice mode"
      />
      <Option
        active={mode === "text"}
        onClick={() => onSelect("text")}
        icon={<Keyboard className="h-5 w-5" aria-hidden="true" />}
        title="Text"
        caption="Type your responses. Works in any browser."
        ariaLabel="Use text mode"
      />
    </div>
  );
}
