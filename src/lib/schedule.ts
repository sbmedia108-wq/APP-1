import type { Booking, Quote } from './types.ts';

const pad = (n: number) => String(n).padStart(2, '0');
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Parses YYYY-MM-DD as a local date (not UTC), so days never shift. */
export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
};
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

/** The dates on site: `days` working days from `start`, skipping weekends unless asked. */
export function workDates(start: string, days: number, weekends: boolean): string[] {
  const out: string[] = [];
  const d = fromKey(start);
  if (!weekends) while (isWeekend(d)) d.setDate(d.getDate() + 1);
  const n = Math.max(1, Math.ceil(days));
  while (out.length < n) {
    if (weekends || !isWeekend(d)) out.push(toKey(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Groups dates into runs of consecutive days — one calendar event per run. */
export function runs(dates: string[]): { start: string; end: string }[] {
  const out: { start: string; end: string }[] = [];
  for (const k of dates) {
    const last = out[out.length - 1];
    const next = last ? fromKey(last.end) : undefined;
    next?.setDate(next.getDate() + 1);
    if (last && next && toKey(next) === k) last.end = k;
    else out.push({ start: k, end: k });
  }
  return out;
}

const day = (k: string) => fromKey(k).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
const dayMonth = (k: string) => fromKey(k).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/** "Mon 17 Nov", "Mon 17 – Wed 19 Nov", "Thu 27 Nov – Tue 2 Dec" */
export function formatBooking(b: Pick<Booking, 'start' | 'days' | 'weekends'>): string {
  const ds = workDates(b.start, b.days, b.weekends);
  const first = ds[0]!;
  const last = ds[ds.length - 1]!;
  if (first === last) return dayMonth(first);
  return fromKey(first).getMonth() === fromKey(last).getMonth() ? `${day(first)} – ${dayMonth(last)}` : `${dayMonth(first)} – ${dayMonth(last)}`;
}

/** Long form for the client message: "Monday 17th November". */
export function longDate(k: string): string {
  const d = fromKey(k);
  const n = d.getDate();
  const suffix = n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th';
  return `${d.toLocaleDateString('en-GB', { weekday: 'long' })} ${n}${suffix} ${d.toLocaleDateString('en-GB', { month: 'long' })}`;
}

/** Booked jobs that haven't finished yet, soonest first. */
export function upcoming(quotes: Quote[], today = toKey(new Date())): { quote: Quote; dates: string[] }[] {
  return quotes
    .filter((q) => q.booking)
    .map((q) => ({ quote: q, dates: workDates(q.booking!.start, q.booking!.days, q.booking!.weekends) }))
    .filter((x) => x.dates[x.dates.length - 1]! >= today)
    .sort((a, b) => a.dates[0]!.localeCompare(b.dates[0]!));
}

/** Days already taken by other booked jobs, for spotting clashes. */
export function busyDates(quotes: Quote[], exceptId?: string): Map<string, string> {
  const m = new Map<string, string>();
  for (const q of quotes) {
    if (!q.booking || q.id === exceptId) continue;
    for (const d of workDates(q.booking.start, q.booking.days, q.booking.weekends)) m.set(d, q.client.name || q.title);
  }
  return m;
}

/** Next working day after today: the default start date. */
export function nextWorkingDay(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  while (isWeekend(d)) d.setDate(d.getDate() + 1);
  return toKey(d);
}
