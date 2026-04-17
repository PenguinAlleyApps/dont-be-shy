"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InterviewerBubble } from "@/components/interview/interviewer-bubble";
import { UserInput } from "@/components/interview/user-input";
import { ScoreCard } from "@/components/interview/score-card";
import { Loader2, ArrowRight } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/audio/speech-synthesis";
import type {
  QuestionMeta,
  ConversationMessage,
  TurnRecord,
  JudgeVerdict,
} from "@/types/interview";

type InterviewPhase = "loading" | "interviewer" | "user" | "judging" | "complete";

interface SessionData {
  sessionId: string;
  persona: string;
  questions: QuestionMeta[];
  system: string;
  openingMessage: string;
  mode: "voice" | "text";
  jobTitle: string;
  questionCount: number;
  isDemo: boolean;
  apiKey?: string;
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load session data from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem(`dont-be-shy-session-${sessionId}`);
    if (!raw) {
      router.push("/setup");
      return;
    }

    const data = JSON.parse(raw) as SessionData;
    setSession(data);

    // Set up initial conversation with opening message
    const initConv: ConversationMessage[] = [
      { role: "user", content: "Begin the interview now. Start with your warm opener." },
      { role: "assistant", content: data.openingMessage },
    ];
    setConversation(initConv);
    setPhase("user");

    // Speak the opening if voice mode
    if (data.mode === "voice") {
      speak(data.openingMessage).catch(() => {});
    }
  }, [sessionId, router]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, streamingText, latestVerdict]);

  const handleUserSubmit = useCallback(async (text: string) => {
    if (!session || phase !== "user") return;
    stopSpeaking();

    // Add user message to conversation
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

    // Judge the response
    try {
      const judgeRes = await fetch("/api/interview/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionMeta.question,
          response: text,
          signals: questionMeta.good_answer_signals,
          apiKey: session.apiKey,
        }),
      });

      const verdict = await judgeRes.json();
      if (!("error" in verdict)) {
        setLatestVerdict(verdict as JudgeVerdict);
      }

      const turn: TurnRecord = {
        idx: currentQuestion + 1,
        questionMeta,
        interviewerText: "",
        userResponse: text,
        judge: verdict,
      };

      // Check if we've reached the end
      if (currentQuestion >= session.questionCount) {
        setTurns((prev) => [...prev, turn]);
        setPhase("complete");

        // Store results
        sessionStorage.setItem(
          `dont-be-shy-results-${sessionId}`,
          JSON.stringify({
            turns: [...turns, turn],
            config: {
              jobTitle: session.jobTitle,
              mode: session.mode,
              questionCount: session.questionCount,
            },
          }),
        );
        return;
      }

      // Get next interviewer turn (streaming)
      setPhase("interviewer");
      setStreamingText("");

      const turnRes = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: updatedConv,
          system: session.system,
          apiKey: session.apiKey,
        }),
      });

      if (!turnRes.ok || !turnRes.body) throw new Error("Failed to get interviewer response");

      const reader = turnRes.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }

      turn.interviewerText = fullText;
      setTurns((prev) => [...prev, turn]);
      setConversation((prev) => [...prev, { role: "assistant", content: fullText }]);
      setStreamingText("");
      setCurrentQuestion((prev) => prev + 1);
      setPhase("user");

      // Speak the response if voice mode
      if (session.mode === "voice" && fullText) {
        speak(fullText).catch(() => {});
      }
    } catch (err) {
      console.error("Interview turn error:", err);
      setPhase("user");
    }
  }, [session, phase, conversation, currentQuestion, turns, sessionId]);

  if (!session || phase === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-5xl flex-col px-4 py-4 lg:flex-row lg:gap-4">
      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Header */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              {session.jobTitle}
            </h2>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              Q {Math.min(currentQuestion + 1, session.questionCount)} / {session.questionCount}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{
                width: `${(Math.min(currentQuestion + 1, session.questionCount) / session.questionCount) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {/* Opening message */}
          <InterviewerBubble
            text={session.openingMessage}
            ttsEnabled={session.mode === "voice"}
          />

          {/* Turns */}
          {turns.map((turn, i) => (
            <div key={i} className="space-y-4">
              {/* User response */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-100 px-4 py-3 text-sm text-slate-800">
                  {turn.userResponse}
                </div>
              </div>
              {/* Interviewer reaction */}
              {turn.interviewerText && (
                <InterviewerBubble
                  text={turn.interviewerText}
                  ttsEnabled={session.mode === "voice"}
                />
              )}
            </div>
          ))}

          {/* Streaming interviewer text */}
          {streamingText && (
            <InterviewerBubble text={streamingText} isStreaming />
          )}

          {/* Phase indicators */}
          {phase === "judging" && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Evaluating your response...
            </div>
          )}

          {phase === "complete" && (
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="font-semibold text-emerald-800">Interview complete!</p>
              <button
                onClick={() => router.push(`/results/${sessionId}`)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                View Results
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        {phase === "user" && (
          <div className="border-t border-slate-100 p-4">
            <UserInput
              mode={session.mode}
              onSubmit={handleUserSubmit}
              disabled={phase !== "user"}
            />
          </div>
        )}
      </div>

      {/* Score sidebar */}
      <div className="mt-4 w-full space-y-3 overflow-y-auto lg:mt-0 lg:w-80">
        {latestVerdict && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Latest score
            </p>
            <ScoreCard verdict={latestVerdict} />
          </div>
        )}

        {turns.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Session progress
            </p>
            <div className="mt-2 space-y-1.5">
              {turns.map((turn, i) => {
                const v = turn.judge;
                const hasScore = !("error" in v);
                const avg = hasScore
                  ? ((v as JudgeVerdict).domain_expertise +
                      (v as JudgeVerdict).english_fluency +
                      (v as JudgeVerdict).structure +
                      (v as JudgeVerdict).confidence) /
                    4
                  : 0;
                const color =
                  avg >= 4
                    ? "text-emerald-600"
                    : avg >= 3
                      ? "text-amber-600"
                      : "text-red-600";
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-500">Q{i + 1}</span>
                    <span className={`font-mono font-semibold ${color}`}>
                      {hasScore ? avg.toFixed(1) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
