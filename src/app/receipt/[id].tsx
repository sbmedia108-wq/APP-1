import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button, Card, Chip, Field, Icon, Label, s as ui } from '@/components/ui';
import { aiConfigured, NoServerError, readReceipt } from '@/lib/ai';
import { deletePhoto } from '@/lib/files';
import { uid } from '@/lib/id';
import { formatGBP } from '@/lib/money';
import { sharePurchasePdf } from '@/lib/pdf';
import { fillTotals, purchaseToMaterials } from '@/lib/receipts';
import { useStore } from '@/lib/store';
import type { PurchaseItem } from '@/lib/types';
import { colors, radius, space, type } from '@/theme';

function Num({ value, onChange, width = 90, prefix }: { value: number; onChange: (n: number) => void; width?: number; prefix?: string }) {
  const [t, setT] = useState(value ? String(value) : '');
  useEffect(() => {
    if (Number(t || 0) !== value) setT(value ? String(value) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <View style={[ui.input, { flexDirection: 'row', alignItems: 'center', width, paddingVertical: 8, paddingHorizontal: 10 }]}>
      {prefix ? <Text style={{ color: colors.muted, fontWeight: '600' }}>{prefix}</Text> : null}
      <TextInput
        value={t}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.faint}
        onChangeText={(x) => {
          const c = x.replace(/[^0-9.]/g, '');
          setT(c);
          if (!Number.isNaN(Number(c))) onChange(Number(c || 0));
        }}
        style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, padding: 0, marginLeft: 2 }}
      />
    </View>
  );
}

