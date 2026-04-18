"use client";

/**
 * Coding panel orchestrator.
 *
 * Layout: prompt + phase chips on top, editor + run/submit buttons in middle,
 * test results panel at the bottom. The judge runs in three modes:
 *   - milestone (Sonnet) on phase change, run, idle 60s
 *   - submit    (Sonnet) on Submit click → returns CodeVerdict
 * Probes from milestones surface as a small italic notice above the editor;
 * the parent (interview-client) is responsible for rendering them in the chat
 * if voice mode is active.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Send, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { PhaseChips } from "./phase-chips";
import type {
  CodingPhase,
  CodingQuestion,
  CodeSnapshot,
  CodeVerdict,
  ExecutionResult,
  TestResult,
} from "@/types/interview";
import { executeInBrowser } from "@/lib/sandbox";

const CodeEditor = dynamic(() => import("./code-editor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[380px] items-center justify-center rounded-xl border"
      style={{ borderColor: "var(--hairline)", background: "var(--surface-soft)" }}
    >
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-oxblood)" }} />
    </div>
  ),
});

const IDLE_PROBE_MS = 60_000;

interface CodingPanelProps {
  question: CodingQuestion;
  /** What the candidate has been saying (passed in by interview-client). */
  recentTranscript: string;
  onSubmit: (payload: {
    finalCode: string;
    testResults: TestResult[];
    verdict: CodeVerdict | { error: string; raw?: string };
    snapshots: CodeSnapshot[];
    durationMs: number;
  }) => void;
  disabled?: boolean;
  /** When set, surface this probe as a small italic notice. Parent clears after speaking. */
  externalProbe?: string | null;
  /** Callback when the judge surfaces a probe — parent decides whether to speak it. */
  onProbe?: (probe: string) => void;
}

