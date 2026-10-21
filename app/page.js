"use client";

import { useState } from "react";

export default function Page() {
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const [session, form] = await Promise.all([fetch("/api/session").then((r) => r.json()), Promise.resolve(new FormData(event.currentTarget))]);
    const response = await fetch("/api/transcription", { method: "POST", headers: { Authorization: `Bearer ${session.token}` }, body: form });
    setResult(JSON.stringify(await response.json(), null, 2));
    setBusy(false);
  }

  return <main><p>Deepgram starter</p><h1>Transcribe recorded audio.</h1><p>Upload an audio file or provide a public URL.</p><form onSubmit={submit}><input name="file" type="file" accept="audio/*" /><input name="url" type="url" placeholder="https://example.com/audio.mp3" /><button disabled={busy}>{busy ? "Transcribing..." : "Transcribe"}</button></form>{result && <pre>{result}</pre>}</main>;
}
