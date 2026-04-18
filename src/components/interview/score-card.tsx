"use client";

import type { JudgeVerdict } from "@/types/interview";

function scoreColor(value: number): string {
  if (value >= 4) return "var(--color-deep-green)";
  if (value >= 3) return "var(--color-oxblood)";
  return "var(--color-coral)";
}

function ScoreBar({ label, score, max = 5 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = scoreColor(score);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "var(--color-deep-green)" }}
        >
          {label}
        </span>
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: "var(--surface-ink)" }}
        >
          {score}/{max}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full"
        style={{ background: "var(--surface-accent)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

interface ScoreCardProps {
  verdict: JudgeVerdict;
}

export function ScoreCard({ verdict }: ScoreCardProps) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        borderColor: "var(--hairline)",
        background: "var(--surface-soft)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="font-mono text-xs uppercase tracking-[0.22em]"
          style={{ color: "var(--color-oxblood)" }}
        >
          Score
        </h3>
        {verdict.cefr_estimate && (
          <span
            className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
            style={{
              background: "var(--color-oxblood)",
              color: "var(--color-bone)",
            }}
          >
            CEFR {verdict.cefr_estimate}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <ScoreBar label="Domain" score={verdict.domain_expertise} />
        <ScoreBar label="English" score={verdict.english_fluency} />
        <ScoreBar label="Structure" score={verdict.structure} />
        <ScoreBar label="Confidence" score={verdict.confidence} />
      </div>

      {verdict.filler_count > 0 && (
        <p
          className="mt-4 font-mono text-[11px]"
          style={{ color: "var(--muted)" }}
        >
          {verdict.filler_count} fillers in {verdict.word_count} words ({verdict.fillers_per_100_words}/100w)
        </p>
      )}

      {verdict.strengths.length > 0 && (
        <div className="mt-4">
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--color-deep-green)" }}
          >
            Strengths
          </p>
          <ul className="mt-2 space-y-1">
            {verdict.strengths.map((s, i) => (
              <li
                key={i}
                className="text-sm leading-snug"
                style={{ color: "var(--surface-ink)" }}
              >
                · {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {verdict.gaps.length > 0 && (
        <div className="mt-3">
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--color-oxblood)" }}
          >
            Gaps
          </p>
          <ul className="mt-2 space-y-1">
            {verdict.gaps.map((g, i) => (
              <li
                key={i}
                className="text-sm leading-snug"
                style={{ color: "var(--surface-ink)" }}
              >
                · {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {verdict.one_line_improvement && (
        <p
          className="mt-4 border-t pt-3 text-sm leading-snug"
          style={{
            borderColor: "var(--hairline)",
            color: "var(--color-oxblood)",
            fontFamily: "var(--font-fraunces)",
            fontStyle: "italic",
          }}
        >
          → {verdict.one_line_improvement}
        </p>
      )}
    </div>
  );
}
