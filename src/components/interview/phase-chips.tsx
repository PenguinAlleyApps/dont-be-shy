"use client";

/**
 * Phase chips: Clarify · Design · Code · Test
 * The candidate self-declares which phase they're in. Click changes phase
 * and fires a milestone judge call so the interviewer can probe contextually.
 */

import type { CodingPhase } from "@/types/interview";

const PHASES: { id: CodingPhase; label: string; hint: string }[] = [
  { id: "clarify", label: "Clarify", hint: "Ask questions to understand the problem." },
  { id: "design", label: "Design", hint: "Sketch the approach before writing code." },
  { id: "code", label: "Code", hint: "Implement your solution." },
  { id: "test", label: "Test", hint: "Run cases, find edges, fix." },
];

interface PhaseChipsProps {
  active: CodingPhase;
  onChange: (phase: CodingPhase) => void;
  disabled?: boolean;
}

export function PhaseChips({ active, onChange, disabled }: PhaseChipsProps) {
  const activeMeta = PHASES.find((p) => p.id === active) ?? PHASES[0];
  return (
    <div className="space-y-1.5">
      <div
        role="tablist"
        aria-label="Interview phase"
        className="flex flex-wrap gap-1.5"
      >
        {PHASES.map((p, i) => {
          const isActive = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Phase ${i + 1}: ${p.label}. ${p.hint}`}
              disabled={disabled}
              onClick={() => onChange(p.id)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
              style={{
                background: isActive ? "var(--color-oxblood)" : "var(--surface-soft)",
                color: isActive ? "var(--color-bone)" : "var(--surface-ink)",
                border: `1px solid ${isActive ? "var(--color-oxblood)" : "var(--hairline)"}`,
                fontFamily: "var(--font-mono, ui-monospace, monospace)",
                letterSpacing: "0.06em",
              }}
            >
              {`${i + 1}. ${p.label}`}
            </button>
          );
        })}
      </div>
      <p className="text-[11px]" style={{ color: "var(--muted)" }}>
        {activeMeta.hint}
      </p>
    </div>
  );
}
