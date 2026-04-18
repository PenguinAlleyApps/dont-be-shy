"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InterviewerBubble } from "@/components/interview/interviewer-bubble";
import { UserInput } from "@/components/interview/user-input";
import { ScoreCard } from "@/components/interview/score-card";
import { CodingPanel } from "@/components/interview/coding-panel";
import { CodeVerdictCard } from "@/components/interview/code-verdict";
import { Loader2, ArrowRight } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/audio/speech-synthesis";
import {
  isCodingQuestion,
  type InterviewQuestion,
  type ConversationMessage,
  type TurnRecord,
  type JudgeVerdict,
  type CodeVerdict,
  type CodeSnapshot,
  type TestResult,
} from "@/types/interview";

type InterviewPhase = "loading" | "interviewer" | "user" | "judging" | "complete";

interface SessionData {
  sessionId: string;
  persona: string;
  questions: InterviewQuestion[];
  system: string;
  openingMessage: string;
  mode: "voice" | "text";
  jobTitle: string;
  questionCount: number;
  isDemo: boolean;
  apiKey?: string;
}

function isCodeVerdict(v: unknown): v is CodeVerdict {
  return !!v && typeof v === "object" && "scores" in (v as Record<string, unknown>);
}

export function InterviewClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [phase, setPhase] = useState<InterviewPhase>("loading");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [streamingText, setStreamingText] = useState("");
  const [latestVerdict, setLatestVerdict] = useState<JudgeVerdict | null>(null);
  const [latestCodeVerdict, setLatestCodeVerdict] = useState<CodeVerdict | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recentTranscriptRef = useRef<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem(`dont-be-shy-session-${sessionId}`);
    if (!raw) {
      router.push("/setup");
      return;
    }
    const data = JSON.parse(raw) as SessionData;
    setSession(data);
    const initConv: ConversationMessage[] = [
      { role: "user", content: "Begin the interview now. Start with your warm opener." },
      { role: "assistant", content: data.openingMessage },
    ];
    setConversation(initConv);
    setPhase("user");
    if (data.mode === "voice") speak(data.openingMessage).catch(() => {});
  }, [sessionId, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, streamingText, latestVerdict]);

  /**
   * Advance to the next interviewer turn after a graded response (talk OR coding).
   * Centralizes the streaming, conversation update, and session-complete logic
   * so both UserInput and CodingPanel can use the same flow.
   */
  const advanceAfterTurn = useCallback(
    async (
      turn: TurnRecord,
      updatedConv: ConversationMessage[],
      summaryText: string,
    ) => {
      if (currentQuestion >= session!.questionCount - 1) {
        setTurns((prev) => [...prev, turn]);
        setPhase("complete");
        sessionStorage.setItem(
          `dont-be-shy-results-${sessionId}`,
          JSON.stringify({
            turns: [...turns, turn],
            config: {
              jobTitle: session!.jobTitle,
              mode: session!.mode,
              questionCount: session!.questionCount,
            },
          }),
        );
        return;
      }

      setPhase("interviewer");
      setStreamingText("");

      const turnRes = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [
            ...updatedConv,
            { role: "user", content: `(internal: candidate just finished a coding turn — ${summaryText})` },
          ].filter((m) => !m.content.startsWith("(internal:") || true),
          system: session!.system,
        }),
      });

      if (!turnRes.ok || !turnRes.body) throw new Error("Failed to get interviewer response");

      const reader = turnRes.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreamingText(fullText);
      }

      turn.interviewerText = fullText;
      setTurns((prev) => [...prev, turn]);
      setConversation((prev) => [...prev, { role: "assistant", content: fullText }]);
      setStreamingText("");
      setCurrentQuestion((prev) => prev + 1);
      setPhase("user");

      if (session!.mode === "voice" && fullText) speak(fullText).catch(() => {});
    },
    [currentQuestion, session, sessionId, turns],
  );

  const handleUserSubmit = useCallback(async (text: string) => {
    if (!session || phase !== "user") return;
    stopSpeaking();
    recentTranscriptRef.current = text;
    const updatedConv: ConversationMessage[] = [
      ...conversation,
      { role: "user", content: text },
    ];
    setConversation(updatedConv);
    setPhase("judging");

    const questionMeta = session.questions[currentQuestion] ?? {
      id: "closing",
      category: "closing",
      difficulty: "easy" as const,
      question: "candidate questions",
      good_answer_signals: [],
      followup: null,
    };

    // Coding questions are handled by CodingPanel directly — see handleCodingSubmit.
    if (isCodingQuestion(questionMeta)) {
      setPhase("user");
      return;
    }

    try {
      const judgeRes = await fetch("/api/interview/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionMeta.question,
          response: text,
          signals: questionMeta.good_answer_signals,
        }),
      });

      const verdict = await judgeRes.json();
      if (!("error" in verdict)) setLatestVerdict(verdict as JudgeVerdict);

      const turn: TurnRecord = {
        idx: currentQuestion + 1,
        questionMeta,
        interviewerText: "",
        userResponse: text,
        judge: verdict,
      };

      await advanceAfterTurn(turn, updatedConv, "talk response evaluated");
    } catch (err) {
      console.error("Interview turn error:", err);
      setPhase("user");
    }
  }, [session, phase, conversation, currentQuestion, advanceAfterTurn]);

  const handleCodingSubmit = useCallback(
    async (payload: {
      finalCode: string;
      testResults: TestResult[];
      verdict: CodeVerdict | { error: string; raw?: string };
      snapshots: CodeSnapshot[];
      durationMs: number;
    }) => {
      if (!session || phase !== "user") return;
      stopSpeaking();
      const questionMeta = session.questions[currentQuestion];
      if (!questionMeta || !isCodingQuestion(questionMeta)) return;

      setPhase("judging");

      if (isCodeVerdict(payload.verdict)) setLatestCodeVerdict(payload.verdict);
      setLatestVerdict(null);

      const summaryText = `solved ${questionMeta.title}, ${payload.testResults.filter((t) => t.passed).length}/${payload.testResults.length} tests passed`;
      const updatedConv: ConversationMessage[] = [
        ...conversation,
        { role: "user", content: `[code submission] ${summaryText}` },
      ];
      setConversation(updatedConv);

      const turn: TurnRecord = {
        idx: currentQuestion + 1,
        questionMeta,
        interviewerText: "",
        userResponse: payload.finalCode,
        judge: payload.verdict,
        codeSnapshots: payload.snapshots,
        finalCode: payload.finalCode,
        language: questionMeta.language,
        testResults: payload.testResults,
      };

      // Persist replay (best effort, soft-fail)
      fetch("/api/interview/replay/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          turn_idx: currentQuestion + 1,
          question_id: questionMeta.id,
          language: questionMeta.language,
          code_snapshots: payload.snapshots,
          final_code: payload.finalCode,
          final_verdict: payload.verdict,
          duration_ms: payload.durationMs,
        }),
      }).catch(() => {});

      try {
        await advanceAfterTurn(turn, updatedConv, summaryText);
      } catch (err) {
        console.error("coding advance error:", err);
        setPhase("user");
      }
    },
    [session, phase, conversation, currentQuestion, sessionId, advanceAfterTurn],
  );

  const handleCodingProbe = useCallback(
    (probe: string) => {
      if (session?.mode === "voice") {
        speak(probe).catch(() => {});
      }
    },
    [session?.mode],
  );

  if (!session || phase === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-oxblood)" }} aria-hidden="true" />
      </div>
    );
  }

  const progressPct = (Math.min(currentQuestion + 1, session.questionCount) / session.questionCount) * 100;

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-6xl flex-col px-4 py-6 lg:flex-row lg:gap-6">
      {/* Conversation column */}
      <section
        className="flex flex-1 flex-col overflow-hidden rounded-2xl border"
        style={{
          borderColor: "var(--hairline)",
          background: "var(--surface-soft)",
        }}
        aria-label="Interview conversation"
      >
        {/* Progress header */}
        <div className="border-b px-5 py-3" style={{ borderColor: "var(--hairline)" }}>
          <div className="flex items-center justify-between">
            <h2
              className="text-sm"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 500,
                color: "var(--surface-ink)",
              }}
            >
              {session.jobTitle}
            </h2>
            <span
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: "var(--color-deep-green)" }}
            >
              Q {Math.min(currentQuestion + 1, session.questionCount)} / {session.questionCount}
            </span>
          </div>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full"
            style={{ background: "var(--surface-accent)" }}
            role="progressbar"
            aria-valuenow={Math.min(currentQuestion + 1, session.questionCount)}
            aria-valuemin={1}
            aria-valuemax={session.questionCount}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: "var(--color-oxblood)" }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <InterviewerBubble text={session.openingMessage} ttsEnabled={session.mode === "voice"} />

          {turns.map((turn, i) => (
            <div key={i} className="space-y-5">
              <div className="flex justify-end">
                <div
                  className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: "var(--color-deep-green)",
                    color: "var(--color-bone)",
                  }}
                >
                  {turn.userResponse}
                </div>
              </div>
              {turn.interviewerText && (
                <InterviewerBubble text={turn.interviewerText} ttsEnabled={session.mode === "voice"} />
              )}
            </div>
          ))}

          {streamingText && <InterviewerBubble text={streamingText} isStreaming />}

          {phase === "judging" && (
            <div
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--color-deep-green)" }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Evaluating your response
            </div>
          )}

          {phase === "complete" && (
            <div
              className="rounded-2xl border p-5 text-center"
              style={{
                borderColor: "var(--color-oxblood)",
                background: "var(--surface-accent)",
              }}
              role="status"
            >
              <p
                className="text-2xl"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: "var(--surface-ink)",
                }}
              >
                That&rsquo;s a wrap.
              </p>
              <button
                type="button"
                onClick={() => router.push(`/results/${sessionId}`)}
                className="group mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3"
                style={{
                  background: "var(--color-coral)",
                  color: "var(--color-bone)",
                }}
              >
                See how it went
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {phase === "user" && (() => {
          const currentQ = session.questions[currentQuestion];
          if (currentQ && isCodingQuestion(currentQ)) {
            return (
              <div className="border-t p-5" style={{ borderColor: "var(--hairline)" }}>
                <CodingPanel
                  question={currentQ}
                  recentTranscript={recentTranscriptRef.current}
                  onSubmit={handleCodingSubmit}
                  onProbe={handleCodingProbe}
                  disabled={false}
                />
              </div>
            );
          }
          return (
            <div className="border-t p-5" style={{ borderColor: "var(--hairline)" }}>
              <UserInput mode={session.mode} onSubmit={handleUserSubmit} disabled={phase !== "user"} />
            </div>
          );
        })()}
      </section>

      {/* Score sidebar */}
      <aside className="mt-4 w-full space-y-4 overflow-y-auto lg:mt-0 lg:w-80" aria-label="Score sidebar">
        {latestCodeVerdict && (
          <div>
            <p
              className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--color-deep-green)" }}
            >
              Latest coding verdict
            </p>
            <CodeVerdictCard verdict={latestCodeVerdict} />
          </div>
        )}
        {latestVerdict && (
          <div>
            <p
              className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--color-deep-green)" }}
            >
              Latest score
            </p>
            <ScoreCard verdict={latestVerdict} />
          </div>
        )}

        {turns.length > 0 && (
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: "var(--hairline)",
              background: "var(--surface-soft)",
            }}
          >
            <p
              className="font-mono text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--color-deep-green)" }}
            >
              Session progress
            </p>
            <div className="mt-3 space-y-2">
              {turns.map((turn, i) => {
                const v = turn.judge;
                const isErr = !!(v && typeof v === "object" && "error" in v);
                let avg = 0;
                let label = "—";
                if (!isErr) {
                  if (isCodeVerdict(v)) {
                    const s = v.scores;
                    avg =
                      (s.problem_understanding.score +
                        s.approach_quality.score +
                        s.code_quality.score +
                        s.testing_rigor.score +
                        s.communication.score) /
                      5;
                    label = `${avg.toFixed(1)} ⌨`;
                  } else {
                    const jv = v as JudgeVerdict;
                    avg =
                      (jv.domain_expertise + jv.english_fluency + jv.structure + jv.confidence) /
                      4;
                    label = avg.toFixed(1);
                  }
                }
                const color =
                  avg >= 4
                    ? "var(--color-deep-green)"
                    : avg >= 3
                      ? "var(--color-oxblood)"
                      : "var(--color-coral)";
                return (
                  <div
                    key={i}
                    className="flex items-baseline justify-between font-mono text-xs"
                  >
                    <span style={{ color: "var(--muted)" }}>Q{i + 1}</span>
                    <span style={{ color, fontWeight: 600 }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
