"use client";

/**
 * Replay player — scrubable timeline of code snapshots.
 * Shows the candidate's code mutating step-by-step, no audio in v0.9.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { CodeSnapshot, CodingLanguage } from "@/types/interview";

const CodeEditor = dynamic(() => import("./code-editor").then((m) => m.CodeEditor), {
  ssr: false,
});

interface ReplayPlayerProps {
  snapshots: CodeSnapshot[];
  language: CodingLanguage;
  questionTitle: string;
}

export function ReplayPlayer({ snapshots, language, questionTitle }: ReplayPlayerProps) {
  const [idx, setIdx] = useState(snapshots.length - 1);
  const current = snapshots[idx] ?? snapshots[snapshots.length - 1];

  const phaseColors: Record<string, string> = useMemo(
    () => ({
      clarify: "var(--color-deep-green)",
      design: "var(--color-oxblood)",
      code: "var(--color-coral)",
      test: "var(--surface-ink)",
    }),
    [],
  );

  if (!snapshots.length) {
    return (
      <p
        className="font-mono text-[11px]"
        style={{ color: "var(--muted)" }}
      >
        No replay snapshots for this turn.
      </p>
    );
  }

  const elapsedSec = ((current?.ts ?? 0) / 1000).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "var(--color-deep-green)" }}
        >
          Replay — {questionTitle}
        </p>
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--muted)" }}
        >
          {idx + 1} / {snapshots.length} · {elapsedSec}s
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={snapshots.length - 1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          aria-label="Replay timeline"
          className="flex-1"
          style={{ accentColor: "var(--color-oxblood)" }}
        />
        {current && (
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{
              background: phaseColors[current.phase] || "var(--surface-soft)",
              color: "var(--color-bone)",
            }}
          >
            {current.phase}
          </span>
        )}
      </div>

      {current && (
        <CodeEditor
          language={language}
          initial={current.code}
          onChange={() => {
            /* read-only */
          }}
          readOnly
        />
      )}
    </div>
  );
}
