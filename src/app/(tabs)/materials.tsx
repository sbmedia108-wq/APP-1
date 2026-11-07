import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Icon, Label, SectionHeader, s as ui } from '@/components/ui';
import { CALCULATORS } from '@/lib/calculators';
import { uid } from '@/lib/id';
import { labourLine } from '@/lib/labour';
import { lookupPrices, MATERIAL_BY_ID, searchMaterials, type Material, type PriceQuote } from '@/lib/materials';
import { formatGBP } from '@/lib/money';
import { useStore } from '@/lib/store';
import { useDictation } from '@/lib/useDictation';
import { colors, radius, space, type } from '@/theme';

const SUGGESTIONS = ['4x4 8ft post', 'Postcrete', 'Closeboard panel', 'Type 1', 'Plasterboard', 'Multi-finish', 'Decking board'];

export default function Materials() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, createQuote } = useStore();
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState('1');
  const [picked, setPicked] = useState<Material>();
  const [prices, setPrices] = useState<PriceQuote[]>([]);
  const [locating, setLocating] = useState(false);
  const [calcId, setCalcId] = useState(CALCULATORS[0]!.id);
  const [calcVals, setCalcVals] = useState<Record<string, string>>({});
  const dict = useDictation();

  // Voice search: "I need twelve 4x4 8 foot posts"
  useEffect(() => {
    if (!dict.transcript) return;
    const t = dict.transcript;
    const n = t.match(/\b(\d+)\b(?!\s*(ft|foot|x|m\b|mm))/);
    if (n) setQty(n[1]!);
    setQuery(t);
    setPicked(undefined);
  }, [dict.transcript]);

  const results = useMemo(() => searchMaterials(query), [query]);
  const quantity = Math.max(1, Number(qty) || 1);

  useEffect(() => {
    if (!picked) return;
    let live = true;
    lookupPrices(picked, quantity, profile.postcode).then((r) => live && setPrices(r));
    return () => {
      live = false;
    };
  }, [picked, quantity, profile.postcode]);

  const locate = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync(pos.coords);
      if (place?.postalCode) updateProfile({ postcode: place.postalCode });
    } catch {
      // ignore — user can type a postcode
    } finally {
      setLocating(false);
    }
  };

  const calc = CALCULATORS.find((c) => c.id === calcId)!;
  const calcInput = Object.fromEntries(calc.fields.map((f) => [f.key, Number(calcVals[`${calc.id}.${f.key}`] ?? f.default) || 0]));
  const calcLines = calc.run(calcInput).filter((l) => l.qty > 0);
  const calcTotal = calcLines.reduce((s, l) => s + (profile.priceBook[l.materialId] ?? MATERIAL_BY_ID[l.materialId]?.price ?? 0) * l.qty, 0);

  const quoteFromCalc = () => {
    const q = createQuote({
      title: calc.name,
      items: [
        labourLine(profile),
        ...calcLines.map((l) => {
          const m = MATERIAL_BY_ID[l.materialId]!;
          return { id: uid(), kind: 'material' as const, description: m.name, qty: l.qty, unit: m.unit, unitPrice: Math.round((profile.priceBook[m.id] ?? m.price) * (1 + profile.markupPct / 100) * 100) / 100 };
        }),
      ],
      assumptions: ['Labour is a placeholder — set it to suit the job.'],
    });
    router.push(`/quote/${q.id}`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), paddingTop: insets.top + space(3), paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <Text style={type.h1}>Materials</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>Find it cheapest near you, or work out how much you need.</Text>

      <Card style={{ marginTop: space(5), gap: space(3) }}>
        <View style={{ justifyContent: 'center' }}>
          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setPicked(undefined);
            }}
            placeholder="What do you need? e.g. 4x4 8ft post"
            placeholderTextColor={colors.faint}
            style={[ui.input, { paddingLeft: 42, paddingRight: 52 }]}
            returnKeyType="search"
          />
          <View style={{ position: 'absolute', left: 14 }}>
            <Icon name="magnify" color={colors.faint} />
          </View>
          <Pressable
            onPress={() => (dict.state === 'listening' ? dict.stop() : (dict.setText(''), dict.start()))}
            style={[st.micSmall, dict.state === 'listening' && { backgroundColor: colors.ink }]}
            accessibilityLabel="Say what you need"
          >
            <Icon name={dict.state === 'listening' ? 'stop' : 'microphone'} size={18} color={dict.state === 'listening' ? colors.amber : colors.ink} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: space(3) }}>
          <View style={{ width: 110, gap: 6 }}>
            <Label>Quantity</Label>
            <TextInput value={qty} onChangeText={(t) => setQty(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" style={ui.input} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Label>Near postcode</Label>
            <View style={{ justifyContent: 'center' }}>
              <TextInput value={profile.postcode} onChangeText={(postcode) => updateProfile({ postcode: postcode.toUpperCase() })} placeholder="BS1 4DJ" placeholderTextColor={colors.faint} autoCapitalize="characters" style={[ui.input, { paddingRight: 44 }]} />
              <Pressable onPress={locate} style={{ position: 'absolute', right: 12 }} hitSlop={10} accessibilityLabel="Use my location">
                <Icon name={locating ? 'loading' : 'crosshairs-gps'} color={colors.amberDeep} />
              </Pressable>
            </View>
          </View>
        </View>
      </Card>

      {!query && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space(4) }}>
          {SUGGESTIONS.map((s) => (
            <Chip key={s} label={s} onPress={() => setQuery(s)} />
          ))}
        </View>
      )}

      {!!query && !picked && (
        <View style={{ marginTop: space(4), gap: 8 }}>
          {results.length === 0 ? (
            <Card>
              <Text style={{ color: colors.muted }}>Not in the catalogue yet — search the merchants directly:</Text>
              <Button small variant="ghost" title={`Search “${query}” at Screwfix`} icon="open-in-new" style={{ marginTop: 10 }} onPress={() => Linking.openURL(`https://www.screwfix.com/search?search=${encodeURIComponent(query)}`)} />
            </Card>
          ) : (
            results.map((m) => (
              <Card key={m.id} onPress={() => setPicked(m)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: space(3.5) }}>
                <View style={st.catIcon}>
                  <Icon name="package-variant" color={colors.amberDeep} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text }}>{m.name}</Text>
                  <Text style={{ color: colors.muted, marginTop: 2 }}>
                    {m.category} · from ~{formatGBP(m.price)} / {m.unit}
                  </Text>
                </View>
                <Icon name="chevron-right" color={colors.faint} />
              </Card>
            ))
          )}
        </View>
      )}

      {picked && (
        <View style={{ marginTop: space(4) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[type.h3, { flex: 1 }]}>
              {quantity} × {picked.name}
            </Text>
            <Pressable onPress={() => setPicked(undefined)} hitSlop={10}>
              <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>Change</Text>
            </Pressable>
          </View>
          {profile.priceBook[picked.id] !== undefined && (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: colors.amberSoft, borderColor: '#F5C46B' }}>
              <Icon name="book-open-variant" color={colors.amberDeep} />
              <Text style={{ flex: 1, fontWeight: '700', color: colors.text }}>Your price</Text>
              <Text style={[{ fontWeight: '800', fontSize: 17, color: colors.text }, type.money]}>{formatGBP(profile.priceBook[picked.id]! * quantity)}</Text>
            </Card>
          )}
          <Card style={{ padding: 0 }}>
            {prices.map((p, i) => (
              <Pressable key={p.merchant.id} onPress={() => Linking.openURL(p.url)} style={({ pressed }) => [st.priceRow, i > 0 && st.rowLine, pressed && { backgroundColor: colors.bg }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text }}>{p.merchant.name}</Text>
                    {i === 0 && (
                      <View style={st.best}>
                        <Text style={st.bestText}>CHEAPEST</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.muted, marginTop: 2, fontSize: 13 }}>
                    {formatGBP(p.price)} each · {p.merchant.collect}
                  </Text>
                </View>
                <Text style={[{ fontWeight: '800', fontSize: 17, color: i === 0 ? colors.green : colors.text }, type.money]}>{formatGBP(p.total)}</Text>
                <Icon name="open-in-new" size={16} color={colors.faint} />
              </Pressable>
            ))}
          </Card>
          <Text style={st.disclaimer}>
            {prices[0]?.source === 'live' ? 'Live trade prices.' : 'Guide prices ex-VAT based on typical trade-counter rates.'} Tap a merchant to check live price and stock{profile.postcode ? ` near ${profile.postcode}` : ''}.
          </Text>
          {prices[0] && profile.postcode ? (
            <Button small variant="ghost" icon="map-marker-outline" title={`Nearest ${prices[0].merchant.name} branch`} onPress={() => Linking.openURL(prices[0]!.merchant.branchUrl(profile.postcode))} style={{ marginTop: 10 }} />
          ) : null}
        </View>
      )}

      <Button small variant="ghost" icon="book-open-variant" title="My prices — what you pay your merchant" onPress={() => router.push('/prices')} style={{ marginTop: space(4), alignSelf: 'flex-start' }} />

      <SectionHeader title="How much do I need?" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: space(3) }}>
        {CALCULATORS.map((c) => (
          <Chip key={c.id} label={c.name} icon={c.icon as never} active={c.id === calcId} onPress={() => setCalcId(c.id)} />
        ))}
      </ScrollView>
      <Card style={{ gap: space(4) }}>
        <Text style={{ color: colors.muted }}>{calc.blurb}</Text>
        <View style={{ flexDirection: 'row', gap: space(3) }}>
          {calc.fields.map((f) => (
            <View key={f.key} style={{ flex: 1, gap: 6 }}>
              <Label>
                {f.label}
                {f.unit ? ` (${f.unit})` : ''}
              </Label>
              <TextInput
                value={calcVals[`${calc.id}.${f.key}`] ?? String(f.default)}
                onChangeText={(t) => setCalcVals((v) => ({ ...v, [`${calc.id}.${f.key}`]: t.replace(/[^0-9.]/g, '') }))}
                keyboardType="decimal-pad"
                style={ui.input}
              />
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: colors.bg, borderRadius: radius.md, padding: space(3), gap: 8 }}>
          {calcLines.map((l) => {
            const m = MATERIAL_BY_ID[l.materialId]!;
            return (
              <View key={l.materialId} style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={[{ width: 36, fontWeight: '800', color: colors.ink, textAlign: 'right' }, type.money]}>{l.qty}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '500' }}>{m.name}</Text>
                  {l.note ? <Text style={{ color: colors.faint, fontSize: 12 }}>{l.note}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.muted }}>Materials approx.</Text>
          <Text style={[type.h2, type.money]}>{formatGBP(calcTotal)}</Text>
        </View>
        <Button title="Start a quote with these" icon="file-document-edit-outline" variant="dark" onPress={quoteFromCalc} />
      </Card>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  micSmall: { position: 'absolute', right: 6, width: 38, height: 38, borderRadius: 19, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  catIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.amberSoft, alignItems: 'center', justifyContent: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: space(4) },
  rowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  best: { backgroundColor: colors.greenSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  bestText: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  disclaimer: { color: colors.faint, fontSize: 12, marginTop: 10, lineHeight: 17 },
});
