import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, Text, TextInput, View } from 'react-native';
import { Button, Card, Icon, Label, s as ui } from '@/components/ui';
import { customId } from '@/lib/materialImport';
import { MATERIALS, type Material } from '@/lib/materials';
import { formatGBP } from '@/lib/money';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme';

const num = (t: string) => {
  const clean = t.replace(/[^0-9.]/g, '');
  return clean === '' || Number.isNaN(Number(clean)) ? undefined : Number(clean);
};

/** The user's own materials and prices. Used instead of guide prices whenever Graft prices up a job. */
export default function Prices() {
  const { profile, updateProfile, customMaterials, upsertMaterial, deleteMaterial } = useStore();
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const sections = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (m: Material) => !needle || `${m.name} ${m.category} ${m.keywords.join(' ')}`.toLowerCase().includes(needle);
    const mine = customMaterials.filter(match).sort((a, b) => a.name.localeCompare(b.name));
    const builtIn = MATERIALS.filter(match);
    const cats = [...new Set(builtIn.map((m) => m.category))];
    return [
      ...(mine.length ? [{ title: `Your materials (${mine.length})`, data: mine }] : []),
      ...cats.map((c) => ({ title: c, data: builtIn.filter((m) => m.category === c) })),
    ];
  }, [q, customMaterials]);

  const setPrice = (m: Material, text: string) => {
    setDraft((d) => ({ ...d, [m.id]: text }));
    const n = num(text);
    if (m.custom) {
      if (n !== undefined) upsertMaterial({ ...m, price: n });
      return;
    }
    const next = { ...profile.priceBook };
    if (n === undefined) delete next[m.id];
    else next[m.id] = n;
    updateProfile({ priceBook: next });
  };

  const addOne = () => {
    const price = num(newPrice);
    if (!newName.trim() || price === undefined) return;
    const name = newName.trim().replace(/\s+/g, ' ');
    upsertMaterial({ id: customId(name), name, unit: newUnit.trim() || 'each', price, category: 'My materials', keywords: [name.toLowerCase()], custom: true });
    setNewName('');
    setNewUnit('');
    setNewPrice('');
    setAdding(false);
  };

  const saved = Object.keys(profile.priceBook).length;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(m) => m.id}
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ padding: space(4), paddingBottom: 60 }}
      ListHeaderComponent={
        <View style={{ gap: space(3), marginBottom: space(2) }}>
          <Text style={{ color: colors.muted, lineHeight: 21 }}>
            Add your own materials, or put in what you actually pay for the built-in ones (ex-VAT). Graft uses your prices, then adds your {profile.markupPct}% markup.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button small variant="dark" icon="file-upload-outline" title="Import a list" onPress={() => router.push('/import-materials')} style={{ flex: 1 }} />
            <Button small variant="ghost" icon="plus" title="Add one" onPress={() => setAdding((a) => !a)} style={{ flex: 1 }} />
          </View>
          {adding && (
            <Card style={{ gap: 10 }}>
              <TextInput value={newName} onChangeText={setNewName} placeholder="Name, e.g. Jakcured rail 3.6m" placeholderTextColor={colors.faint} style={ui.input} autoFocus />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput value={newUnit} onChangeText={setNewUnit} placeholder="Unit (each, bag, m²)" placeholderTextColor={colors.faint} style={[ui.input, { flex: 1 }]} autoCapitalize="none" />
                <TextInput value={newPrice} onChangeText={setNewPrice} placeholder="£ price" placeholderTextColor={colors.faint} keyboardType="decimal-pad" style={[ui.input, { width: 110 }]} />
              </View>
              <Button small title="Save material" icon="check" onPress={addOne} disabled={!newName.trim() || num(newPrice) === undefined} />
            </Card>
          )}
          {saved > 0 && (
            <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>
              {saved} built-in price{saved === 1 ? '' : 's'} set to yours
            </Text>
          )}
          <View style={{ justifyContent: 'center' }}>
            <TextInput value={q} onChangeText={setQ} placeholder="Search materials" placeholderTextColor={colors.faint} style={[ui.input, { paddingLeft: 42 }]} />
            <View style={{ position: 'absolute', left: 14 }}>
              <Icon name="magnify" color={colors.faint} />
            </View>
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => <Label style={{ marginTop: space(6), marginBottom: space(2), color: section.title.startsWith('Your') ? colors.amberDeep : colors.faint }}>{section.title}</Label>}
      renderItem={({ item: m, index, section }) => {
        const value = m.custom ? m.price : profile.priceBook[m.id];
        const first = index === 0;
        const last = index === section.data.length - 1;
        return (
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, paddingHorizontal: space(4), paddingVertical: space(3),
              borderColor: colors.line, borderWidth: 1, borderTopWidth: first ? 1 : 0,
              borderTopLeftRadius: first ? 14 : 0, borderTopRightRadius: first ? 14 : 0, borderBottomLeftRadius: last ? 14 : 0, borderBottomRightRadius: last ? 14 : 0,
            }}
          >
            {m.custom && (
              <Pressable onPress={() => deleteMaterial(m.id)} hitSlop={8} accessibilityLabel={`Remove ${m.name}`}>
                <Icon name="minus-circle-outline" color={colors.faint} />
              </Pressable>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{m.name}</Text>
              <Text style={{ color: colors.faint, fontSize: 12, marginTop: 2 }}>{m.custom ? `Your price per ${m.unit}` : `Guide ${formatGBP(m.price)} / ${m.unit}`}</Text>
            </View>
            <View style={[ui.input, { flexDirection: 'row', alignItems: 'center', width: 104, paddingVertical: 8, borderColor: value !== undefined ? colors.amber : colors.line }]}>
              <Text style={{ color: colors.muted, fontWeight: '600' }}>£</Text>
              <TextInput
                value={draft[m.id] ?? (value !== undefined ? String(value) : '')}
                onChangeText={(t) => setPrice(m, t)}
                placeholder={m.price.toFixed(2)}
                placeholderTextColor={colors.faint}
                keyboardType="decimal-pad"
                style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, padding: 0, marginLeft: 2 }}
                accessibilityLabel={`Your price for ${m.name}`}
              />
            </View>
          </View>
        );
      }}
    />
  );
}
