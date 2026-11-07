import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Icon, Label, SectionHeader, s as ui, tap } from '@/components/ui';
import { uid } from '@/lib/id';
import { useStore } from '@/lib/store';
import { colors, radius, space, type } from '@/theme';

export default function Tools() {
  const insets = useSafeAreaInsets();
  const { tools, kits, upsertTool, deleteTool } = useStore();
  const [kitId, setKitId] = useState('everyday');
  const [loaded, setLoaded] = useState<Record<string, Set<string>>>({});
  const [newTool, setNewTool] = useState('');
  const [lending, setLending] = useState<string>();
  const [lendName, setLendName] = useState('');
  const [editing, setEditing] = useState(false);

  // Every job kit is always included in the check.
  const list = useMemo(() => tools.filter((t) => t.kits.includes(kitId) || (kitId !== 'everyday' && t.kits.includes('everyday'))), [tools, kitId]);
  const ticked = loaded[kitId] ?? new Set<string>();
  const inVan = list.filter((t) => !t.lentTo);
  const done = inVan.filter((t) => ticked.has(t.id)).length;
  const pct = inVan.length ? done / inVan.length : 0;
  const allDone = inVan.length > 0 && done === inVan.length;
  const lent = tools.filter((t) => t.lentTo);

  const toggle = (id: string) => {
    tap();
    setLoaded((l) => {
      const next = new Set(l[kitId] ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...l, [kitId]: next };
    });
  };

  const add = () => {
    const name = newTool.trim();
    if (!name) return;
    upsertTool({ id: uid(), name, kits: [kitId] });
    setNewTool('');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), paddingTop: insets.top + space(3), paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={type.h1}>Van check</Text>
        <Pressable onPress={() => setEditing((e) => !e)} hitSlop={10}>
          <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>{editing ? 'Done' : 'Edit kit'}</Text>
        </Pressable>
      </View>
      <Text style={{ color: colors.muted, marginTop: 4 }}>Nothing left on site. Nothing left at home.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: space(4) }}>
        {kits.map((k) => (
          <Chip key={k.id} label={k.name} icon={k.icon as never} active={k.id === kitId} onPress={() => setKitId(k.id)} />
        ))}
      </ScrollView>

      <Card style={[st.progress, allDone && { backgroundColor: colors.green, borderColor: colors.green }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.white, fontSize: 22, fontWeight: '800' }}>{allDone ? 'All loaded. Off you go.' : `${done} of ${inVan.length} loaded`}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            {allDone ? 'Have a good one.' : `${inVan.length - done} still to tick off`}
            {lent.length ? ` · ${lent.length} on loan` : ''}
          </Text>
          <View style={st.bar}>
            <View style={[st.barFill, { width: `${pct * 100}%` }, allDone && { backgroundColor: colors.white }]} />
          </View>
        </View>
        <View style={st.badge}>
          <Icon name={allDone ? 'check-bold' : 'truck-outline'} size={28} color={allDone ? colors.green : colors.amber} />
        </View>
      </Card>

      <Card style={{ padding: 0, marginTop: space(4) }}>
        {list.map((t, i) => {
          const on = ticked.has(t.id);
          return (
            <View key={t.id} style={[i > 0 && st.rowLine]}>
              <Pressable onPress={() => !t.lentTo && !editing && toggle(t.id)} style={st.row}>
                {editing ? (
                  <Pressable onPress={() => deleteTool(t.id)} hitSlop={8} accessibilityLabel={`Remove ${t.name}`}>
                    <Icon name="minus-circle" color={colors.red} size={24} />
                  </Pressable>
                ) : (
                  <View style={[st.check, on && st.checkOn, t.lentTo && { borderColor: colors.line, backgroundColor: colors.bg }]}>{on ? <Icon name="check-bold" size={16} color={colors.ink} /> : null}</View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[st.toolName, on && { color: colors.muted, textDecorationLine: 'line-through' }, t.lentTo && { color: colors.faint }]}>{t.name}</Text>
                  {t.lentTo ? <Text style={{ color: colors.amberDeep, fontSize: 12, fontWeight: '700', marginTop: 2 }}>With {t.lentTo} since {new Date(t.lentAt ?? Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text> : null}
                </View>
                {t.lentTo ? (
                  <Button small variant="ghost" title="Got it back" onPress={() => upsertTool({ ...t, lentTo: undefined, lentAt: undefined })} />
                ) : (
                  <Pressable onPress={() => setLending(lending === t.id ? undefined : t.id)} hitSlop={10} accessibilityLabel={`Lend ${t.name}`}>
                    <Icon name="account-arrow-right-outline" color={colors.faint} />
                  </Pressable>
                )}
              </Pressable>
              {lending === t.id && (
                <View style={st.lendRow}>
                  <TextInput value={lendName} onChangeText={setLendName} placeholder="Who’s borrowing it?" placeholderTextColor={colors.faint} style={[ui.input, { flex: 1 }]} autoFocus />
                  <Button
                    small
                    variant="dark"
                    title="Lend"
                    disabled={!lendName.trim()}
                    onPress={() => {
                      upsertTool({ ...t, lentTo: lendName.trim(), lentAt: new Date().toISOString() });
                      setLending(undefined);
                      setLendName('');
                    }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: space(4) }}>
        <TextInput value={newTool} onChangeText={setNewTool} onSubmitEditing={add} placeholder={`Add to ${kits.find((k) => k.id === kitId)?.name ?? 'kit'}…`} placeholderTextColor={colors.faint} style={[ui.input, { flex: 1, minWidth: 0 }]} returnKeyType="done" />
        <Button small title="Add" icon="plus" onPress={add} style={{ height: 50 }} />
      </View>
      {done > 0 && <Button variant="ghost" small title="Reset check" icon="refresh" onPress={() => setLoaded((l) => ({ ...l, [kitId]: new Set() }))} style={{ marginTop: space(3), alignSelf: 'flex-start' }} />}

      {lent.length > 0 && (
        <>
          <SectionHeader title="Out on loan" />
          <Card style={{ gap: 10 }}>
            {lent.map((t) => {
              const days = Math.floor((Date.now() - new Date(t.lentAt ?? Date.now()).getTime()) / 86400000);
              return (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon name="account-clock-outline" color={days > 7 ? colors.red : colors.muted} />
                  <Text style={{ flex: 1, color: colors.text }}>
                    <Text style={{ fontWeight: '700' }}>{t.lentTo}</Text> has your {t.name.toLowerCase()}
                  </Text>
                  <Label style={{ color: days > 7 ? colors.red : colors.faint }}>{days}d</Label>
                </View>
              );
            })}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  progress: { backgroundColor: colors.ink, borderColor: colors.ink, flexDirection: 'row', alignItems: 'center', gap: space(4), padding: space(5) },
  bar: { height: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, marginTop: space(4), overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.amber, borderRadius: 3 },
  badge: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: space(4), paddingVertical: space(3.5) },
  rowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.amber, borderColor: colors.amber },
  toolName: { fontSize: 15, fontWeight: '600', color: colors.text },
  lendRow: { flexDirection: 'row', gap: 8, paddingHorizontal: space(4), paddingBottom: space(3), alignItems: 'center', borderRadius: radius.md },
});
