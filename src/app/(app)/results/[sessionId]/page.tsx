"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, RotateCcw, ArrowLeft } from "lucide-react";
import { ScoreCard } from "@/components/interview/score-card";
import { aggregateScores } from "@/lib/interview/scoring";
import type { TurnRecord, JudgeVerdict, AggregateScores } from "@/types/interview";

function ScoreSummary({ scores }: { scores: AggregateScores }) {
  const axes = [
    { label: "Domain Expertise", value: scores.domain_expertise },
    { label: "English Fluency", value: scores.english_fluency },
    { label: "Structure", value: scores.structure },
    { label: "Confidence", value: scores.confidence },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Session Summary</h2>
        {scores.cefr_mode && (
          <span className="rounded-full bg-indigo-100 px-3 py-1 font-mono text-sm font-bold text-indigo-700">
            CEFR {scores.cefr_mode}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {axes.map(({ label, value }) => {
          const color =
            value >= 4
              ? "text-emerald-600"
              : value >= 3
                ? "text-amber-600"
                : "text-red-600";
          return (
            <div key={label} className="text-center">
              <div className={`font-mono text-3xl font-bold ${color}`}>
                {value.toFixed(1)}
              </div>
              <div className="mt-1 text-xs text-slate-500">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 border-t border-slate-100 pt-4 font-mono text-xs text-slate-500">
        <span>{scores.turns_scored} questions scored</span>
        <span>{scores.total_words} total words</span>
        <span>{scores.total_fillers} fillers ({scores.overall_fillers_per_100_words}/100w)</span>
      </div>
    </div>
  );
}

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [scores, setScores] = useState<AggregateScores | null>(null);
  const [expandedTurn, setExpandedTurn] = useState<number | null>(null);

  useEffect(() => {
    params.then(({ sessionId: id }) => {
      setSessionId(id);
      const raw = sessionStorage.getItem(`dont-be-shy-results-${id}`);
      if (!raw) {
        router.push("/setup");
        return;
      }
      const data = JSON.parse(raw);
      setTurns(data.turns);
      setScores(aggregateScores(data.turns));
    });
  }, [params, router]);

  function downloadTranscript() {
    const blob = new Blob(
      [JSON.stringify({ sessionId, turns, scores }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dont-be-shy-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!scores) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400">
        Loading results...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Interview Results</h1>
        <div className="flex gap-2">
          <button
            onClick={downloadTranscript}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={() => router.push("/setup")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <RotateCcw className="h-4 w-4" />
            New Interview
          </button>
        </div>
      </div>

      <ScoreSummary scores={scores} />

      {/* Per-turn breakdown */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Per-question breakdown
        </h3>
        {turns.map((turn, i) => {
          const hasVerdict = !("error" in turn.judge);
          const isExpanded = expandedTurn === i;

          return (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => setExpandedTurn(isExpanded ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 font-mono text-xs font-bold text-indigo-700">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700">
                    {turn.questionMeta.question.slice(0, 80)}
                    {turn.questionMeta.question.length > 80 ? "..." : ""}
                  </span>
                </div>
                {hasVerdict && (
                  <span className="ml-2 shrink-0 font-mono text-sm font-semibold text-slate-600">
                    {(
                      ((turn.judge as JudgeVerdict).domain_expertise +
                        (turn.judge as JudgeVerdict).english_fluency +
                        (turn.judge as JudgeVerdict).structure +
                        (turn.judge as JudgeVerdict).confidence) /
                      4
                    ).toFixed(1)}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="space-y-3 border-t border-slate-100 px-4 py-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Your response</p>
                    <p className="mt-1 text-sm text-slate-700">{turn.userResponse}</p>
                  </div>
                  {hasVerdict && <ScoreCard verdict={turn.judge as JudgeVerdict} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/setup")}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to setup
        </button>
      </div>
    </div>
  );
}
