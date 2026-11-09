import type { Guide } from "./types";
import { findExplanation } from "./glossary";
import { findOfflineGuide } from "./offlineGuides";
import { checkScamOffline, type ScamResult } from "./scamCheck";

// Set this when you run or build the app, e.g.
//   EXPO_PUBLIC_API_URL=https://your-server.example npx expo start
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

/** True when a server is set up, so online-only features can be shown. */
export const ONLINE_HELP_AVAILABLE = !!API_URL;

export type HelpResult = { guide: Guide; source: "online" | "offline" };
export type Photo = { mediaType: "image/jpeg"; data: string };

async function post<T>(
  path: string,
  body: unknown,
  timeoutMs = 45_000,
): Promise<T> {
  if (!API_URL) throw new Error("No API URL configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Get a guide for the problem. Tries the smart (online) helper first,
 * then falls back to the built-in guides so the person always gets something.
 * A photo can only be understood online.
 */
export async function getHelp(
  problem: string,
  photo?: Photo,
): Promise<HelpResult | null> {
  try {
    const { guide } = await post<{ guide: Guide }>("/api/help", {
      problem,
      photo,
    });
    return { guide, source: "online" };
  } catch (err) {
    console.warn("Online help unavailable, using built-in guides:", err);
    const offline = findOfflineGuide(problem);
    return offline ? { guide: offline, source: "offline" } : null;
  }
}

/** Check a message or call for scam warning signs. */
export async function checkScam(text: string): Promise<ScamResult> {
  try {
    const { result } = await post<{ result: ScamResult }>(
      "/api/scam-check",
      { text },
      30_000,
    );
    return result;
  } catch (err) {
    console.warn("Online scam check unavailable, using built-in checks:", err);
    return checkScamOffline(text);
  }
}

export type Answer = {
  term: string;
  emoji: string;
  short: string;
  more: string;
  tip?: string;
};

/**
 * Explain a tech word. Built-in answers come back instantly; anything else
 * goes to the online helper. Returns null if neither knows.
 */
export async function explain(question: string): Promise<Answer | null> {
  const known = findExplanation(question);
  if (known)
    return {
      term: known.term,
      emoji: known.emoji,
      short: known.short,
      more: known.more,
      tip: known.tip,
    };
  try {
    const { answer } = await post<{ answer: Answer }>(
      "/api/explain",
      { question },
      30_000,
    );
    return answer;
  } catch (err) {
    console.warn("Online explanations unavailable:", err);
    return null;
  }
}
