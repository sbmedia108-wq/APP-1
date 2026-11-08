import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Icon, Label } from '@/components/ui';
import { bookInCalendar, calendarSupported, CalendarPermissionError, removeFromCalendar } from '@/lib/calendar';
import { busyDates, formatBooking, fromKey, longDate, nextWorkingDay, toKey, workDates } from '@/lib/schedule';
import { useStore } from '@/lib/store';
import { bookingMessage, whatsAppUrl } from '@/lib/whatsapp';
import { colors, radius, space, type } from '@/theme';

const DAYS_AHEAD = 70;

export default function Book() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quotes, profile, updateQuote } = useStore();
  const q = quotes.find((x) => x.id === id);
  const existing = q?.booking;
  const [start, setStart] = useState(existing?.start ?? nextWorkingDay());
  const [days, setDays] = useState(existing?.days ?? Math.max(1, Math.ceil(q?.estimatedDays ?? 1)));
  const [weekends, setWeekends] = useState(existing?.weekends ?? false);
  const [reminder, setReminder] = useState(existing?.reminder ?? true);
  const [tellClient, setTellClient] = useState(!existing && Boolean(q?.client.phone));
  const [busy, setBusy] = useState(false);

  const taken = useMemo(() => busyDates(quotes, id), [quotes, id]);
  const chosen = useMemo(() => new Set(workDates(start, days, weekends)), [start, days, weekends]);
  const clashes = [...chosen].filter((d) => taken.has(d));

  const weeks = useMemo(() => {
    const out: string[][] = [];
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // back to Monday
    for (let w = 0; w < Math.ceil(DAYS_AHEAD / 7); w++) {
      const row: string[] = [];
      for (let i = 0; i < 7; i++) {
        row.push(toKey(d));
        d.setDate(d.getDate() + 1);
      }
      out.push(row);
    }
    return out;
  }, []);
  const today = toKey(new Date());

  if (!q) return null;

  const save = async () => {
    setBusy(true);
    try {
      let eventIds: string[] = [];
      if (calendarSupported) eventIds = await bookInCalendar(q, profile, { start, days, weekends, reminder });
      const booking = { start, days, weekends, reminder, eventIds };
      updateQuote(q.id, { booking, status: q.status === 'draft' || q.status === 'sent' ? 'accepted' : q.status });
      if (tellClient && q.client.phone) {
        await Linking.openURL(whatsAppUrl(q.client.phone, bookingMessage(q, profile, workDates(start, days, weekends), longDate)));
      }
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert(e instanceof CalendarPermissionError ? 'Calendar access needed' : 'Couldn’t add to calendar', msg);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    await removeFromCalendar(existing?.eventIds ?? []);
    updateQuote(q.id, { booking: undefined });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: 60, gap: space(4) }}>
      <View>
        <Text style={type.h2}>{q.title}</Text>
        <Text style={{ color: colors.muted, marginTop: 2 }}>{[q.client.name, q.client.address].filter(Boolean).join(' · ') || q.number}</Text>
      </View>

      <Card style={{ gap: space(2) }}>
        <Label>Start date</Label>
        <View style={st.weekHead}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={i} style={st.weekHeadText}>
              {d}
            </Text>
          ))}
        </View>
        {weeks.map((w) => (
          <View key={w[0]} style={{ flexDirection: 'row' }}>
            {w.map((k) => {
              const past = k < today;
              const sel = chosen.has(k);
              const isStart = k === start;
              const clash = taken.has(k);
              const dt = fromKey(k);
              const showMonth = dt.getDate() === 1 || k === weeks[0]![0];
              return (
                <Pressable
                  key={k}
                  disabled={past}
                  onPress={() => setStart(k)}
                  style={[st.day, sel && st.daySel, isStart && st.dayStart, past && { opacity: 0.25 }]}
                  accessibilityLabel={`${longDate(k)}${clash ? `, booked for ${taken.get(k)}` : ''}`}
                >
                  <Text style={[st.month, isStart && { color: colors.ink }]}>{showMonth ? dt.toLocaleDateString('en-GB', { month: 'short' }) : ' '}</Text>
                  <Text style={[st.dayNum, (sel || isStart) && { color: colors.ink, fontWeight: '800' }]}>{dt.getDate()}</Text>
                  <View style={[st.dot, clash && { backgroundColor: sel ? colors.red : colors.muted }]} />
                </Pressable>
              );
            })}
          </View>
        ))}
        <Text style={{ color: colors.faint, fontSize: 12 }}>Dots mark days you’ve already booked in.</Text>
      </Card>

      <Card style={{ gap: space(4) }}>
        <View style={st.row}>
          <Text style={st.label}>Days on site</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => setDays((d) => Math.max(1, d - 1))} style={st.step} accessibilityLabel="One day fewer">
              <Icon name="minus" />
            </Pressable>
            <Text style={[{ fontSize: 20, fontWeight: '800', minWidth: 24, textAlign: 'center', color: colors.text }, type.money]}>{days}</Text>
            <Pressable onPress={() => setDays((d) => Math.min(60, d + 1))} style={st.step} accessibilityLabel="One more day">
              <Icon name="plus" />
            </Pressable>
          </View>
        </View>
        <View style={st.row}>
          <Text style={st.label}>Work weekends</Text>
          <Switch value={weekends} onValueChange={setWeekends} trackColor={{ true: colors.amber, false: colors.line }} thumbColor={colors.white} />
        </View>
        <View style={st.row}>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Remind me the night before</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>6pm, so you can load the van</Text>
          </View>
          <Switch value={reminder} onValueChange={setReminder} trackColor={{ true: colors.amber, false: colors.line }} thumbColor={colors.white} />
        </View>
        {q.client.phone ? (
          <View style={st.row}>
            <View style={{ flex: 1 }}>
              <Text style={st.label}>WhatsApp the client to confirm</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Dates{q.depositPct ? ' and deposit' : ''}, ready to send</Text>
            </View>
            <Switch value={tellClient} onValueChange={setTellClient} trackColor={{ true: colors.whatsapp, false: colors.line }} thumbColor={colors.white} />
          </View>
        ) : null}
      </Card>

      <View style={st.summary}>
        <Icon name="calendar-check" color={colors.amber} size={22} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>{formatBooking({ start, days, weekends })}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{calendarSupported ? 'Goes straight into your phone’s calendar' : 'Calendar sync works in the phone app'}</Text>
        </View>
      </View>
      {clashes.length > 0 && (
        <Text style={{ color: colors.red, fontWeight: '600' }}>
          Heads up: {clashes.length === 1 ? 'one day overlaps' : `${clashes.length} days overlap`} with {[...new Set(clashes.map((d) => taken.get(d)))].join(', ')}.
        </Text>
      )}

      <Button title={existing ? 'Move booking' : 'Book it in'} icon="calendar-plus" onPress={save} loading={busy} />
      {existing && <Button variant="danger" icon="calendar-remove" title="Cancel booking" onPress={cancel} />}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  weekHead: { flexDirection: 'row' },
  weekHeadText: { flex: 1, textAlign: 'center', color: colors.faint, fontWeight: '700', fontSize: 12 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 3, borderRadius: radius.sm, margin: 1 },
  daySel: { backgroundColor: colors.amberSoft },
  dayStart: { backgroundColor: colors.amber },
  month: { fontSize: 9, fontWeight: '700', color: colors.faint, textTransform: 'uppercase' },
  dayNum: { fontSize: 15, fontWeight: '600', color: colors.text },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  step: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.ink, borderRadius: radius.md, padding: space(4) },
});
