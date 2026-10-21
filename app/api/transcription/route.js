import { NextResponse } from "next/server";
import { DeepgramClient } from "@deepgram/sdk";
import { hasValidSession } from "../../../lib/session";

export const runtime = "nodejs";

export async function POST(request) {
  if (!hasValidSession(request.headers.get("authorization"))) return NextResponse.json({ error: { type: "AuthenticationError", code: "MISSING_TOKEN", message: "Authorization header with Bearer token is required" } }, { status: 401 });
  if (!process.env.DEEPGRAM_API_KEY) return NextResponse.json({ error: { type: "ConfigurationError", code: "MISSING_API_KEY", message: "DEEPGRAM_API_KEY is required" } }, { status: 500 });
  const form = await request.formData();
  const file = form.get("file");
  const url = form.get("url");
  if ((!file || typeof file === "string") && !url) return NextResponse.json({ error: { type: "ValidationError", code: "MISSING_INPUT", message: "Either file or url must be provided" } }, { status: 400 });
  try {
    const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });
    const data = url
      ? await deepgram.listen.v1.media.transcribeUrl({ url: String(url), model: String(form.get("model") || "nova-3") })
      : await deepgram.listen.v1.media.transcribeFile({ data: Buffer.from(await file.arrayBuffer()), contentType: file.type }, { model: String(form.get("model") || "nova-3") });
    const alternative = data.results?.channels?.[0]?.alternatives?.[0];
    if (!alternative) throw new Error("No transcription results returned from Deepgram");
    return NextResponse.json({ transcript: alternative.transcript || "", words: alternative.words || [], metadata: { model_uuid: data.metadata?.model_uuid, request_id: data.metadata?.request_id, model_name: String(form.get("model") || "nova-3") }, ...(data.metadata?.duration ? { duration: data.metadata.duration } : {}) });
  } catch (error) {
    return NextResponse.json({ error: { type: "TranscriptionError", code: "TRANSCRIPTION_FAILED", message: error instanceof Error ? error.message : "Transcription failed" } }, { status: 500 });
  }
}
