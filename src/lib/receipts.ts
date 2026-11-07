import { round2, VAT_RATE } from './money.ts';
import { customId } from './materialImport.ts';
import type { Material } from './materials.ts';
import type { Purchase } from './types.ts';

/** "2026-11" for grouping; falls back to when it was scanned. */
export const monthKey = (p: Purchase) => (p.date || p.createdAt).slice(0, 7);

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

/** Totals for a list of purchases, for the month summary and dashboard. */
export function summarise(purchases: Purchase[]) {
  let net = 0;
  let vat = 0;
  let total = 0;
  for (const p of purchases) {
    net += p.subtotal;
    vat += p.vat;
    total += p.total;
  }
  return { count: purchases.length, net: round2(net), vat: round2(vat), total: round2(total) };
}

export function groupByMonth(purchases: Purchase[]): { key: string; label: string; items: Purchase[] }[] {
  const map = new Map<string, Purchase[]>();
  for (const p of [...purchases].sort((a, b) => (b.date || b.createdAt).localeCompare(a.date || a.createdAt))) {
    const k = monthKey(p);
    map.set(k, [...(map.get(k) ?? []), p]);
  }
  return [...map.entries()].map(([key, items]) => ({ key, label: monthLabel(key), items }));
}

/** Fills subtotal/VAT/total from the lines when the receipt didn't show them. */
export function fillTotals(p: Purchase): Purchase {
  const lines = round2(p.items.reduce((s, i) => s + i.qty * i.unitPrice, 0));
  let { subtotal, vat, total } = p;
  if (!total && lines) total = p.pricesIncludeVat ? lines : round2(lines + (vat || 0));
  if (!subtotal && total) subtotal = round2(total - (vat || 0));
  return { ...p, subtotal, vat, total };
}

/**
 * Turns receipt lines into the user's own materials (ex-VAT unit prices), so their real
 * trade prices are used next time they quote. VAT is stripped at the standard rate when
 * the receipt's prices included it.
 */
export function purchaseToMaterials(p: Purchase): Material[] {
  return p.items
    .filter((i) => i.description.trim() && i.unitPrice > 0)
    .map((i) => {
      const name = i.description.trim().replace(/\s+/g, ' ');
      const price = p.pricesIncludeVat ? round2(i.unitPrice / (1 + VAT_RATE)) : i.unitPrice;
      return { id: customId(name), name, unit: i.unit || 'each', price, category: p.supplier ? `From ${p.supplier}` : 'My materials', keywords: [name.toLowerCase()], custom: true };
    });
}
