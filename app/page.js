"use client";

import { useMemo, useState } from "react";

const SOURCES = [
  { label: "Debate", detail: "Stanford copyright debate", url: "https://dpgr.am/stanford.mp3", icon: "◆" },
  { label: "Podcast", detail: "Deep learning impact", url: "https://dpgr.am/aishow.m4a", icon: "●" },
  { label: "Call Center", detail: "Report scam payment", url: "https://dpgr.am/dispute.wav", icon: "◒" },
];

export default function Page() {
  const [source, setSource] = useState(SOURCES[0].url);
  const [file, setFile] = useState(null);
  const [model, setModel] = useState("nova-3");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const selectedLabel = useMemo(() => file?.name || SOURCES.find((item) => item.url === source)?.label || "Audio source", [file, source]);

  async function transcribe() {
    setBusy(true);
    setError("");
    try {
      const [session, form] = await Promise.all([fetch("/api/session").then((response) => response.json()), Promise.resolve(new FormData())]);
      if (file) form.set("file", file);
      else form.set("url", source);
      form.set("model", model);
      const response = await fetch("/api/transcription", { method: "POST", headers: { Authorization: `Bearer ${session.token}` }, body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Transcription failed");
      setResult(data);
      setHistory((entries) => [{ id: data.metadata?.request_id || crypto.randomUUID(), source: selectedLabel, model, timestamp: new Date(), result: data }, ...entries].slice(0, 12));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Transcription failed");
    } finally {
      setBusy(false);
    }
  }

  return <div className="app-shell">
    <header className="topbar"><strong>deepgram <span>transcription</span></strong><nav><a href="https://github.com/deepgram-starters/nextjs-transcription" target="_blank" rel="noreferrer">GitHub</a><a className="key-link" href="https://console.deepgram.com" target="_blank" rel="noreferrer">Free API Key</a></nav></header>
    <div className="workspace">
      <aside className="sidebar controls">
        <section><p className="eyebrow">Select Audio Source</p><div className="source-grid">{SOURCES.map((item) => <label className={`source-card ${!file && source === item.url ? "selected" : ""}`} key={item.url}><input type="radio" checked={!file && source === item.url} onChange={() => { setSource(item.url); setFile(null); }} /><span className="source-icon">{item.icon}</span><strong>{item.label}</strong><small>{item.detail}</small></label>)}<label className={`source-card upload-card ${file ? "selected" : ""}`}><input type="file" accept="audio/*,video/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /><span className="source-icon">↑</span><strong>Upload audio</strong><small>{file?.name || "Choose from device"}</small></label></div></section>
        <section><label className="eyebrow" htmlFor="model">Model</label><select id="model" value={model} onChange={(event) => setModel(event.target.value)}><option value="nova-3">Nova 3</option><option value="nova-2">Nova 2</option></select></section>
        {error && <p className="status error">{error}</p>}
        {result && <section className="metadata"><p className="eyebrow">Metadata</p><dl><div><dt>Source</dt><dd>{selectedLabel}</dd></div><div><dt>Words</dt><dd>{result.words?.length || 0}</dd></div><div><dt>Duration</dt><dd>{result.duration ? `${Number(result.duration).toFixed(2)}s` : "-"}</dd></div><div><dt>Request</dt><dd>{result.metadata?.request_id || "-"}</dd></div></dl></section>}
      </aside>
      <main className="results-panel">{result ? <div className="result"><p className="eyebrow">Transcript</p><h1>{result.transcript || "No transcript returned"}</h1><button className="secondary" onClick={() => setResult(null)}>Transcribe another</button></div> : <div className="empty"><div className="mic">◉</div><h1>Select your audio and options to try out transcription</h1><p>Choose an audio source from the sidebar, configure your options, and click transcribe to get started.</p><button onClick={transcribe} disabled={busy}>{busy ? "Processing transcription..." : "Transcribe Audio"}</button></div>}</main>
      <aside className="sidebar history"><p className="eyebrow">History ({history.length})</p>{history.length ? <div className="history-list">{history.map((entry) => <button className="history-item" key={entry.id} onClick={() => setResult(entry.result)}><strong>{entry.source}</strong><small>{entry.timestamp.toLocaleTimeString()} · {entry.model}</small></button>)}</div> : <div className="history-empty">No transcriptions yet</div>}</aside>
    </div>
  </div>;
}
