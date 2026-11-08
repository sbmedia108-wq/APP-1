import type { Guide } from "./types";
import { findOfflineGuide } from "./offlineGuides";

// Set this when you run the app, e.g.
//   EXPO_PUBLIC_API_URL=http://192.168.1.20:8787 npx expo start
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export type HelpResult = { guide: Guide; source: "online" | "offline" };

async function fetchOnline(problem: string): Promise<Guide> {
  if (!API_URL) throw new Error("No API URL configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(`${API_URL}/api/help`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    const data = (await res.json()) as { guide: Guide };
    return data.guide;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Get a guide for the problem. Tries the smart (online) helper first,
 * then falls back to the built-in guides so the person always gets something.
 */
export async function getHelp(problem: string): Promise<HelpResult | null> {
  try {
    return { guide: await fetchOnline(problem), source: "online" };
  } catch (err) {
    console.warn("Online help unavailable, using built-in guides:", err);
    const offline = findOfflineGuide(problem);
    return offline ? { guide: offline, source: "offline" } : null;
  }
}
