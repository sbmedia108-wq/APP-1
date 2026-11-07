/**
 * Turns a transcript into a draft quote.
 * Tries the Graft Quote API (Claude) first; falls back to the on-device parser
 * when offline, unconfigured, or the request fails — the user always gets a draft.
 */
import { applyRememberedPrices, findSimilarJobs } from './memory';
import { applyPricingMode, parseTranscriptOffline, type ParsedDraft } from './parser';
import { uid } from './id';
import { calcTotals } from './money';
import type { BusinessProfile, Quote } from './types';

const API_URL = process.env.EXPO_PUBLIC_QUOTE_API_URL;
const API_TOKEN = process.env.EXPO_PUBLIC_QUOTE_API_TOKEN;

export const aiConfigured = Boolean(API_URL);

export interface DraftResult extends ParsedDraft {
  source: 'ai' | 'offline';
}

export async function draftQuote(transcript: string, profile: BusinessProfile, history: Quote[]): Promise<DraftResult> {
  const p = { trade: profile.trade, pricingMode: profile.pricingMode, dayRate: profile.dayRate, hourlyRate: profile.hourlyRate, markupPct: profile.markupPct, priceBook: profile.priceBook };
  if (API_URL) {
    try {
      const similar = findSimilarJobs(transcript, history, profile.vatRegistered, 3).map((s) => ({
        title: s.quote.title,
        total: calcTotals(s.quote.items, false).total,
        date: s.quote.createdAt.slice(0, 10),
        items: s.quote.items.map(({ description, qty, unit, unitPrice }) => ({ description, qty, unit, unitPrice })),
      }));
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 45_000);
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/v1/quote/parse`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(API_TOKEN ? { authorization: `Bearer ${API_TOKEN}` } : {}) },
        body: JSON.stringify({ transcript, profile: { ...p, region: profile.postcode }, similarJobs: similar }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const d = (await res.json()) as Omit<ParsedDraft, 'items'> & { items: Omit<ParsedDraft['items'][number], 'id'>[] };
        return { ...d, items: applyPricingMode(d.items.map((i) => ({ ...i, id: uid() })), p), source: 'ai' };
      }
    } catch {
      // fall through to offline
    }
  }
  const d = parseTranscriptOffline(transcript, p);
  return { ...d, items: applyPricingMode(applyRememberedPrices(d.items, history), p), source: 'offline' };
}
