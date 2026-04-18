"use client";

/**
 * Renders a Byteboard-style 5-dim CodeVerdict:
 *  - 5 horizontal score bars with one-line evidence quote
 *  - tests passed / total
 *  - complexity comparison (stated vs actual) when applicable
 *  - one-line improvement
 */

import type { CodeVerdict } from "@/types/interview";

const DIM_LABELS: Record<keyof CodeVerdict["scores"], string> = {
  problem_understanding: "Problem understanding",
  approach_quality: "Approach quality",
  code_quality: "Code quality",
  testing_rigor: "Testing rigor",
  communication: "Communication",
};

function scoreColor(score: number): string {
  if (score >= 4.5) return "var(--color-deep-green)";
  if (score >= 3.5) return "var(--color-oxblood)";
  return "var(--color-coral)";
}

interface CodeVerdictProps {
  verdict: CodeVerdict;
}

export function CodeVerdictCard({ verdict }: CodeVerdictProps) {
  const dims = Object.entries(verdict.scores) as [
    keyof CodeVerdict["scores"],
    { score: number; evidence: string },
  ][];

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        borderColor: "var(--hairline)",
        background: "var(--surface-soft)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "var(--color-deep-green)" }}
        >
          Coding verdict
        </p>
        <span
          className="rounded-full px-2.5 py-0.5 font-mono text-[11px]"
          style={{
            background:
              verdict.tests_passed === verdict.tests_total
                ? "var(--color-deep-green)"
                : "var(--color-oxblood)",
            color: "var(--color-bone)",
          }}
        >
          {verdict.tests_passed} / {verdict.tests_total} tests
        </span>
      </div>

      <div className="space-y-3">
        {dims.map(([dim, { score, evidence }]) => (
          <div key={dim}>
            <div className="flex items-baseline justify-between">
              <span
                className="text-xs"
                style={{ color: "var(--surface-ink)" }}
              >
                {DIM_LABELS[dim]}
              </span>
              <span
                className="font-mono text-xs"
                style={{ color: scoreColor(score), fontWeight: 600 }}
              >
                {score.toFixed(1)} / 5
              </span>
            </div>
            <div
              className="mt-1 h-1 overflow-hidden rounded-full"
              style={{ background: "var(--surface-accent)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(score / 5) * 100}%`,
                  background: scoreColor(score),
                }}
              />
            </div>
            {evidence && (
              <blockquote
                className="mt-1 border-l-2 pl-2 text-[11px] italic"
                style={{
                  borderColor: "var(--hairline)",
                  color: "var(--muted)",
                  fontFamily: "var(--font-fraunces)",
                }}
              >
                {evidence}
              </blockquote>
            )}
          </div>
        ))}
      </div>

      {(verdict.complexity_stated || verdict.complexity_actual) && (
        <div
          className="mt-4 rounded-lg px-3 py-2 text-[11px] font-mono"
          style={{
            background: "var(--surface-accent)",
            color: "var(--surface-ink)",
          }}
        >
          <div>
            stated:{" "}
            <span style={{ color: "var(--color-deep-green)" }}>
              {verdict.complexity_stated || "(not stated)"}
            </span>
          </div>
          <div>
            actual:{" "}
            <span style={{ color: "var(--color-oxblood)" }}>
              {verdict.complexity_actual || "(unclear)"}
            </span>
          </div>
        </div>
      )}

      {verdict.one_line_improvement && (
        <p
          className="mt-4 text-sm"
          style={{
            color: "var(--surface-ink)",
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
