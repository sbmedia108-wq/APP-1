import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, Icon, Label } from '@/components/ui';
import { addPhoto } from '@/lib/files';
import { uid } from '@/lib/id';
import { formatGBP } from '@/lib/money';
import { shareMonthPdf } from '@/lib/pdf';
import { groupByMonth, summarise } from '@/lib/receipts';
import { useStore } from '@/lib/store';
import type { Purchase } from '@/lib/types';
import { colors, radius, space, type } from '@/theme';

export default function Receipts() {
  const { purchases, addPurchase, profile, quotes } = useStore();
  const [busy, setBusy] = useState<string>();
  const months = groupByMonth(purchases);

  const scan = async (source: 'camera' | 'library') => {
    try {
      const photo = await addPhoto(source);
      if (!photo) return;
      const p: Purchase = {
        id: uid(), createdAt: new Date().toISOString(), date: new Date().toISOString().slice(0, 10), supplier: '', branch: '', supplierVatNumber: '',
        reference: '', items: [], subtotal: 0, vat: 0, total: 0, pricesIncludeVat: true, paymentMethod: '', photo, notes: '', unreadable: [],
      };
      addPurchase(p);
      router.push({ pathname: '/receipt/[id]', params: { id: p.id, scan: '1' } });
    } catch (e) {
      Alert.alert('Couldn’t open the camera', e instanceof Error ? e.message : String(e));
    }
  };

  const sendMonth = async (key: string, list: Purchase[]) => {
    setBusy(key);
    try {
      await shareMonthPdf(key, list, profile, quotes);
    } catch (e) {
      Alert.alert('Couldn’t create PDF', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: 60 }}>
      <Card style={st.hero}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={st.heroIcon}>
            <Icon name="receipt-text-outline" color={colors.ink} size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: '800' }}>Snap a receipt</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 2, lineHeight: 19 }}>Graft turns it into a clean purchase record for your books, and your tax return sorts itself.</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: space(4) }}>
          {Platform.OS !== 'web' && <Button icon="camera" title="Take photo" onPress={() => scan('camera')} style={{ flex: 1 }} />}
          <Button variant={Platform.OS === 'web' ? 'primary' : 'ghost'} icon="image-outline" title={Platform.OS === 'web' ? 'Choose a photo' : 'Gallery'} onPress={() => scan('library')} style={{ flex: Platform.OS === 'web' ? 1 : 0.75 }} />
        </View>
      </Card>

      {months.length === 0 ? (
        <Empty icon="receipt-text-outline" title="No receipts yet" body="Next time you’re at the merchant, snap the receipt before it ends up in the footwell." />
      ) : (
        months.map((m) => {
          const sum = summarise(m.items);
          return (
            <View key={m.key} style={{ marginTop: space(7) }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: space(3) }}>
                <View>
                  <Text style={type.h2}>{m.label}</Text>
                  <Text style={{ color: colors.muted, marginTop: 2 }}>
                    {sum.count} receipt{sum.count === 1 ? '' : 's'} · {formatGBP(sum.total)}
                    {sum.vat ? ` · VAT ${formatGBP(sum.vat)}` : ''}
                  </Text>
                </View>
              </View>
              <Card style={{ padding: 0 }}>
                {m.items.map((p, i) => (
                  <Card key={p.id} onPress={() => router.push({ pathname: '/receipt/[id]', params: { id: p.id } })} style={[st.row, i > 0 && st.line]}>
                    {p.photo ? <Image source={{ uri: p.photo }} style={st.thumb} /> : <View style={[st.thumb, { alignItems: 'center', justifyContent: 'center' }]}><Icon name="receipt" color={colors.faint} /></View>}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text }} numberOfLines={1}>
                        {p.supplier || 'Receipt'}
                      </Text>
                      <Text style={{ color: colors.muted, marginTop: 2 }} numberOfLines={1}>
                        {p.date ? new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                        {p.quoteId ? ` · ${quotes.find((q) => q.id === p.quoteId)?.title ?? 'Job'}` : ''}
                      </Text>
                    </View>
                    <Text style={[{ fontWeight: '800', fontSize: 16, color: colors.text }, type.money]}>{formatGBP(p.total)}</Text>
                  </Card>
                ))}
              </Card>
              <Button small variant="ghost" icon="file-pdf-box" title={`Send ${m.label} as one PDF`} loading={busy === m.key} onPress={() => sendMonth(m.key, m.items)} style={{ marginTop: space(3), alignSelf: 'flex-start' }} />
            </View>
          );
        })
      )}
      {months.length > 0 && <Label style={{ marginTop: space(6), textAlign: 'center' }}>Monthly PDFs include every original receipt — ready for your accountant</Label>}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  hero: { backgroundColor: colors.ink, borderColor: colors.ink, padding: space(5) },
  heroIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 0, borderWidth: 0, shadowOpacity: 0, elevation: 0, paddingVertical: space(3) },
  line: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  thumb: { width: 44, height: 56, borderRadius: radius.sm, backgroundColor: colors.bg },
});
