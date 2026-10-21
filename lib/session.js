import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const fallbackSecret = randomBytes(32).toString("hex");

function secret() {
  return process.env.SESSION_SECRET || process.env.DEEPGRAM_API_KEY || fallbackSecret;
}

function signature(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 60 * 60_000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function hasValidSession(header) {
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const [payload, received] = token.split(".");
  if (!payload || !received) return false;
  const expected = signature(payload);
  if (received.length !== expected.length || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}
