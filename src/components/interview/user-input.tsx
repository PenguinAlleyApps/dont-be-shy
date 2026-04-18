"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { isSTTSupported, startListening, stopListening } from "@/lib/audio/speech-recognition";
import { stopSpeaking } from "@/lib/audio/speech-synthesis";

interface UserInputProps {
  mode: "voice" | "text";
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

const STT_ERROR_COPY: Record<string, string> = {
  "not-allowed": "Mic permission was denied. Click the lock icon in the URL bar and allow microphone, then try again.",
  "service-not-allowed": "Mic permission was denied. Click the lock icon in the URL bar and allow microphone, then try again.",
  "audio-capture": "No microphone detected. Plug one in or check your system audio input settings.",
  network: "Speech recognition needs internet. Check your connection and try again.",
  aborted: "Recording was interrupted. Click the mic to try again.",
};

export function UserInput({ mode, onSubmit, disabled }: UserInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const accumulatedRef = useRef("");
  // userIntendsRecordingRef tracks whether the user wants to be recording.
  // Web Speech API auto-stops after a few seconds of silence even with
  // continuous=true. We use this ref to know whether to silently restart.
  const userIntendsRecordingRef = useRef(false);

  function handleTextSubmit() {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  }

  function beginListening() {
    startListening({
      onInterim: (t) => setInterimText(t),
      onFinal: (t) => {
        accumulatedRef.current += " " + t;
        setInterimText("");
      },
      onError: (err) => {
        console.error("STT error:", err);
        userIntendsRecordingRef.current = false;
        setIsRecording(false);
        setErrorMsg(STT_ERROR_COPY[err] ?? `Mic error: ${err}. Click to retry.`);
      },
      onEnd: () => {
        // Chrome stops recognition after silence even with continuous=true.
        // If the user is still holding the mic open, restart silently.
        if (userIntendsRecordingRef.current) {
          try {
            beginListening();
            return;
          } catch (_e) {
            // fall through to stop
          }
        }
        setIsRecording(false);
      },
    });
  }

  function toggleRecording() {
    if (isRecording) {
      userIntendsRecordingRef.current = false;
      stopListening();
      setIsRecording(false);
      const finalText = accumulatedRef.current.trim();
      if (finalText) {
        onSubmit(finalText);
      }
      accumulatedRef.current = "";
      setInterimText("");
    } else {
      // CRITICAL: stop the interviewer's voice before opening the mic.
      // Otherwise the speaker output bleeds into the mic and Web Speech
      // picks up the interviewer instead of the user (v0.8 regression).
      stopSpeaking();
      accumulatedRef.current = "";
      setInterimText("");
      setErrorMsg(null);
      userIntendsRecordingRef.current = true;
      setIsRecording(true);
      beginListening();
    }
  }

  if (mode === "voice") {
    const sttAvailable = typeof window !== "undefined" && isSTTSupported();

    return (
      <div className="space-y-2">
        {errorMsg && (
          <div
            role="alert"
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: "var(--surface-accent)",
              color: "var(--color-oxblood)",
              border: "1px solid var(--color-oxblood)",
            }}
          >
            {errorMsg}
          </div>
        )}

        {(accumulatedRef.current || interimText) && (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {accumulatedRef.current}
            {interimText && (
              <span className="text-slate-400"> {interimText}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          {sttAvailable ? (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={disabled}
              aria-label={isRecording ? "Stop recording and submit" : "Start recording your answer"}
              aria-pressed={isRecording}
              className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                isRecording
                  ? "bg-red-500 text-white shadow-lg shadow-red-200"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              } disabled:opacity-40`}
            >
              {isRecording && (
                <span aria-hidden="true" className="animate-pulse-ring absolute inset-0 rounded-full bg-red-400" />
              )}
              {isRecording ? (
                <MicOff aria-hidden="true" className="relative z-10 h-7 w-7" />
              ) : (
                <Mic aria-hidden="true" className="relative z-10 h-7 w-7" />
              )}
            </button>
          ) : (
            <p className="text-sm text-amber-600">
              Voice not supported in this browser. Showing text input instead.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          {isRecording
            ? "Listening... click to stop and submit"
            : "Click the mic to start speaking"}
        </p>

        {!sttAvailable && (
          <TextInput
            text={text}
            setText={setText}
            onSubmit={handleTextSubmit}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        )}
      </div>
    );
  }

  return (
    <TextInput
      text={text}
      setText={setText}
      onSubmit={handleTextSubmit}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    />
  );
}

function TextInput({
  text,
  setText,
  onSubmit,
  onKeyDown,
  disabled,
}: {
  text: string;
  setText: (t: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <label htmlFor="user-response-input" className="sr-only">
        Your response
      </label>
      <textarea
        id="user-response-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your response..."
        disabled={disabled}
        rows={3}
        aria-label="Type your interview response"
        className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-40"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !text.trim()}
        aria-label="Submit response"
        className="self-end rounded-lg bg-indigo-600 p-2.5 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <Send aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
