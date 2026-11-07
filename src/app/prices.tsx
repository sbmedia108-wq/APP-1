import { useMemo, useState } from 'react';
import { SectionList, Text, TextInput, View } from 'react-native';
import { Icon, Label, s as ui } from '@/components/ui';
import { MATERIALS } from '@/lib/materials';
import { formatGBP } from '@/lib/money';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme';

/** The user's own cost prices. Used instead of guide prices whenever Graft prices up a job. */
export default function Prices() {
  const { profile, updateProfile } = useStore();
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});

  const sections = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = MATERIALS.filter((m) => !needle || `${m.name} ${m.category} ${m.keywords.join(' ')}`.toLowerCase().includes(needle));
    const cats = [...new Set(list.map((m) => m.category))];
    return cats.map((c) => ({ title: c, data: list.filter((m) => m.category === c) }));
  }, [q]);

  const save = (id: string, text: string) => {
    setDraft((d) => ({ ...d, [id]: text }));
    const clean = text.replace(/[^0-9.]/g, '');
    const next = { ...profile.priceBook };
    if (clean === '' || Number.isNaN(Number(clean))) delete next[id];
    else next[id] = Number(clean);
    updateProfile({ priceBook: next });
  };

  const count = Object.keys(profile.priceBook).length;

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
            Put in what you actually pay your merchant (ex-VAT). Graft uses these instead of guide prices, then adds your {profile.markupPct}% markup. Leave blank to use the guide price.
          </Text>
          {count > 0 && (
            <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>
              {count} price{count === 1 ? '' : 's'} saved
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
      renderSectionHeader={({ section }) => <Label style={{ marginTop: space(6), marginBottom: space(2) }}>{section.title}</Label>}
      renderItem={({ item: m, index, section }) => {
        const mine = profile.priceBook[m.id];
        return (
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, paddingHorizontal: space(4), paddingVertical: space(3),
              borderColor: colors.line, borderWidth: 1, borderTopWidth: index === 0 ? 1 : 0,
              borderTopLeftRadius: index === 0 ? 14 : 0, borderTopRightRadius: index === 0 ? 14 : 0,
              borderBottomLeftRadius: index === section.data.length - 1 ? 14 : 0, borderBottomRightRadius: index === section.data.length - 1 ? 14 : 0,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{m.name}</Text>
              <Text style={{ color: colors.faint, fontSize: 12, marginTop: 2 }}>
                Guide {formatGBP(m.price)} / {m.unit}
              </Text>
            </View>
            <View style={[ui.input, { flexDirection: 'row', alignItems: 'center', width: 104, paddingVertical: 8, borderColor: mine !== undefined ? colors.amber : colors.line }]}>
              <Text style={{ color: colors.muted, fontWeight: '600' }}>£</Text>
              <TextInput
                value={draft[m.id] ?? (mine !== undefined ? String(mine) : '')}
                onChangeText={(t) => save(m.id, t)}
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
