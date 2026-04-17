"use client";

import type { JudgeVerdict } from "@/types/interview";

function ScoreBar({ label, score, max = 5 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color =
    score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono font-semibold text-slate-800">
          {score}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Score</h3>
        {verdict.cefr_estimate && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">
            CEFR {verdict.cefr_estimate}
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        <ScoreBar label="Domain Expertise" score={verdict.domain_expertise} />
        <ScoreBar label="English Fluency" score={verdict.english_fluency} />
        <ScoreBar label="Structure" score={verdict.structure} />
        <ScoreBar label="Confidence" score={verdict.confidence} />
      </div>

      {verdict.filler_count > 0 && (
        <p className="mt-3 font-mono text-xs text-slate-400">
          {verdict.filler_count} fillers in {verdict.word_count} words (
          {verdict.fillers_per_100_words}/100w)
        </p>
      )}

      {verdict.strengths.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-emerald-700">Strengths</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {verdict.strengths.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {verdict.gaps.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-amber-700">Gaps</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {verdict.gaps.map((g, i) => (
              <span
                key={i}
                className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {verdict.one_line_improvement && (
        <p className="mt-3 border-t border-slate-100 pt-2 text-xs font-medium text-indigo-700">
          {verdict.one_line_improvement}
        </p>
      )}
    </div>
  );
}
