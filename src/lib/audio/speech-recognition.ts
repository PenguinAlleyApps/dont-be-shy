/**
 * Web Speech API — Speech Recognition (STT) wrapper.
 * Runs entirely in the browser. No server cost. No API key.
 * Types declared in src/types/speech.d.ts.
 */

export function isSTTSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

let recognition: SpeechRecognition | null = null;

export interface STTCallbacks {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function startListening(callbacks: STTCallbacks, lang = "en-US"): void {
  if (!isSTTSupported()) {
    callbacks.onError?.("Speech recognition is not supported in this browser. Use Chrome or Edge.");
    return;
  }

  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return;

  recognition = new Ctor();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript;
      } else {
        interim += transcript;
      }
    }

    if (interim) callbacks.onInterim?.(interim);
    if (finalText) callbacks.onFinal(finalText);
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") return;
    callbacks.onError?.(event.error);
  };

  recognition.onend = () => {
    callbacks.onEnd?.();
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
