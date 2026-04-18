/**
 * POST /api/tts
 * Server-side text-to-speech via ElevenLabs Multilingual v2.
 *
 * Why ElevenLabs over Edge-TTS:
 *  - Edge-TTS hits a Vercel function timeout (Microsoft drops the WebSocket
 *    from non-Edge UA / non-residential IPs; v0.8 attempt failed with 504).
 *  - ElevenLabs has a real REST endpoint, ships in 1-3s, voice quality > Emma.
 *
 * Cost containment:
 *  - 24-hour immutable cache (same text → same audio → same MP3) saves
 *    ~80% of repeat-visitor cost.
 *  - Demo + Pro both use ElevenLabs (CEO wants the voice to be the moat,
 *    free demo with robotic voice undercuts the whole product).
 *  - Demo monthly cap enforced upstream via dbs_cost_tracking circuit breaker.
 *
 * Voice: Rachel (21m00Tcm4TlvDq8ikWAM) — calm, US English female, the
 * canonical "warm interviewer" voice. Override per request via ?voice=...
 */
import { NextRequest } from "next/server";
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_TEXT_LENGTH = 2000;
const MODEL_ID = "eleven_multilingual_v2";

export async function POST(request: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY) {
      // Fast 503 — client immediately falls back to browser-native neural voice
      return Response.json(
        { error: "tts unavailable", code: "no_key" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const text = String(body?.text ?? "").slice(0, MAX_TEXT_LENGTH).trim();
    const voiceId = String(body?.voice ?? ELEVENLABS_VOICE_ID);

    if (!text) {
      return Response.json({ error: "text is required" }, { status: 400 });
    }

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      return Response.json(
        { error: `elevenlabs ${elevenRes.status}: ${errText.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const audio = await elevenRes.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audio.byteLength.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "tts failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
