import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ title: "Next.js Transcription", useCase: "transcription", language: "javascript", framework: "nextjs", sdk: "@deepgram/sdk" });
}