export default function ReceiptScreen() {
  const { id, scan } = useLocalSearchParams<{ id: string; scan?: string }>();
  const { purchases, updatePurchase, deletePurchase, quotes, profile, importMaterials } = useStore();
  const x = purchases.find((p) => p.id === id);
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [sharing, setSharing] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!x || scan !== '1' || started.current || !x.photo) return;
    started.current = true;
    if (!aiConfigured) {
      setNotice('Receipt saved. Fill in the supplier and total below. Automatic reading switches on once the Graft server is connected.');
      return;
    }
    setReading(true);
    readReceipt(x.photo)
      .then((r) => updatePurchase(x.id, fillTotals({ ...x, ...r })))
      .then(() => setNotice('Read from your photo. Give it a quick check against the receipt.'))
      .catch((e) => setNotice(e instanceof NoServerError ? 'Receipt saved. Fill in the details below.' : `Couldn’t read it automatically (${e instanceof Error ? e.message : String(e)}). Fill in the details below.`))
      .finally(() => setReading(false));
  }, [x, scan, updatePurchase]);

  if (!x) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted }}>Receipt not found.</Text>
      </View>
    );
  }

  const set = (patch: Partial<typeof x>) => updatePurchase(x.id, patch);
  const setItem = (itemId: string, patch: Partial<PurchaseItem>) => set({ items: x.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) });
  const jobs = quotes.filter((q) => !q.example && q.status !== 'declined').slice(0, 8);
  const linesTotal = x.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  const pdf = async () => {
    setSharing(true);
    try {
      await sharePurchasePdf(x, profile, quotes.find((q) => q.id === x.quoteId));
    } catch (e) {
      Alert.alert('Couldn’t create PDF', e instanceof Error ? e.message : String(e));
    } finally {
      setSharing(false);
    }
  };

  const savePrices = () => {
    const mats = purchaseToMaterials(x);
    if (!mats.length) return;
    const r = importMaterials(mats);
    setNotice(`${r.added} added to your materials${r.updated ? `, ${r.updated} prices updated` : ''}. Next quote uses these prices.`);
  };

  const remove = () => {
    const go = () => {
      if (x.photo) deletePhoto(x.photo);
      deletePurchase(x.id);
      router.back();
    };
    if (Platform.OS === 'web') go();
    else Alert.alert('Delete this receipt?', 'The photo and record will be removed.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: go }]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: x.supplier || 'Receipt' }} />
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: 80, gap: space(4) }} keyboardShouldPersistTaps="handled">
        {x.photo ? (
          <Pressable onPress={() => setShowPhoto((v) => !v)} style={st.photoWrap} accessibilityLabel={showPhoto ? 'Shrink photo' : 'Show full photo'}>
            <Image source={{ uri: x.photo }} style={showPhoto ? st.photoFull : st.photoSmall} resizeMode={showPhoto ? 'contain' : 'cover'} />
            {reading && (
              <View style={st.reading}>
                <ActivityIndicator color={colors.amber} />
                <Text style={{ color: colors.white, fontWeight: '700' }}>Reading your receipt…</Text>
              </View>
            )}
          </Pressable>
        ) : null}

        {notice ? (
          <View style={st.notice}>
            <Icon name="information-outline" color={colors.amberDeep} size={18} />
            <Text style={{ flex: 1, color: colors.ink, lineHeight: 20 }}>{notice}</Text>
          </View>
        ) : null}
        {x.unreadable.length > 0 && (
          <View style={st.notice}>
            <Icon name="alert-circle-outline" color={colors.amberDeep} size={18} />
            <Text style={{ flex: 1, color: colors.ink, lineHeight: 20 }}>Couldn’t read clearly: {x.unreadable.join('; ')}</Text>
          </View>
        )}

        <Card style={{ gap: space(3) }}>
          <Field label="Supplier" value={x.supplier} onChangeText={(supplier) => set({ supplier })} placeholder="Screwfix" />
          <View style={{ flexDirection: 'row', gap: space(3) }}>
            <Field style={{ flex: 1 }} label="Date" value={x.date} onChangeText={(date) => set({ date })} placeholder="2026-11-07" />
            <Field style={{ flex: 1 }} label="Receipt no." value={x.reference} onChangeText={(reference) => set({ reference })} />
          </View>
          <Field label="Paid by" value={x.paymentMethod} onChangeText={(paymentMethod) => set({ paymentMethod })} placeholder="Card, cash, trade account" />
        </Card>

        <View>
          <View style={st.head}>
            <Label>Items</Label>
            <Pressable onPress={() => set({ items: [...x.items, { id: uid(), description: '', qty: 1, unit: 'each', unitPrice: 0 }] })} hitSlop={10} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              <Icon name="plus" size={16} color={colors.amberDeep} />
              <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>Add</Text>
            </Pressable>
          </View>
          {x.items.length > 0 && (
            <Card style={{ padding: 0 }}>
              {x.items.map((i, idx) => (
                <View key={i.id} style={[{ padding: space(4), gap: 10 }, idx > 0 && st.line]}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput value={i.description} onChangeText={(description) => setItem(i.id, { description })} placeholder="Item" placeholderTextColor={colors.faint} style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, padding: 0 }} />
                    <Pressable onPress={() => set({ items: x.items.filter((y) => y.id !== i.id) })} hitSlop={10} accessibilityLabel="Remove item">
                      <Icon name="close-circle" size={20} color={colors.faint} />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Num value={i.qty} onChange={(qty) => setItem(i.id, { qty })} width={70} />
                    <Text style={{ color: colors.faint }}>×</Text>
                    <Num value={i.unitPrice} onChange={(unitPrice) => setItem(i.id, { unitPrice })} prefix="£" width={100} />
                    <Text style={[{ flex: 1, textAlign: 'right', fontWeight: '700', color: colors.text }, type.money]}>{formatGBP(i.qty * i.unitPrice)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
          {x.items.length > 0 && (
            <View style={[st.head, { marginTop: 10 }]}>
              <Text style={{ color: colors.muted, flex: 1 }}>Prices include VAT</Text>
              <Switch value={x.pricesIncludeVat} onValueChange={(pricesIncludeVat) => set({ pricesIncludeVat })} trackColor={{ true: colors.amber, false: colors.line }} thumbColor={colors.white} />
            </View>
          )}
        </View>

        <Card style={{ gap: space(3) }}>
          <View style={st.totRow}>
            <Text style={st.totLabel}>Net (ex VAT)</Text>
            <Num value={x.subtotal} onChange={(subtotal) => set({ subtotal })} prefix="£" width={120} />
          </View>
          <View style={st.totRow}>
            <Text style={st.totLabel}>VAT</Text>
            <Num value={x.vat} onChange={(vat) => set({ vat })} prefix="£" width={120} />
          </View>
          <View style={st.totRow}>
            <Text style={[st.totLabel, { fontWeight: '800' }]}>Total paid</Text>
            <Num value={x.total} onChange={(total) => set({ total })} prefix="£" width={120} />
          </View>
          {x.items.length > 0 && Math.abs(linesTotal - (x.pricesIncludeVat ? x.total : x.subtotal)) > 0.05 && (
            <Text style={{ color: colors.amberDeep, fontSize: 13 }}>Items add up to {formatGBP(linesTotal)}. Check against the receipt.</Text>
          )}
        </Card>

        <View>
          <Label style={{ marginBottom: space(2) }}>Bought for</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label="General stock" active={!x.quoteId} onPress={() => set({ quoteId: undefined })} />
            {jobs.map((q) => (
              <Chip key={q.id} label={q.client.name ? `${q.title} · ${q.client.name.split(' ')[0]}` : q.title} active={x.quoteId === q.id} onPress={() => set({ quoteId: q.id })} />
            ))}
          </View>
        </View>

        <Field label="Notes" value={x.notes} onChangeText={(notes) => set({ notes })} placeholder="Anything to remember" />

        <View style={{ gap: 10 }}>
          <Button icon="file-pdf-box" title="Save as PDF" onPress={pdf} loading={sharing} variant="dark" />
          {x.items.length > 0 && <Button icon="book-open-variant" variant="ghost" title="Add these prices to my materials" onPress={savePrices} />}
          <Button icon="trash-can-outline" variant="danger" title="Delete" onPress={remove} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  photoWrap: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.ink },
  photoSmall: { width: '100%', height: 180 },
  photoFull: { width: '100%', height: 520 },
  reading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,23,38,0.72)', alignItems: 'center', justifyContent: 'center', gap: 10 },
  notice: { flexDirection: 'row', gap: 10, backgroundColor: colors.amberSoft, borderRadius: radius.md, padding: space(3), borderWidth: 1, borderColor: '#FBD38D' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space(2) },
  line: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  totRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
});
