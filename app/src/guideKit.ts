// A short way to write a built-in guide, so there can be lots of them.
import type { OfflineGuide } from "./offlineGuides";

export type Category =
  | "tv"
  | "phone"
  | "calls"
  | "messages"
  | "email"
  | "photos"
  | "internet"
  | "apps"
  | "accounts"
  | "safety"
  | "money"
  | "health"
  | "out";

export const CATEGORIES: { id: Category; emoji: string; label: string }[] = [
  { id: "tv", emoji: "📺", label: "The TV" },
  { id: "phone", emoji: "📱", label: "Phone or tablet basics" },
  { id: "calls", emoji: "📞", label: "Calls and contacts" },
  { id: "messages", emoji: "💬", label: "Texts and WhatsApp" },
  { id: "email", emoji: "✉️", label: "Email" },
  { id: "photos", emoji: "📷", label: "Photos and camera" },
  { id: "internet", emoji: "🌐", label: "Wi-Fi and the internet" },
  { id: "apps", emoji: "🧩", label: "Apps" },
  { id: "accounts", emoji: "🔑", label: "Passwords and accounts" },
  { id: "safety", emoji: "🛡️", label: "Scams and staying safe" },
  { id: "money", emoji: "🏦", label: "Banking and shopping" },
  { id: "health", emoji: "🩺", label: "The GP and health" },
  { id: "out", emoji: "🍔", label: "Out and about" },
];

type StepIn = string | [string, string];

export function g(o: {
  id: string;
  cat: Category;
  emoji: string;
  label: string;
  title: string;
  device?: string;
  /** Ways people might say it. Single words and phrases. */
  words: string[];
  steps: StepIn[];
  calm?: string;
  help?: string;
  warn?: string;
  boost?: string[];
}): OfflineGuide {
  return {
    id: o.id,
    category: o.cat,
    emoji: o.emoji,
    shortLabel: o.label,
    keywords: o.words,
    boost: o.boost,
    hidden: true,
    understood: true,
    title: o.title,
    reassurance:
      o.calm ?? "Lots of people ask about this. We'll go one small step at a time.",
    device: o.device ?? "phone or tablet",
    clarifyingQuestion: "",
    safetyWarning: o.warn ?? "",
    steps: o.steps.map((s) =>
      typeof s === "string"
        ? { instruction: s, lookFor: "" }
        : { instruction: s[0], lookFor: s[1] },
    ),
    whenToGetHelp:
      o.help ??
      "If it still isn't working, ask someone you trust to take a look with you, or try again tomorrow. It's not you: phones change things all the time.",
  };
}
