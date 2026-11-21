// Checks the badge and level rules. Run: npx tsx scripts/test-rewards.ts
import { allBadges, levelFor, newlyEarned, type Activity } from "../src/achievements";
import type { QuizProgress } from "../src/dailyQuiz";

const q0: QuizProgress = { lastPlayed: null, streak: 0, bestStreak: 0, stars: 0, scamRight: 0, techRight: 0, wordRight: 0, perfectDays: 0, daysPlayed: 0 };
const a0: Activity = { fixes: 0, areas: [], practices: 0, scamChecks: 0, daysUsed: 0, lastUsed: null, useStreak: 0, bestUseStreak: 0 };
let fails = 0;
const ok = (c: boolean, m: string) => { if (!c) { fails++; console.log("FAIL", m); } };

const none = allBadges(q0, a0);
ok(none.every((b) => !b.earned), "nothing earned at the start");
ok(new Set(none.map((b) => b.id)).size === none.length, "badge ids are unique");
ok(none.every((b) => b.need >= 1 && b.name && b.how && b.emoji), "every badge has a name, a how and a target");
ok(levelFor(q0, a0).number === 1, "level 1 at the start");

const a1 = { ...a0, fixes: 1, areas: ["tv"] };
const fresh = newlyEarned(none, allBadges(q0, a1)).map((b) => b.id).sort();
ok(JSON.stringify(fresh) === JSON.stringify(["fix1", "tv"]), "first TV fix unlocks First fix and Telly tamer, got " + fresh);

const busy = allBadges({ ...q0, stars: 120, bestStreak: 8, scamRight: 21, techRight: 6, perfectDays: 2, daysPlayed: 9 }, { ...a0, fixes: 12, areas: ["tv", "phone", "money", "email"], practices: 5, scamChecks: 1, daysUsed: 8, bestUseStreak: 3 });
const got = new Set(busy.filter((b) => b.earned).map((b) => b.id));
for (const id of ["fix10", "areas3", "streak7", "stars100", "scam20", "tech5", "perfect1", "practice5", "check1", "days7"]) ok(got.has(id), "should have " + id);
for (const id of ["fix25", "areas6", "streak14", "stars250", "scam50", "tech20", "perfect10", "practice10", "check10", "days30", "useStreak7"]) ok(!got.has(id), "should not have " + id);
const fix25 = busy.find((b) => b.id === "fix25")!;
ok(fix25.have === 12 && fix25.need === 25, "progress shows 12 of 25");

const top = levelFor({ ...q0, stars: 5000 }, a0);
ok(top.number === 7 && top.next === null, "the top level has no next level");
const mid = levelFor({ ...q0, stars: 30 }, a0);
ok(mid.next !== null && mid.next.progress > 0 && mid.next.progress < 1, "progress to the next level is between 0 and 1");

console.log(`${none.length} badges, 7 levels: ${fails ? fails + " failed" : "all checks passed"}`);
process.exit(fails ? 1 : 0);
