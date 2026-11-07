/**
 * Offline quote parser.
 *
 * Used when there is no signal (or no AI backend configured). It understands
 * the common shapes of a spoken job description:
 *   "twenty metres of fencing with concrete posts and gravel boards"
 *   "need 12 4x4 8 foot posts and 24 bags of postcrete"
 *   "two and a half days labour", "3 hours", "skip"
 * and produces a draft quote the user then tweaks. The AI path (ai.ts) is much
 * better at messy speech; this keeps the app useful in a field with one bar.
 */
import { CALCULATORS } from './calculators.ts';
import { MATERIAL_BY_ID, matchMaterial } from './materials.ts';
import { uid } from './id.ts';
import type { LineItem } from './types.ts';

export interface ParseProfile {
  trade?: string;
  dayRate?: number;
  hourlyRate?: number;
  markupPct?: number;
}

export interface ParsedDraft {
  title: string;
  trade: string;
  client: { name: string; phone: string; address: string };
  items: LineItem[];
  estimatedDays: number;
  notes: string;
  assumptions: string[];
}

const SMALL: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, dozen: 12, couple: 2,
};

/** Turns spoken numbers into digits: "twenty two and a half" -> "22.5". */
export function normaliseNumbers(text: string): string {
  let s = ` ${text.toLowerCase()} `
    .replace(/[,;]/g, ' , ')
    .replace(/\bfor by for\b|\bfour by four\b|\b4 by 4\b/g, '4x4')
    .replace(/\bthree by two\b|\b3 by 2\b/g, '3x2')
    .replace(/\bfour by two\b|\b4 by 2\b/g, '4x2')
    .replace(/\bsix by two\b|\b6 by 2\b/g, '6x2')
    .replace(/(\d)\s*by\s*(\d)/g, '$1x$2')
    .replace(/\bsquare met(re|er)s?\b|\bsq m\b|\bm2\b|\bmetres squared\b/g, ' m² ')
    .replace(/\bmet(re|er)s?\b/g, ' m ')
    .replace(/\b(foot|feet|ft)\b/g, ' ft ');

  // "a half" / "and a half"
  s = s.replace(/(\d+|\b[a-z]+\b) and a half\b/g, (_m, n) => `${(SMALL[n] ?? Number(n)) + 0.5}`);
  s = s.replace(/\bhalf a\b/g, '0.5');

  // compound words: "twenty two" -> 22, "one hundred and fifty" -> 150
  s = s.replace(/\b((?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|dozen|couple)(?:\s+and\s+|\s+|-)?)+)/g, (m) => {
    const words = m.trim().split(/\s+and\s+|\s+|-/).filter(Boolean);
    let total = 0;
    let cur = 0;
    for (const w of words) {
      const v = SMALL[w];
      if (v === undefined) continue;
      if (w === 'hundred') cur = (cur || 1) * 100;
      else if (w === 'dozen') cur = (cur || 1) * 12;
      else cur += v;
    }
    total += cur;
    return ` ${total} `;
  });
  return s.replace(/\s+/g, ' ').trim();
}

const TITLE_WORDS: [RegExp, string, string][] = [
  [/clos(e)?\s?board/, 'Closeboard fence', 'Fencing'],
  [/fenc(e|ing)|panels?/, 'Fence replacement', 'Fencing'],
  [/deck(ing)?/, 'Decking', 'Landscaping'],
  [/patio|paving|slabs?/, 'Patio', 'Landscaping'],
  [/turf|lawn/, 'Turfing', 'Landscaping'],
  [/skim|plaster(ing)?|board(ing)? out/, 'Plastering', 'Plastering'],
  [/paint(ing)?|decorat(e|ing)/, 'Decorating', 'Decorating'],
  [/tile|tiling/, 'Tiling', 'Tiling'],
  [/roof|epdm/, 'Roofing', 'Roofing'],
  [/wall|brick|block/, 'Garden wall', 'Building'],
];

function labourFrom(text: string, p: ParseProfile): { qty: number; unit: 'day' | 'hour' } | undefined {
  const day = text.match(/(\d+(?:\.\d+)?)\s*(?:working\s+)?days?\b/);
  if (day) return { qty: Number(day[1]), unit: 'day' };
  if (/\ba day\b|\bone day\b|\bfull day\b/.test(text)) return { qty: 1, unit: 'day' };
  const hrs = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/);
  if (hrs) return { qty: Number(hrs[1]), unit: 'hour' };
  if (/half a day|half day/.test(text) || /\b0\.5 day/.test(text)) return { qty: 0.5, unit: 'day' };
  void p;
  return undefined;
}

const markup = (price: number, pct = 0) => Math.round(price * (1 + pct / 100) * 100) / 100;

function materialItem(materialId: string, qty: number, p: ParseProfile, note?: string): LineItem {
  const m = MATERIAL_BY_ID[materialId]!;
  return {
    id: uid(),
    kind: 'material',
    description: note ? `${m.name} (${note})` : m.name,
    qty,
    unit: m.unit,
    unitPrice: markup(m.price, p.markupPct),
  };
}

