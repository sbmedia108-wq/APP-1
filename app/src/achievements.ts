// Rewards across the whole app: badges for fixing things yourself, the brain teaser, practising and staying safe,
// plus a level that grows with everything you do. Kept on the phone only.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { todayKey, type QuizProgress } from "./dailyQuiz";
import type { Category } from "./guideKit";

export type Activity = {
  fixes: number; // guides finished with "Yes, it's working"
  areas: string[]; // the help areas they've fixed something in
  practices: number; // pretend orders finished
  scamChecks: number; // messages checked
  daysUsed: number; // different days the app was opened
  lastUsed: string | null;
  useStreak: number; // days in a row the app was opened
  bestUseStreak: number;
};

const KEY = "ask-mavis/activity";
const EMPTY: Activity = { fixes: 0, areas: [], practices: 0, scamChecks: 0, daysUsed: 0, lastUsed: null, useStreak: 0, bestUseStreak: 0 };

export async function loadActivity(): Promise<Activity> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Activity>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

async function save(a: Activity) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(a));
  } catch {}
  return a;
}

const dayNo = (k: string) => Math.round(new Date(k + "T12:00:00").getTime() / 86400000);

/** Count today as a day the app was used (once a day). */
export async function recordVisit(key = todayKey()) {
  const a = await loadActivity();
  if (a.lastUsed === key) return a;
  const streak = a.lastUsed && dayNo(key) - dayNo(a.lastUsed) === 1 ? a.useStreak + 1 : 1;
  return save({ ...a, lastUsed: key, daysUsed: a.daysUsed + 1, useStreak: streak, bestUseStreak: Math.max(a.bestUseStreak, streak) });
}

export async function recordFix(area?: Category | string) {
  const a = await loadActivity();
  const areas = area && !a.areas.includes(area) ? [...a.areas, area] : a.areas;
  return save({ ...a, fixes: a.fixes + 1, areas });
}

export async function recordPractice() {
  const a = await loadActivity();
  return save({ ...a, practices: a.practices + 1 });
}

export async function recordScamCheck() {
  const a = await loadActivity();
  return save({ ...a, scamChecks: a.scamChecks + 1 });
}

/* ---------- Badges ---------- */

export type Section = "fix" | "teaser" | "practice" | "regular";
export const SECTIONS: { id: Section; title: string }[] = [
  { id: "fix", title: "Fixing it yourself" },
  { id: "teaser", title: "Brain teaser" },
  { id: "practice", title: "Practice and staying safe" },
  { id: "regular", title: "Coming back" },
];

export type Badge = {
  id: string;
  section: Section;
  emoji: string;
  name: string;
  how: string; // shown while it's locked
  have: number;
  need: number;
  earned: boolean;
};

type Q = QuizProgress;
type A = Activity;
type Def = [id: string, section: Section, emoji: string, name: string, how: string, need: number, value: (q: Q, a: A) => number];

const area = (id: string) => (_q: Q, a: A) => (a.areas.includes(id) ? 1 : 0);

