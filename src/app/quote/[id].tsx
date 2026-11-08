import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Field, Icon, Label, StatusPill, s as ui, type IconName } from '@/components/ui';
import { removeFromCalendar } from '@/lib/calendar';
import { addPhoto, deletePhoto } from '@/lib/files';
import { formatBooking } from '@/lib/schedule';
import { uid } from '@/lib/id';
import { labourLine } from '@/lib/labour';
import { calcTotals, formatGBP, lineTotal } from '@/lib/money';
import { shareQuotePdf } from '@/lib/pdf';
import { useStore } from '@/lib/store';
import type { ItemKind, LineItem, Quote, QuoteStatus } from '@/lib/types';
import { quoteMessage, whatsAppUrl } from '@/lib/whatsapp';
import { colors, radius, space, STATUS_META, type } from '@/theme';

const KIND_META: Record<ItemKind, { label: string; icon: IconName }> = {
  labour: { label: 'Labour', icon: 'account-hard-hat' },
  material: { label: 'Materials', icon: 'package-variant-closed' },
  other: { label: 'Other', icon: 'dots-horizontal-circle-outline' },
};

/** Numeric input that keeps its own text so "12." or "" don't fight the user. */
function NumInput({ value, onChange, style, prefix }: { value: number; onChange: (n: number) => void; style?: object; prefix?: string }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (Number(text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <View style={[st.num, style]}>
      {prefix ? <Text style={{ color: colors.muted, fontWeight: '600' }}>{prefix}</Text> : null}
      <TextInput
        value={text}
        keyboardType="decimal-pad"
        selectTextOnFocus
        onChangeText={(t) => {
          const clean = t.replace(/[^0-9.]/g, '');
          setText(clean);
          const n = Number(clean);
          if (!Number.isNaN(n)) onChange(n);
        }}
        style={st.numInput}
      />
    </View>
  );
}

export default function QuoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { quotes, profile, updateQuote, deleteQuote, duplicateQuote } = useStore();
  const q = quotes.find((x) => x.id === id);
  const [sharing, setSharing] = useState(false);
  // Hide the send bar while typing so it never sits on top of the field being edited.
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setTyping(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setTyping(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  if (!q) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted }}>Quote not found.</Text>
      </View>
    );
  }

  const t = calcTotals(q.items, profile.vatRegistered, q.depositPct);
  const set = (patch: Partial<Quote>) => updateQuote(q.id, patch);
  const setItem = (itemId: string, patch: Partial<LineItem>) => set({ items: q.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) });
  const addItem = (kind: ItemKind) =>
    set({
      items: [
        ...q.items,
        kind === 'labour'
          ? labourLine(profile)
          : { id: uid(), kind, description: '', qty: 1, unit: kind === 'material' ? 'each' : 'job', unitPrice: 0 },
      ],
    });
  const removeItem = (itemId: string) => set({ items: q.items.filter((i) => i.id !== itemId) });
  const setStatus = (status: QuoteStatus) => {
    set({ status });
    // Won it? Straight to booking it in.
    if (status === 'accepted' && !q.booking) router.push({ pathname: '/book/[id]', params: { id: q.id } });
  };
  const photos = q.photos ?? [];
  const takePhoto = async (source: 'camera' | 'library') => {
    try {
      const uri = await addPhoto(source);
      if (uri) set({ photos: [...photos, uri] });
    } catch (e) {
      Alert.alert('Couldn’t add photo', e instanceof Error ? e.message : String(e));
    }
  };
  const removePhoto = (uri: string) => {
    deletePhoto(uri);
    set({ photos: photos.filter((p) => p !== uri) });
  };

  const sendWhatsApp = async () => {
    if (!q.client.phone.trim()) {
      Alert.alert('Add a mobile number', 'Pop the client’s number in so WhatsApp knows who to send it to.');
      return;
    }
    await Linking.openURL(whatsAppUrl(q.client.phone, quoteMessage(q, profile)));
    const now = Date.now();
    set({
      status: q.status === 'draft' ? 'sent' : q.status,
      sentAt: q.sentAt ?? new Date(now).toISOString(),
      followUpAt: new Date(now + profile.followUpDays * 86400000).toISOString(),
    });
  };

  const pdf = async (kind: 'Quote' | 'Invoice') => {
    setSharing(true);
    try {
      await shareQuotePdf(q, profile, kind);
      if (kind === 'Invoice' && q.status !== 'paid') set({ status: 'invoiced' });
    } catch (e) {
      Alert.alert('Couldn’t create PDF', e instanceof Error ? e.message : String(e));
    } finally {
      setSharing(false);
    }
  };

  const confirmDelete = () => {
    const go = () => {
      removeFromCalendar(q.booking?.eventIds ?? []);
      deleteQuote(q.id);
      router.back();
    };
    if (Platform.OS === 'web') go();
    else Alert.alert('Delete quote?', 'This can’t be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: go }]);
  };

  const groups = (['labour', 'material', 'other'] as ItemKind[]).map((k) => ({ kind: k, items: q.items.filter((i) => i.kind === k) }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: q.example ? `${q.number} · Example` : q.number, headerRight: () => <StatusPill status={q.status} /> }} />
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
        <TextInput value={q.title} onChangeText={(title) => set({ title })} style={st.title} multiline={Platform.OS !== 'web'} placeholder="Job title" />
        <Text style={{ color: colors.muted, marginTop: 4 }}>
          {q.trade} · created {new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </Text>

        {q.booking ? (
          <Pressable onPress={() => router.push({ pathname: '/book/[id]', params: { id: q.id } })} style={st.booked} accessibilityLabel="Change booking">
            <Icon name="calendar-check" color={colors.green} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 15 }}>Booked in: {formatBooking(q.booking)}</Text>
              <Text style={{ color: colors.muted, marginTop: 2 }}>{q.booking.eventIds.length ? 'In your phone’s calendar' : 'Saved in Graft'} · tap to change</Text>
            </View>
            <Icon name="chevron-right" color={colors.faint} />
          </Pressable>
        ) : ['accepted', 'invoiced'].includes(q.status) ? (
          <Pressable onPress={() => router.push({ pathname: '/book/[id]', params: { id: q.id } })} style={st.bookIt} accessibilityLabel="Book it in">
            <Icon name="calendar-plus" color={colors.ink} size={22} />
            <Text style={{ flex: 1, fontWeight: '800', color: colors.ink, fontSize: 15 }}>Won it? Book it in</Text>
            <Icon name="chevron-right" color={colors.ink} />
          </Pressable>
        ) : null}

        {q.assumptions.length > 0 && q.status === 'draft' && (
          <View style={st.assume}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Icon name="alert-circle-outline" color={colors.amberDeep} size={18} />
              <Text style={{ fontWeight: '800', color: colors.ink }}>Quick check before you send</Text>
            </View>
            {q.assumptions.map((a) => (
              <Text key={a} style={{ color: colors.ink2, lineHeight: 20 }}>
                • {a}
              </Text>
            ))}
            <Pressable onPress={() => set({ assumptions: [] })} hitSlop={8} style={{ marginTop: 8 }}>
              <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>All good, hide this</Text>
            </Pressable>
          </View>
        )}

        <Label style={st.sectionLabel}>Client</Label>
        <Card style={{ gap: space(3) }}>
          <Field label="Name" value={q.client.name} onChangeText={(name) => set({ client: { ...q.client, name } })} placeholder="Sue Jones" autoCapitalize="words" />
          <Field label="Mobile (for WhatsApp)" value={q.client.phone} onChangeText={(phone) => set({ client: { ...q.client, phone } })} placeholder="07700 900123" keyboardType="phone-pad" />
          <Field label="Address" value={q.client.address} onChangeText={(address) => set({ client: { ...q.client, address } })} placeholder="12 High Street, Bath" />
        </Card>

        <View style={st.groupHead}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="camera-outline" size={18} color={colors.muted} />
            <Label>Site photos</Label>
          </View>
          <Text style={{ color: colors.faint, fontSize: 12 }}>Added to the PDF</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {photos.map((uri) => (
            <View key={uri}>
              <Image source={{ uri }} style={st.photo} />
              <Pressable onPress={() => removePhoto(uri)} style={st.photoX} hitSlop={8} accessibilityLabel="Remove photo">
                <Icon name="close" size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {Platform.OS !== 'web' && (
            <Pressable onPress={() => takePhoto('camera')} style={st.photoAdd} accessibilityLabel="Take a photo">
              <Icon name="camera-plus-outline" size={26} color={colors.amberDeep} />
              <Text style={st.photoAddText}>Take photo</Text>
            </Pressable>
          )}
          <Pressable onPress={() => takePhoto('library')} style={st.photoAdd} accessibilityLabel="Choose a photo">
            <Icon name="image-plus" size={26} color={colors.amberDeep} />
            <Text style={st.photoAddText}>From gallery</Text>
          </Pressable>
        </ScrollView>

        {groups.map(({ kind, items }) => (
          <View key={kind}>
            <View style={[st.groupHead]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name={KIND_META[kind].icon} size={18} color={colors.muted} />
                <Label>{KIND_META[kind].label}</Label>
              </View>
              <Pressable onPress={() => addItem(kind)} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="plus" size={16} color={colors.amberDeep} />
                <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>Add</Text>
              </Pressable>
            </View>
            {items.length === 0 ? null : (
              <Card style={{ padding: 0 }}>
                {items.map((i, idx) => (
                  <View key={i.id} style={[st.item, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                      <TextInput value={i.description} onChangeText={(description) => setItem(i.id, { description })} placeholder="Description" placeholderTextColor={colors.faint} style={st.desc} multiline={Platform.OS !== 'web'} />
                      <Pressable onPress={() => removeItem(i.id)} hitSlop={10} accessibilityLabel="Remove line">
                        <Icon name="close-circle" size={20} color={colors.faint} />
                      </Pressable>
                    </View>
                    <View style={st.itemRow}>
                      <NumInput value={i.qty} onChange={(qty) => setItem(i.id, { qty })} style={{ width: 62 }} />
                      <TextInput value={i.unit} onChangeText={(unit) => setItem(i.id, { unit })} style={st.unit} placeholder="unit" />
                      <Text style={{ color: colors.faint }}>×</Text>
                      <NumInput value={i.unitPrice} onChange={(unitPrice) => setItem(i.id, { unitPrice })} prefix="£" style={{ width: 86 }} />
                      <Text style={[st.lineTotal, type.money]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{formatGBP(lineTotal(i))}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </View>
        ))}

        <Label style={st.sectionLabel}>Terms</Label>
        <Card style={{ gap: space(3) }}>
          <View style={st.termRow}>
            <Text style={st.termLabel}>Days on site</Text>
            <NumInput value={q.estimatedDays} onChange={(estimatedDays) => set({ estimatedDays })} style={{ width: 80 }} />
          </View>
          <View style={st.termRow}>
            <Text style={st.termLabel}>Deposit %</Text>
            <NumInput value={q.depositPct} onChange={(depositPct) => set({ depositPct: Math.min(100, depositPct) })} style={{ width: 80 }} />
          </View>
          <View style={st.termRow}>
            <Text style={st.termLabel}>Valid for (days)</Text>
            <NumInput value={q.validDays} onChange={(validDays) => set({ validDays })} style={{ width: 80 }} />
          </View>
          <Field label="Note to client" value={q.notes} onChangeText={(notes) => set({ notes })} multiline placeholder="What’s included, waste removal, start date…" />
        </Card>

        <Card style={[st.totals]}>
          <Row label="Labour" value={formatGBP(t.labour)} />
          <Row label="Materials" value={formatGBP(t.materials)} />
          {t.other ? <Row label="Other" value={formatGBP(t.other)} /> : null}
          {profile.vatRegistered ? <Row label="VAT 20%" value={formatGBP(t.vat)} /> : null}
          <View style={st.totalLine}>
            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>Total{profile.vatRegistered ? '' : ' (no VAT)'}</Text>
            <Text style={[{ color: colors.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 }, type.money]}>{formatGBP(t.total)}</Text>
          </View>
          {q.depositPct > 0 ? <Row label={`Deposit to book (${q.depositPct}%)`} value={formatGBP(t.deposit)} accent /> : null}
        </Card>

        <Label style={st.sectionLabel}>Status</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(STATUS_META) as QuoteStatus[]).map((s) => (
            <Chip key={s} label={STATUS_META[s].label} active={q.status === s} onPress={() => setStatus(s)} />
          ))}
        </View>

        <View style={{ gap: 10, marginTop: space(6) }}>
          <Button variant="ghost" icon="file-pdf-box" title="Share as PDF" onPress={() => pdf('Quote')} loading={sharing} />
          {['accepted', 'invoiced', 'paid'].includes(q.status) && <Button variant="dark" icon="receipt" title="Send invoice" onPress={() => pdf('Invoice')} />}
          <Button
            variant="ghost"
            icon="content-copy"
            title="Duplicate as new quote"
            onPress={() => {
              const n = duplicateQuote(q.id);
              if (n) router.replace(`/quote/${n.id}`);
            }}
          />
          <Button variant="danger" icon="trash-can-outline" title="Delete" onPress={confirmDelete} />
        </View>

        {q.transcript ? (
          <View style={{ marginTop: space(6) }}>
            <Label>What you said</Label>
            <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 21, fontStyle: 'italic' }}>“{q.transcript}”</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[st.bar, { paddingBottom: insets.bottom + space(3) }, typing && { display: 'none' }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>Total</Text>
          <Text style={[{ fontSize: 22, fontWeight: '800', color: colors.ink }, type.money]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{formatGBP(t.total)}</Text>
        </View>
        <Button variant="whatsapp" icon="whatsapp" title={q.status === 'draft' ? 'Send on WhatsApp' : 'Resend'} onPress={sendWhatsApp} style={{ flex: 1.5, paddingHorizontal: 12 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: accent ? colors.amber : 'rgba(255,255,255,0.65)', fontWeight: accent ? '700' : '500' }}>{label}</Text>
      <Text style={[{ color: accent ? colors.amber : colors.white, fontWeight: '700' }, type.money]}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  title: { ...type.h1, color: colors.ink, padding: 0 },
  assume: { backgroundColor: colors.amberSoft, borderRadius: radius.md, padding: space(4), marginTop: space(5), borderWidth: 1, borderColor: '#FBD38D' },
  sectionLabel: { marginTop: space(7), marginBottom: space(2) },
  groupHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space(7), marginBottom: space(2) },
  item: { padding: space(4), gap: 10 },
  desc: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, padding: 0 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  num: { flexDirection: 'row', alignItems: 'center', gap: 2, ...ui.input, paddingVertical: 8, paddingHorizontal: 10 },
  numInput: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, padding: 0, minWidth: 30 },
  unit: { width: 48, fontSize: 14, color: colors.muted, padding: 0 },
  lineTotal: { flex: 1, minWidth: 0, textAlign: 'right', fontWeight: '700', color: colors.text },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  termLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  totals: { backgroundColor: colors.ink, borderColor: colors.ink, marginTop: space(6), padding: space(5) },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', marginTop: 8, paddingTop: 12, paddingBottom: 4 },
  photo: { width: 104, height: 104, borderRadius: radius.md, backgroundColor: colors.line },
  photoX: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(11,23,38,0.7)', alignItems: 'center', justifyContent: 'center' },
  photoAdd: { width: 104, height: 104, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#F5C46B', backgroundColor: colors.amberSoft, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoAddText: { color: colors.amberDeep, fontWeight: '700', fontSize: 12 },
  booked: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.greenSoft, borderColor: '#BBE5CB', borderWidth: 1, borderRadius: radius.md, padding: space(4), marginTop: space(5) },
  bookIt: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.amber, borderRadius: radius.md, padding: space(4), marginTop: space(5) },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: space(4), paddingHorizontal: space(4), paddingTop: space(3), backgroundColor: colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
});
