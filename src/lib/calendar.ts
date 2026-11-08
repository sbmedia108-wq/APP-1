import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';
import { calcTotals, formatGBP } from './money';
import { fromKey, runs, workDates } from './schedule';
import type { Booking, BusinessProfile, Quote } from './types';

export const calendarSupported = Platform.OS !== 'web';

export class CalendarPermissionError extends Error {}

/** The phone's main writable calendar (Google account on Android, default on iPhone). */
async function pickCalendarId(): Promise<string> {
  const perm = await Calendar.requestCalendarPermissionsAsync();
  if (!perm.granted) throw new CalendarPermissionError('Calendar access is off. Turn it on in your phone’s Settings → Apps → Graft → Permissions.');
  if (Platform.OS === 'ios') return (await Calendar.getDefaultCalendarAsync()).id;
  const cals = (await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)).filter((c) => c.allowsModifications);
  const best =
    cals.find((c) => c.isPrimary && c.source?.type === 'com.google') ??
    cals.find((c) => c.isPrimary) ??
    cals.find((c) => c.source?.type === 'com.google') ??
    cals[0];
  if (best) return best.id;
  // No account calendar on the phone: make a local one so bookings still land somewhere
  return Calendar.createCalendarAsync({
    title: 'Graft jobs', color: '#FFB020', entityType: Calendar.EntityTypes.EVENT, name: 'graft', ownerAccount: 'graft',
    accessLevel: Calendar.CalendarAccessLevel.OWNER, source: { isLocalAccount: true, name: 'Graft', type: Calendar.SourceType.LOCAL as never },
  });
}

/** All-day dates: Android wants UTC midnights, iPhone wants local ones. */
function allDay(start: string, endInclusive: string) {
  const s = fromKey(start);
  const e = fromKey(endInclusive);
  e.setDate(e.getDate() + 1);
  if (Platform.OS === 'android') {
    return { startDate: new Date(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())), endDate: new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())), timeZone: 'UTC' };
  }
  return { startDate: s, endDate: e, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
}

function details(q: Quote, p: BusinessProfile) {
  const total = calcTotals(q.items, p.vatRegistered, q.depositPct);
  return {
    title: `${q.title}${q.client.name ? ` – ${q.client.name}` : ''}`,
    location: q.client.address,
    notes: [
      q.client.name && `Client: ${q.client.name}`,
      q.client.phone && `Phone: ${q.client.phone}`,
      q.client.address && `Address: ${q.client.address}`,
      `Quote ${q.number} · ${formatGBP(total.total)}${q.depositPct ? ` · deposit ${formatGBP(total.deposit)}` : ''}`,
      q.notes,
      'Booked with Graft',
    ]
      .filter(Boolean)
      .join('\n'),
  };
}

/** Puts the job in the phone calendar (one event per run of consecutive days). Replaces any earlier events. */
export async function bookInCalendar(q: Quote, p: BusinessProfile, b: Omit<Booking, 'eventIds'>): Promise<string[]> {
  await removeFromCalendar(q.booking?.eventIds ?? []);
  const calendarId = await pickCalendarId();
  const ids: string[] = [];
  for (const r of runs(workDates(b.start, b.days, b.weekends))) {
    ids.push(
      await Calendar.createEventAsync(calendarId, {
        ...details(q, p),
        ...allDay(r.start, r.end),
        allDay: true,
        availability: Calendar.Availability.BUSY,
        alarms: b.reminder ? [{ relativeOffset: -360 }] : [], // 6pm the evening before
      }),
    );
  }
  return ids;
}

export async function removeFromCalendar(ids: string[]) {
  if (!calendarSupported) return;
  for (const id of ids) {
    try {
      await Calendar.deleteEventAsync(id);
    } catch {
      // already deleted in the calendar app
    }
  }
}
