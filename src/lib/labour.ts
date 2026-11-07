import { uid } from './id';
import type { BusinessProfile, LineItem, PricingMode } from './types';

export const PRICING_MODES: { id: PricingMode; label: string; hint: string }[] = [
  { id: 'day', label: 'By the day', hint: 'Day rate × days on site' },
  { id: 'hour', label: 'By the hour', hint: 'Hourly rate × hours' },
  { id: 'job', label: 'Price per job', hint: 'One labour price for the whole job' },
];

/** A fresh labour line in the way this user prices. */
export function labourLine(p: BusinessProfile): LineItem {
  if (p.pricingMode === 'hour') return { id: uid(), kind: 'labour', description: 'Labour', qty: 8, unit: 'hour', unitPrice: p.hourlyRate };
  if (p.pricingMode === 'job') return { id: uid(), kind: 'labour', description: 'Labour', qty: 1, unit: 'job', unitPrice: p.dayRate };
  return { id: uid(), kind: 'labour', description: 'Labour', qty: 1, unit: 'day', unitPrice: p.dayRate };
}