const DEFS: Def[] = [
  // Fixing it yourself
  ["fix1", "fix", "🔧", "First fix", "Fix something yourself", 1, (_q, a) => a.fixes],
  ["fix5", "fix", "🛠️", "Handy", "Fix 5 things yourself", 5, (_q, a) => a.fixes],
  ["fix10", "fix", "🧰", "Sorted", "Fix 10 things yourself", 10, (_q, a) => a.fixes],
  ["fix25", "fix", "🥉", "Fixer", "Fix 25 things yourself", 25, (_q, a) => a.fixes],
  ["fix50", "fix", "🥈", "Super fixer", "Fix 50 things yourself", 50, (_q, a) => a.fixes],
  ["fix100", "fix", "🥇", "Fix legend", "Fix 100 things yourself", 100, (_q, a) => a.fixes],
  ["areas3", "fix", "🧭", "All-rounder", "Fix things in 3 different areas", 3, (_q, a) => a.areas.length],
  ["areas6", "fix", "🗺️", "Explorer", "Fix things in 6 different areas", 6, (_q, a) => a.areas.length],
  ["areas10", "fix", "🌍", "Know-it-all", "Fix things in 10 different areas", 10, (_q, a) => a.areas.length],
  ["tv", "fix", "📺", "Telly tamer", "Fix a TV problem", 1, area("tv")],
  ["phone", "fix", "📱", "Phone friend", "Fix a phone or tablet problem", 1, area("phone")],
  ["messages", "fix", "💬", "Keeping in touch", "Sort out texts or WhatsApp", 1, area("messages")],
  ["photos", "fix", "📷", "Snap happy", "Sort out photos or the camera", 1, area("photos")],
  ["email", "fix", "✉️", "Inbox hero", "Sort out an email problem", 1, area("email")],
  ["internet", "fix", "📶", "Connected", "Fix a Wi-Fi or internet problem", 1, area("internet")],
  ["money", "fix", "💷", "Money-wise", "Sort out banking or shopping", 1, area("money")],
  ["health", "fix", "🩺", "Health handler", "Sort out the GP or a prescription", 1, area("health")],
  ["out", "fix", "🛒", "Out and about", "Use a machine in a shop or car park", 1, area("out")],
  // Brain teaser
  ["first", "teaser", "🌱", "First go", "Finish your first brain teaser", 1, (q) => q.daysPlayed],
  ["streak3", "teaser", "🔥", "Three days running", "Play 3 days in a row", 3, (q) => q.bestStreak],
  ["streak7", "teaser", "📅", "Full week", "Play 7 days in a row", 7, (q) => q.bestStreak],
  ["streak14", "teaser", "⚡", "Fortnight", "Play 14 days in a row", 14, (q) => q.bestStreak],
  ["streak30", "teaser", "🌙", "Whole month", "Play 30 days in a row", 30, (q) => q.bestStreak],
  ["streak100", "teaser", "💯", "Hundred days", "Play 100 days in a row", 100, (q) => q.bestStreak],
  ["stars25", "teaser", "⭐", "Star collector", "Collect 25 stars", 25, (q) => q.stars],
  ["stars100", "teaser", "🌟", "Shining star", "Collect 100 stars", 100, (q) => q.stars],
  ["stars250", "teaser", "✨", "Star gazer", "Collect 250 stars", 250, (q) => q.stars],
  ["stars500", "teaser", "🌠", "Superstar", "Collect 500 stars", 500, (q) => q.stars],
  ["perfect1", "teaser", "🎯", "Full marks", "Get all 3 right in one day", 1, (q) => q.perfectDays],
  ["perfect10", "teaser", "🏹", "Sharp shooter", "Get full marks on 10 days", 10, (q) => q.perfectDays],
  ["scam5", "teaser", "🛡️", "Scam spotter", "Spot 5 scams correctly", 5, (q) => q.scamRight],
  ["scam20", "teaser", "🕵️", "Scam detective", "Spot 20 scams correctly", 20, (q) => q.scamRight],
  ["scam50", "teaser", "🦸", "Scam buster", "Spot 50 scams correctly", 50, (q) => q.scamRight],
  ["tech5", "teaser", "💡", "Tech whizz", "Get 5 tech questions right", 5, (q) => q.techRight],
  ["tech20", "teaser", "🔌", "Gadget guru", "Get 20 tech questions right", 20, (q) => q.techRight],
  ["tech50", "teaser", "🧠", "Tech brain", "Get 50 tech questions right", 50, (q) => q.techRight],
  ["word5", "teaser", "🔤", "Word finder", "Solve 5 word puzzles", 5, (q) => q.wordRight],
  ["word20", "teaser", "📚", "Wordsmith", "Solve 20 word puzzles", 20, (q) => q.wordRight],
  // Practice and staying safe
  ["practice1", "practice", "🍔", "First order", "Finish a practice order", 1, (_q, a) => a.practices],
  ["practice5", "practice", "🧾", "Regular customer", "Finish 5 practice orders", 5, (_q, a) => a.practices],
  ["practice10", "practice", "🎓", "Screen pro", "Finish 10 practice orders", 10, (_q, a) => a.practices],
  ["check1", "practice", "🔍", "Checked it first", "Check a message for scams", 1, (_q, a) => a.scamChecks],
  ["check10", "practice", "🔒", "Safety first", "Check 10 messages for scams", 10, (_q, a) => a.scamChecks],
  // Coming back
  ["days7", "regular", "☕", "Regular", "Use Ask Mavis on 7 days", 7, (_q, a) => a.daysUsed],
  ["days30", "regular", "🤝", "Old friend", "Use Ask Mavis on 30 days", 30, (_q, a) => a.daysUsed],
  ["days100", "regular", "🏡", "Part of the family", "Use Ask Mavis on 100 days", 100, (_q, a) => a.daysUsed],
  ["useStreak7", "regular", "🗓️", "Every day this week", "Open Ask Mavis 7 days in a row", 7, (_q, a) => a.bestUseStreak],
];

export function allBadges(q: QuizProgress, a: Activity): Badge[] {
  return DEFS.map(([id, section, emoji, name, how, need, value]) => {
    const have = Math.min(need, value(q, a) || 0);
    return { id, section, emoji, name, how, need, have, earned: have >= need };
  });
}

/** Badges earned between two snapshots. */
export function newlyEarned(before: Badge[], after: Badge[]): Badge[] {
  const had = new Set(before.filter((b) => b.earned).map((b) => b.id));
  return after.filter((b) => b.earned && !had.has(b.id));
}

/* ---------- Level ---------- */

const LEVELS = [
  { at: 0, emoji: "🌱", name: "Getting started" },
  { at: 15, emoji: "👣", name: "Finding my feet" },
  { at: 50, emoji: "📘", name: "Learning fast" },
  { at: 120, emoji: "💪", name: "Feeling confident" },
  { at: 250, emoji: "🚀", name: "Tech savvy" },
  { at: 500, emoji: "🏆", name: "Tech champion" },
  { at: 1000, emoji: "👑", name: "Tech legend" },
];

/** Points: a star is 1, a fix 5, a practice order 3, a scam check 2, each badge 5. */
export function levelFor(q: QuizProgress, a: Activity) {
  const badges = allBadges(q, a).filter((b) => b.earned).length;
  const points = q.stars + a.fixes * 5 + a.practices * 3 + a.scamChecks * 2 + badges * 5;
  let i = 0;
  while (i + 1 < LEVELS.length && points >= LEVELS[i + 1].at) i++;
  const here = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    number: i + 1,
    emoji: here.emoji,
    name: here.name,
    points,
    next: next ? { name: next.name, emoji: next.emoji, toGo: next.at - points, progress: (points - here.at) / (next.at - here.at) } : null,
  };
}
