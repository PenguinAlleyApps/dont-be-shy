/**
 * Text-to-Speech for Don't Be Shy.
 *
 * v0.8: prefers server-side Edge-TTS Emma (neural, indistinguishable from human)
 * via /api/tts. Falls back to browser-native Web Speech API if the server route
 * fails (Microsoft rate-limit, network down, offline).
 *
 * Same Emma voice PA·co uses internally for narration.
 */

interface TTSOptions {
  rate?: number; // 0.1 - 10 (only honored by browser-native fallback)
  pitch?: number; // browser-native fallback only
  volume?: number; // 0 - 1
}

let currentAudio: HTMLAudioElement | null = null;
let useServerTTS = true; // sticky: once we know server fails, stop trying

export function isTTSSupported(): boolean {
  if (typeof window === "undefined") return false;
  // Either path works — server-side TTS or browser-native.
  return !!window.Audio || !!window.speechSynthesis;
}

/* -------------------------------------------------------------------------- */
/* Server-side path (preferred) — Edge-TTS Emma neural voice                  */
/* -------------------------------------------------------------------------- */

async function speakServer(text: string, options: TTSOptions): Promise<void> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice: "en-US-EmmaMultilingualNeural" }),
  });
  if (!res.ok) throw new Error(`tts ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  // Cancel anything currently playing
  hardStop();

  const audio = new Audio(url);
  audio.volume = options.volume ?? 1;
  currentAudio = audio;

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
    };
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("audio playback failed"));
    };
    audio.play().catch((err) => {
      cleanup();
      reject(err);
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Browser-native fallback — only used when server route fails                */
/* -------------------------------------------------------------------------- */

let selectedVoice: SpeechSynthesisVoice | null = null;

async function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

async function selectVoice(): Promise<SpeechSynthesisVoice | null> {
  if (selectedVoice) return selectedVoice;
  const voices = await getVoices();
  const english = voices.filter((v) => v.lang.startsWith("en"));

  // Prefer the high-quality online neural voices first (these are Edge-TTS
  // exposed through Web Speech API in Chrome/Edge — same family as our
  // server-side path). Then fall back to system voices.
  const preferred = [
    english.find((v) => /aria.*online/i.test(v.name)),
    english.find((v) => /jenny.*online/i.test(v.name)),
    english.find((v) => /christopher.*online/i.test(v.name)),
    english.find((v) => /emma/i.test(v.name)),
    english.find((v) => v.name.includes("Samantha")),
    english.find((v) => /Microsoft.*Aria/i.test(v.name)),
    english.find((v) => v.name.includes("Zira")),
    english.find((v) => v.lang === "en-US"),
    english[0],
  ];
  selectedVoice = preferred.find(Boolean) ?? null;
  return selectedVoice;
}

async function speakBrowserNative(text: string, options: TTSOptions): Promise<void> {
  if (!window.speechSynthesis) return;
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

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export async function speak(text: string, options: TTSOptions = {}): Promise<void> {
  if (typeof window === "undefined" || !text.trim()) return;

  if (useServerTTS) {
    try {
      await speakServer(text, options);
      return;
    } catch (err) {
      // First server failure: degrade gracefully and remember
      console.warn("[tts] server path failed, falling back to browser native:", err);
      useServerTTS = false;
    }
  }

  // Fallback path
  return speakBrowserNative(text, options);
}

function hardStop(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
}

export function stopSpeaking(): void {
  hardStop();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined") return false;
  if (currentAudio && !currentAudio.paused) return true;
  if (window.speechSynthesis) return window.speechSynthesis.speaking;
  return false;
}
