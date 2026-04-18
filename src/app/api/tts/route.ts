/**
 * POST /api/tts
 * Server-side text-to-speech via Edge-TTS (Microsoft's neural voices).
 * Returns MP3 audio. Falls back to browser-native if this route fails on the client.
 *
 * Voice quality: ≈ 8/10 (neural, indistinguishable from human in most cases).
 * Cost: $0 (Microsoft's public Read Aloud endpoint, undocumented but stable).
 * Risk: Microsoft could rate-limit aggressive use. Client falls back gracefully.
 */
import { NextRequest } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_VOICE = "en-US-EmmaMultilingualNeural";
const MAX_TEXT_LENGTH = 2000; // safety cap to avoid abuse

function escapeForSSML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = String(body?.text ?? "").slice(0, MAX_TEXT_LENGTH);
    const voice = String(body?.voice ?? DEFAULT_VOICE);

    if (!text.trim()) {
      return Response.json({ error: "text is required" }, { status: 400 });
    }

    const safeText = escapeForSSML(text);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(safeText);

    const chunks: Buffer[] = [];

    return await new Promise<Response>((resolve) => {
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("close", () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length === 0) {
          resolve(Response.json({ error: "empty audio response" }, { status: 502 }));
          return;
        }
        resolve(
          new Response(new Uint8Array(buffer), {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": buffer.length.toString(),
              // Same text → same audio. Cache aggressively to save Microsoft's bandwidth.
              "Cache-Control": "public, max-age=86400, immutable",
            },
          }),
        );
      });
      audioStream.on("error", (err: Error) => {
        resolve(Response.json({ error: err.message || "tts stream error" }, { status: 502 }));
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "tts failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
