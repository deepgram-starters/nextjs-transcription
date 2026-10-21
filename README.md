# Next.js Transcription

A Next.js implementation of the Deepgram prerecorded-transcription starter. It preserves the `POST /api/transcription`, `GET /api/session`, and `GET /api/metadata` contracts from `node-transcription` while providing the UI in Next.js.

## Quick start

```sh
git submodule update --init --recursive
corepack pnpm install
cp sample.env .env
# Set DEEPGRAM_API_KEY in .env
corepack pnpm dev
```

Open http://localhost:3000.
