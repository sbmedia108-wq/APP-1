/**
 * Job memory: finds past quotes similar to what's being described right now,
 * so the user (and the AI) start from their own real prices instead of a blank page.
 */
import { calcTotals } from './money.ts';
import type { LineItem, Quote } from './types.ts';

const STOP = new Set(
  'the a an and of to for in on at with is it its i we our need needs want wants about some there their them this that be will would just like got get um uh er so then also new old my your out up down back front side round around please job quote'.split(' '),
);

const STEM: [RegExp, string][] = [
  [/ing$/, ''],
  [/s$/, ''],
];

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/(\d)\s*(?:x|by)\s*(\d)/g, '$1x$2')
    .replace(/[^a-z0-9x ]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t))
    .map((t) => STEM.reduce((w, [re, r]) => (w.length > 4 ? w.replace(re, r) : w), t));
}

function quoteText(q: Quote) {
  return `${q.title} ${q.title} ${q.trade} ${q.transcript} ${q.items.map((i) => i.description).join(' ')}`;
}

export interface SimilarJob {
  quote: Quote;
  score: number;
  total: number;
  /** Shared words, for "Because you mentioned …" */
  shared: string[];
}

/**
 * Ranks past quotes by TF-IDF cosine similarity to the query text.
 * Pure function — cheap enough to run on every transcript update.
 */
export function findSimilarJobs(query: string, history: Quote[], vatRegistered: boolean, limit = 3): SimilarJob[] {
  const q = tokens(query);
  if (q.length === 0 || history.length === 0) return [];
  const docs = history.map((h) => tokens(quoteText(h)));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const N = docs.length;
  const idf = (t: string) => Math.log(1 + N / (1 + (df.get(t) ?? 0)));
  const vec = (ts: string[]) => {
    const v = new Map<string, number>();
    for (const t of ts) v.set(t, (v.get(t) ?? 0) + 1);
    for (const [t, c] of v) v.set(t, c * idf(t));
    return v;
  };
  const qv = vec(q);
  const qNorm = Math.sqrt([...qv.values()].reduce((s, x) => s + x * x, 0));
  return history
    .map((quote, i) => {
      const dv = vec(docs[i]!);
      let dot = 0;
      const shared: string[] = [];
      for (const [t, w] of qv) {
        const dw = dv.get(t);
        if (dw) {
          dot += w * dw;
          shared.push(t);
        }
      }
      const dNorm = Math.sqrt([...dv.values()].reduce((s, x) => s + x * x, 0));
      const score = dot && qNorm && dNorm ? dot / (qNorm * dNorm) : 0;
      return { quote, score, shared, total: calcTotals(quote.items, vatRegistered).total };
    })
    .filter((s) => s.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * The user's own most recent price for an item, e.g. "Labour" or "Postcrete".
 * Lets the parser and the editor auto-fill prices from what they actually charge.
 */
export function rememberedPrice(description: string, history: Quote[]): number | undefined {
  const key = tokens(description).join(' ');
  if (!key) return undefined;
  const sorted = [...history].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  for (const q of sorted) {
    for (const i of q.items) if (tokens(i.description).join(' ') === key) return i.unitPrice;
  }
  return undefined;
}

/** Applies remembered prices to freshly parsed lines (user's own prices win). */
export function applyRememberedPrices(items: LineItem[], history: Quote[]): LineItem[] {
  return items.map((i) => {
    if (i.kind === 'labour') return i; // labour follows the rates in Settings
    const p = rememberedPrice(i.description, history);
    return p !== undefined ? { ...i, unitPrice: p } : i;
  });
}

/** Win rate & average job value for a set of quotes — feeds the dashboard. */
export function pipelineStats(quotes: Quote[], vatRegistered: boolean, now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  let outstanding = 0;
  let wonThisMonth = 0;
  let decided = 0;
  let won = 0;
  const chase: Quote[] = [];
  for (const q of quotes) {
    if (q.example) continue;
    const t = calcTotals(q.items, vatRegistered).total;
    if (q.status === 'sent') {
      outstanding += t;
      if (q.followUpAt && q.followUpAt <= now.toISOString()) chase.push(q);
    }
    if (['accepted', 'invoiced', 'paid'].includes(q.status)) {
      won++;
      decided++;
      if (q.updatedAt >= monthStart) wonThisMonth += t;
    }
    if (q.status === 'declined') decided++;
  }
  return { outstanding, wonThisMonth, winRate: decided ? won / decided : 0, chase };
}
