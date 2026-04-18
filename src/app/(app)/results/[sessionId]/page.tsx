"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, RotateCcw, ArrowLeft } from "lucide-react";
import { ScoreCard } from "@/components/interview/score-card";
import { CodeVerdictCard } from "@/components/interview/code-verdict";
import { ReplayPlayer } from "@/components/interview/replay-player";
import { aggregateScores } from "@/lib/interview/scoring";
import {
  isCodingQuestion,
  type TurnRecord,
  type JudgeVerdict,
  type CodeVerdict,
  type AggregateScores,
} from "@/types/interview";

function isCodeVerdict(v: unknown): v is CodeVerdict {
  return !!v && typeof v === "object" && "scores" in (v as Record<string, unknown>);
}

function questionLabel(turn: TurnRecord): string {
  if (isCodingQuestion(turn.questionMeta)) {
    return `${turn.questionMeta.title} (${turn.questionMeta.language})`;
  }
  return turn.questionMeta.question;
}

function scoreColor(value: number): string {
  if (value >= 4) return "var(--color-deep-green)";
  if (value >= 3) return "var(--color-oxblood)";
  return "var(--color-coral)";
}

function ScoreSummary({ scores }: { scores: AggregateScores }) {
  const axes = [
    { label: "Domain", value: scores.domain_expertise },
    { label: "English", value: scores.english_fluency },
    { label: "Structure", value: scores.structure },
    { label: "Confidence", value: scores.confidence },
  ];

  return (
    <section
      className="rounded-2xl border p-6 sm:p-8"
      style={{
        borderColor: "var(--hairline)",
        background: "var(--surface-soft)",
      }}
    >
      <div className="flex items-center justify-between">
        <h2
          className="font-mono text-xs uppercase tracking-[0.22em]"
          style={{ color: "var(--color-oxblood)" }}
        >
          Session summary
        </h2>
        {scores.cefr_mode && (
          <span
            className="rounded-full px-3 py-1 font-mono text-xs font-semibold"
            style={{
              background: "var(--color-oxblood)",
              color: "var(--color-bone)",
            }}
          >
            CEFR {scores.cefr_mode}
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {axes.map(({ label, value }) => (
          <div key={label}>
            <div
              className="font-mono text-4xl"
              style={{ color: scoreColor(value), fontWeight: 600 }}
            >
              {value.toFixed(1)}
            </div>
            <div
              className="mt-1 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "var(--color-deep-green)" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 font-mono text-[11px] uppercase tracking-widest"
        style={{
          borderColor: "var(--hairline)",
          color: "var(--muted)",
        }}
      >
        <span>{scores.turns_scored} questions scored</span>
        <span>{scores.total_words} total words</span>
        <span>
          {scores.total_fillers} fillers ({scores.overall_fillers_per_100_words}/100w)
        </span>
      </div>
    </section>
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
      <div
        className="flex h-[60vh] items-center justify-center font-mono text-xs uppercase tracking-widest"
        style={{ color: "var(--color-deep-green)" }}
      >
        Loading results...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 flex items-baseline justify-between gap-4">
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--color-deep-green)" }}
          >
            How it went
          </p>
          <h1
            className="mt-2 text-4xl tracking-tight sm:text-5xl"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 500,
              color: "var(--color-oxblood)",
            }}
          >
            Read it honest.
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadTranscript}
            aria-label="Download transcript as JSON"
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{
              borderColor: "var(--hairline)",
              color: "var(--color-deep-green)",
              background: "var(--surface-soft)",
            }}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </button>
          <button
            type="button"
            onClick={() => router.push("/setup")}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-transform hover:-translate-y-0.5"
            style={{
              background: "var(--color-coral)",
              color: "var(--color-bone)",
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            New
          </button>
        </div>
      </header>

      <ScoreSummary scores={scores} />

      <section className="mt-12">
        <h3
          className="font-mono text-xs uppercase tracking-[0.22em]"
          style={{ color: "var(--color-deep-green)" }}
        >
          Per-question breakdown
        </h3>
        <div className="mt-4 space-y-3">
          {turns.map((turn, i) => {
            const isErr = !!(turn.judge && typeof turn.judge === "object" && "error" in turn.judge);
            const isExpanded = expandedTurn === i;
            const isCoding = isCodingQuestion(turn.questionMeta);
            let avg = 0;
            if (!isErr) {
              if (isCodeVerdict(turn.judge)) {
                const s = turn.judge.scores;
                avg =
                  (s.problem_understanding.score +
                    s.approach_quality.score +
                    s.code_quality.score +
                    s.testing_rigor.score +
                    s.communication.score) /
                  5;
              } else {
                const v = turn.judge as JudgeVerdict;
                avg = (v.domain_expertise + v.english_fluency + v.structure + v.confidence) / 4;
              }
            }

            const label = questionLabel(turn);
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border"
                style={{
                  borderColor: "var(--hairline)",
                  background: "var(--surface-soft)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedTurn(isExpanded ? null : i)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:opacity-80"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold"
                      style={{
                        background: isCoding ? "var(--color-oxblood)" : "var(--surface-accent)",
                        color: isCoding ? "var(--color-bone)" : "var(--color-deep-green)",
                      }}
                    >
                      {isCoding ? "⌨" : i + 1}
                    </span>
                    <span
                      className="truncate text-sm leading-snug"
                      style={{ color: "var(--surface-ink)" }}
                    >
                      {label.slice(0, 80)}
                      {label.length > 80 ? "..." : ""}
                    </span>
                  </div>
                  {!isErr && (
                    <span
                      className="ml-3 shrink-0 font-mono text-base font-semibold"
                      style={{ color: scoreColor(avg) }}
                    >
                      {avg.toFixed(1)}
                    </span>
                  )}
                </button>

                {isExpanded && (
                  <div
                    className="space-y-4 border-t px-5 py-5"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    {isCoding ? (
                      <>
                        {turn.codeSnapshots && turn.codeSnapshots.length > 0 && turn.language && (
                          <ReplayPlayer
                            snapshots={turn.codeSnapshots}
                            language={turn.language}
                            questionTitle={isCodingQuestion(turn.questionMeta) ? turn.questionMeta.title : "coding"}
                          />
                        )}
                        {isCodeVerdict(turn.judge) && <CodeVerdictCard verdict={turn.judge} />}
                      </>
                    ) : (
                      <>
                        <div>
                          <p
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color: "var(--color-deep-green)" }}
                          >
                            Your response
                          </p>
                          <p
                            className="mt-2 text-sm leading-relaxed"
                            style={{ color: "var(--surface-ink)" }}
                          >
                            {turn.userResponse}
                          </p>
                        </div>
                        {!isErr && !isCodeVerdict(turn.judge) && (
                          <ScoreCard verdict={turn.judge as JudgeVerdict} />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={() => router.push("/setup")}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-oxblood)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Set up another
        </button>
      </div>
    </div>
  );
}