export function parseTranscriptOffline(transcript: string, profile: ParseProfile = {}): ParsedDraft {
  const text = normaliseNumbers(transcript);
  const items: LineItem[] = [];
  const assumptions: string[] = [];
  const used = new Set<string>();

  // Title & trade
  let title = 'Job';
  let trade = profile.trade ?? 'General';
  for (const [re, t, tr] of TITLE_WORDS) {
    if (re.test(text)) {
      title = t;
      trade = tr;
      break;
    }
  }

  // Area/length-driven calculators ("20 m of fencing", "15 m² patio")
  const runLen = text.match(/(\d+(?:\.\d+)?)\s*m\b(?!²)[^.,]{0,25}\b(fenc|closeboard|close board|run)/);
  const area = text.match(/(\d+(?:\.\d+)?)\s*m²/);
  let calcUsed = false;
  const calcFor = (id: string, values: Record<string, number>) => {
    const c = CALCULATORS.find((x) => x.id === id)!;
    const vals = Object.fromEntries(c.fields.map((f) => [f.key, values[f.key] ?? f.default]));
    const concretePosts = /concrete post/.test(text);
    for (const l of c.run(vals)) {
      if (l.qty <= 0) continue;
      const id = concretePosts && l.materialId === 'post-4x4-8' ? 'post-concrete-8' : l.materialId;
      items.push(materialItem(id, l.qty, profile, l.note));
      used.add(id);
    }
    calcUsed = true;
  };
  if (runLen) {
    const length = Number(runLen[1]);
    if (/clos(e)?\s?board/.test(text)) calcFor('closeboard', { length });
    else calcFor('fence', { length, gravelBoards: /gravel board|concrete post/.test(text) ? 1 : 0 });
    title = `${title} – ${length}m`;
  } else if (area) {
    const a = Number(area[1]);
    const id = /deck/.test(text) ? 'decking' : /patio|paving|slab|porcelain|sandstone/.test(text) ? 'patio' : /turf|lawn/.test(text) ? 'turf' : /skim|plaster/.test(text) ? 'plaster' : /paint|emulsion|decorat/.test(text) ? 'paint' : undefined;
    if (id === 'decking') {
      const side = Math.sqrt(a);
      calcFor('decking', { length: side, width: side });
      assumptions.push(`Decking treated as a ${side.toFixed(1)}m square — adjust if it's a different shape.`);
    } else if (id) calcFor(id, { area: a, porcelain: /porcelain/.test(text) ? 1 : 0, board: /board/.test(text) ? 1 : 0 });
    if (id) title = `${title} – ${a}m²`;
  }

  // Explicit quantities: "12 4x4 8ft posts", "10 bags of postcrete", "a skip"
  const clauses = text.split(/\s(?:,|and|plus|then|also|with)\s|[.]/);
  for (const raw of clauses) {
    const clause = raw.trim();
    if (!clause) continue;
    const m = matchMaterial(clause);
    if (!m || used.has(m.id)) continue;
    // first number that isn't part of a dimension like 4x4 / 8ft
    const qtyMatch = clause.replace(/\d+x\d+/g, ' ').replace(/\d+(\.\d+)?\s*(ft|m|mm)\b/g, ' ').match(/(\d+(?:\.\d+)?)/);
    // A calculator already did the take-off — only add extras the user actually counted.
    if (calcUsed && !qtyMatch) continue;
    const qty = qtyMatch ? Number(qtyMatch[1]) : 1;
    if (!qtyMatch) assumptions.push(`Assumed 1 × ${m.name.toLowerCase()}.`);
    items.push(materialItem(m.id, qty, profile));
    used.add(m.id);
  }

  // Waste removal
  if (/\b(tip|waste|rubbish|take away|muck away|clear(ing)? away)\b/.test(text) && !used.has('skip-6')) {
    items.push({ id: uid(), kind: 'other', description: 'Waste removal & disposal', qty: 1, unit: 'job', unitPrice: 120 });
  }

  // Labour
  const labour = labourFrom(text, profile);
  let estimatedDays = 1;
  if (labour?.unit === 'day') {
    estimatedDays = labour.qty;
    items.unshift({ id: uid(), kind: 'labour', description: 'Labour', qty: labour.qty, unit: 'day', unitPrice: profile.dayRate ?? 220 });
  } else if (labour?.unit === 'hour') {
    estimatedDays = Math.max(0.5, Math.ceil(labour.qty / 8 / 0.5) * 0.5);
    items.unshift({ id: uid(), kind: 'labour', description: 'Labour', qty: labour.qty, unit: 'hour', unitPrice: profile.hourlyRate ?? 35 });
  } else {
    const matTotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    estimatedDays = Math.max(1, Math.round((matTotal / 400) * 2) / 2);
    items.unshift({ id: uid(), kind: 'labour', description: 'Labour', qty: estimatedDays, unit: 'day', unitPrice: profile.dayRate ?? 220 });
    assumptions.push(`Labour estimated at ${estimatedDays} day${estimatedDays === 1 ? '' : 's'} — you didn't say how long.`);
  }
  // A second pair of hands
  if (/\b(labourer|my lad|2 man|two man|2 of us|with a mate|plus a labourer)\b/.test(text)) {
    items.splice(1, 0, { id: uid(), kind: 'labour', description: 'Labourer', qty: estimatedDays, unit: 'day', unitPrice: Math.round((profile.dayRate ?? 220) * 0.6) });
  }

  if (!profile.dayRate) assumptions.push('Using a £220 day rate — set yours in Settings.');

  const notes =
    title === 'Job'
      ? 'Price includes labour and materials as listed.'
      : `Supply and fit as described. Price includes all labour and materials listed${items.some((i) => /waste|skip/i.test(i.description)) ? ' and removal of waste' : ''}.`;

  return { title, trade, client: { name: '', phone: '', address: '' }, items, estimatedDays, notes, assumptions: assumptions.slice(0, 5) };
}
