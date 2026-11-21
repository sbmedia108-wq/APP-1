// Checks the help content itself: every guide is complete, every link between screens leads somewhere,
// and nothing is too long to read comfortably. Run: npx tsx scripts/test-guides.ts
import { ALL_GUIDES, guideById } from "../src/offlineGuides";
import { TRIAGES } from "../src/triage";
import { CATEGORIES } from "../src/guideKit";

const problems: string[] = [];
const bad = (m: string) => problems.push(m);
const ids = new Set<string>();
const cats = new Set(CATEGORIES.map((c) => c.id));
const LONG_STEP = 45; // words: past this a step is hard to follow read aloud

for (const g of ALL_GUIDES as any[]) {
  const id = g.id ?? g.title;
  if (!g.id) bad(`guide "${g.title}" has no id`);
  if (ids.has(id)) bad(`duplicate guide id: ${id}`);
  ids.add(id);
  if (!g.title?.trim()) bad(`${id}: no title`);
  if (!g.reassurance?.trim()) bad(`${id}: no reassurance line`);
  if (!Array.isArray(g.steps) || g.steps.length === 0) bad(`${id}: no steps`);
  g.steps?.forEach((s: any, i: number) => {
    if (!s.instruction?.trim()) bad(`${id} step ${i + 1}: empty instruction`);
    const words = (s.instruction ?? "").split(/\s+/).length;
    if (words > LONG_STEP) bad(`${id} step ${i + 1}: ${words} words, too long to follow`);
    if (/\b(TODO|lorem|xxx)\b/i.test(s.instruction + " " + (s.lookFor ?? ""))) bad(`${id} step ${i + 1}: placeholder text`);
  });
  if (g.category && !cats.has(g.category)) bad(`${id}: unknown category ${g.category}`);
  if (!g.hidden && !g.category) bad(`${id}: shown in Browse but has no category`);
}
for (const t of TRIAGES as any[]) {
  for (const o of t.options) if (!guideById(o.guideId)) bad(`triage "${t.question ?? t.id}": option "${o.label}" points to missing guide ${o.guideId}`);
}
for (const c of CATEGORIES) {
  const n = (ALL_GUIDES as any[]).filter((g) => g.category === c.id).length;
  if (n === 0) bad(`category ${c.label} has no guides`);
}
console.log(`${ALL_GUIDES.length} guides, ${TRIAGES.length} choice screens, ${CATEGORIES.length} categories`);
console.log(problems.length ? `${problems.length} problems:\n- ` + problems.join("\n- ") : "no problems");
process.exit(problems.length ? 1 : 0);
