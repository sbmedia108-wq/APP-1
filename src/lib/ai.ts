/**
 * Turns a transcript into a draft quote.
 * Tries the Graft Quote API (Claude) first; falls back to the on-device parser
 * when offline, unconfigured, or the request fails — the user always gets a draft.
 */
import { applyRememberedPrices, findSimilarJobs } from './memory';
import { allMaterials, MATERIAL_BY_ID } from './materials';
import { applyPricingMode, parseTranscriptOffline, type ParsedDraft } from './parser';
import { uid } from './id';
import { calcTotals } from './money';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { BusinessProfile, Purchase, Quote } from './types';

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
  const pinned = [...Object.keys(profile.priceBook ?? {}).map((id) => MATERIAL_BY_ID[id]?.name), ...allMaterials().filter((m) => m.custom).map((m) => m.name)].filter((x): x is string => Boolean(x));
  return { ...d, items: applyPricingMode(applyRememberedPrices(d.items, history, pinned), p), source: 'offline' };
}

export class NoServerError extends Error {}

/**
 * Reads a receipt photo into purchase fields using the Graft server (Claude vision).
 * The photo is shrunk to ~1600px first to keep uploads small on site.
 */
export async function readReceipt(photoUri: string): Promise<Partial<Purchase>> {
  if (!API_URL) throw new NoServerError('Automatic reading needs the Graft server.');
  const ref = await ImageManipulator.manipulate(photoUri).resize({ width: 1600 }).renderAsync();
  const img = await ref.saveAsync({ compress: 0.75, format: SaveFormat.JPEG, base64: true });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60_000);
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/v1/receipt/parse`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(API_TOKEN ? { authorization: `Bearer ${API_TOKEN}` } : {}) },
      body: JSON.stringify({ imageBase64: img.base64, mediaType: 'image/jpeg' }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { error?: string }).error ?? `Server error ${res.status}`);
    const r = (await res.json()) as {
      isReceipt: boolean; supplier: string; supplierBranch: string; supplierVatNumber: string; date: string; reference: string;
      items: { description: string; qty: number; unit: string; unitPrice: number }[]; subtotal: number; vat: number; total: number;
      pricesIncludeVat: boolean; paymentMethod: string; unreadable: string[];
    };
    if (!r.isReceipt) throw new Error('That doesn’t look like a receipt or invoice. Try again with the whole receipt in shot.');
    return {
      supplier: r.supplier, branch: r.supplierBranch, supplierVatNumber: r.supplierVatNumber, date: /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : '',
      reference: r.reference, items: r.items.map((i) => ({ ...i, id: uid() })), subtotal: r.subtotal, vat: r.vat, total: r.total,
      pricesIncludeVat: r.pricesIncludeVat, paymentMethod: r.paymentMethod, unreadable: r.unreadable,
    };
  } finally {
    clearTimeout(timer);
  }
}
