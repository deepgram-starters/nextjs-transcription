import "./styles.css";

export const metadata = { title: "Next.js Transcription", description: "Deepgram prerecorded transcription starter" };

export default function Layout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
