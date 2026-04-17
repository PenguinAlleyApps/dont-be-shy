/**
 * Web Speech API — Speech Synthesis (TTS) wrapper.
 * Runs entirely in the browser. No server cost. No API key.
 */

export function isTTSSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.speechSynthesis;
}

let selectedVoice: SpeechSynthesisVoice | null = null;

/** Get available voices. Chrome loads them async, so we may need to wait. */
export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

/** Select the best English voice. Prefers female voices for warmth. */
export async function selectVoice(): Promise<SpeechSynthesisVoice | null> {
  if (selectedVoice) return selectedVoice;

  const voices = await getVoices();
  const english = voices.filter((v) => v.lang.startsWith("en"));

  // Preference order: Samantha (macOS), Microsoft Zira (Windows), any en-US female, any en
  const preferred = [
    english.find((v) => v.name.includes("Samantha")),
    english.find((v) => v.name.includes("Zira")),
    english.find((v) => v.name.includes("Emma")),
    english.find((v) => v.lang === "en-US"),
    english[0],
  ];

  selectedVoice = preferred.find(Boolean) ?? null;
  return selectedVoice;
}

export interface TTSOptions {
  rate?: number; // 0.1 - 10, default 1
  pitch?: number; // 0 - 2, default 1
  volume?: number; // 0 - 1, default 1
}

/** Speak text aloud. Returns a promise that resolves when done. */
export async function speak(
  text: string,
  options: TTSOptions = {},
): Promise<void> {
  if (!isTTSSupported()) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const voice = await selectVoice();
  const utterance = new SpeechSynthesisUtterance(text);

  if (voice) utterance.voice = voice;
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;
  utterance.lang = "en-US";

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(e.error));
    window.speechSynthesis.speak(utterance);
  });
}

/** Stop any ongoing speech. */
export function stopSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
}

/** Check if currently speaking. */
export function isSpeaking(): boolean {
  if (!isTTSSupported()) return false;
  return window.speechSynthesis.speaking;
}
