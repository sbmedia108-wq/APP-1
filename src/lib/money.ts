import type { LineItem } from './types.ts';

export const VAT_RATE = 0.2;

export interface Totals {
  labour: number;
  materials: number;
  other: number;
  subtotal: number;
  vat: number;
  total: number;
  deposit: number;
}

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const lineTotal = (i: Pick<LineItem, 'qty' | 'unitPrice'>) => round2((i.qty || 0) * (i.unitPrice || 0));

export function calcTotals(items: LineItem[], vatRegistered: boolean, depositPct = 0): Totals {
  let labour = 0;
  let materials = 0;
  let other = 0;
  for (const i of items) {
    const t = lineTotal(i);
    if (i.kind === 'labour') labour += t;
    else if (i.kind === 'material') materials += t;
    else other += t;
  }
  const subtotal = round2(labour + materials + other);
  const vat = vatRegistered ? round2(subtotal * VAT_RATE) : 0;
  const total = round2(subtotal + vat);
  const deposit = round2((total * Math.max(0, Math.min(100, depositPct))) / 100);
  return { labour: round2(labour), materials: round2(materials), other: round2(other), subtotal, vat, total, deposit };
}

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

export const formatGBP = (n: number) => gbp.format(n || 0);
/** Whole-pound format for dashboards: £1,850 */
export const formatGBP0 = (n: number) => gbp0.format(n || 0);