export function CodingPanel({
  question,
  recentTranscript,
  onSubmit,
  disabled,
  externalProbe,
  onProbe,
}: CodingPanelProps) {
  const [code, setCode] = useState(question.starterCode);
  const [phase, setPhase] = useState<CodingPhase>("clarify");
  const [snapshots, setSnapshots] = useState<CodeSnapshot[]>([]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [stderr, setStderr] = useState<string>("");
  const [internalProbe, setInternalProbe] = useState<string | null>(null);

  const startedAtRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef(recentTranscript);

  useEffect(() => {
    transcriptRef.current = recentTranscript;
  }, [recentTranscript]);

  /* ------------------ Snapshot capture ------------------------------- */

  const captureSnapshot = useCallback(
    (next: string, currentPhase: CodingPhase) => {
      const snap: CodeSnapshot = {
        ts: Date.now() - startedAtRef.current,
        code: next,
        phase: currentPhase,
      };
      setSnapshots((prev) => [...prev, snap]);
    },
    [],
  );

  const handleEditorChange = useCallback(
    (next: string) => {
      setCode(next);
      captureSnapshot(next, phase);
      // reset idle timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (phase === "code") {
        idleTimerRef.current = setTimeout(() => {
          fireMilestone("idle_60s").catch(() => {});
        }, IDLE_PROBE_MS);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, captureSnapshot],
  );

  /* ------------------ Judge milestone (Sonnet, may probe) ----------- */

  const fireMilestone = useCallback(
    async (reason: "phase_change" | "test_run" | "idle_60s" | "function_complete") => {
      try {
        const res = await fetch("/api/interview/code-judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "milestone",
            phase,
            question,
            code,
            transcript: transcriptRef.current,
            testResults: testResults ?? undefined,
            milestoneReason: reason,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { probe: string | null };
        if (data.probe) {
          setInternalProbe(data.probe);
          onProbe?.(data.probe);
        }
      } catch (err) {
        console.warn("[milestone]", err);
      }
    },
    [phase, question, code, testResults, onProbe],
  );

  function handlePhaseChange(next: CodingPhase) {
    if (next === phase) return;
    setPhase(next);
    captureSnapshot(code, next);
    fireMilestone("phase_change").catch(() => {});
  }

  /* ------------------ Run code (browser sandbox) ---------------------- */

  async function handleRun() {
    setRunning(true);
    setStderr("");
    try {
      const result: ExecutionResult = await executeInBrowser({
        language: question.language,
        code,
        testCases: question.testCases,
      });
      setTestResults(result.results);
      if (result.systemError) setStderr(`[runtime] ${result.systemError}`);
      else if (result.stderr) setStderr(result.stderr);
      // Switch to Test phase automatically on first run
      if (phase !== "test") {
        setPhase("test");
        captureSnapshot(code, "test");
      }
      // Fire milestone — judge sees the test results too
      fireMilestone("test_run").catch(() => {});
    } catch (err) {
      setStderr(err instanceof Error ? err.message : "execution failed");
    } finally {
      setRunning(false);
    }
  }

  /* ------------------ Submit (Sonnet, full Byteboard) ---------------- */

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // Snapshot final state
      captureSnapshot(code, phase);

      const judgeRes = await fetch("/api/interview/code-judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          phase,
          question,
          code,
          transcript: transcriptRef.current,
          testResults: testResults ?? undefined,
        }),
      });
      const verdict = (await judgeRes.json()) as CodeVerdict | { error: string };
      onSubmit({
        finalCode: code,
        testResults: testResults ?? [],
        verdict,
        snapshots,
        durationMs: Date.now() - startedAtRef.current,
      });
    } catch (err) {
      onSubmit({
        finalCode: code,
        testResults: testResults ?? [],
        verdict: { error: err instanceof Error ? err.message : "submit failed" },
        snapshots,
        durationMs: Date.now() - startedAtRef.current,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const probe = externalProbe ?? internalProbe;
  const passedCount = testResults?.filter((t) => t.passed).length ?? 0;
  const totalCount = testResults?.length ?? 0;

  return (
    <div className="space-y-3">
      {/* Prompt + phase chips */}
      <div
        className="rounded-2xl border p-4"
        style={{
          borderColor: "var(--hairline)",
          background: "var(--surface-soft)",
        }}
      >
        <div className="flex items-baseline justify-between">
          <h3
            className="text-base"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 500,
              color: "var(--surface-ink)",
            }}
          >
            {question.title}
          </h3>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--color-deep-green)" }}
          >
            {question.difficulty} · {question.language}
          </span>
        </div>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--surface-ink)" }}
        >
          {question.prompt}
        </p>
        <div className="mt-3">
          <PhaseChips active={phase} onChange={handlePhaseChange} disabled={disabled || submitting} />
        </div>
      </div>

      {/* Probe banner (italic, soft) */}
      {probe && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          role="status"
          style={{
            background: "var(--surface-accent)",
            borderLeft: "3px solid var(--color-oxblood)",
            color: "var(--surface-ink)",
            fontFamily: "var(--font-fraunces)",
            fontStyle: "italic",
          }}
        >
          {probe}
        </div>
      )}

      {/* Editor */}
      <CodeEditor
        language={question.language}
        initial={question.starterCode}
        onChange={handleEditorChange}
        readOnly={submitting}
      />

      {/* Run / Submit */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={disabled || running || submitting}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          style={{
            background: "var(--surface)",
            color: "var(--color-oxblood)",
            border: "1px solid var(--color-oxblood)",
          }}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || running || submitting}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          style={{
            background: "var(--color-coral)",
            color: "var(--color-bone)",
          }}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit
        </button>
        {testResults && (
          <span
            className="ml-auto font-mono text-xs"
            style={{
              color:
                passedCount === totalCount
                  ? "var(--color-deep-green)"
                  : "var(--color-oxblood)",
            }}
          >
            {passedCount}/{totalCount} passed
          </span>
        )}
      </div>

      {/* Test results */}
      {testResults && (
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: "var(--hairline)",
            background: "var(--surface-soft)",
          }}
        >
          <ul className="space-y-1.5 text-xs font-mono">
            {testResults.map((tr, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span
                  style={{
                    color: tr.passed ? "var(--color-deep-green)" : "var(--color-coral)",
                    fontWeight: 600,
                  }}
                >
                  {tr.passed ? "✓" : "✗"}
                </span>
                <span style={{ color: "var(--surface-ink)" }}>{tr.name}</span>
                {!tr.passed && (
                  <span style={{ color: "var(--muted)" }}>
                    expected {tr.expected.slice(0, 40)} got {tr.actual.slice(0, 40) || "(nothing)"}
                  </span>
                )}
                {tr.error && (
                  <span style={{ color: "var(--color-coral)" }}>err: {tr.error.slice(0, 60)}</span>
                )}
              </li>
            ))}
          </ul>
          {stderr && (
            <pre
              className="mt-2 overflow-auto rounded p-2 text-[11px]"
              style={{
                background: "var(--surface-accent)",
                color: "var(--color-oxblood)",
                maxHeight: "100px",
              }}
            >
              {stderr.slice(0, 500)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
