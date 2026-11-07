import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Icon, Label, s as ui } from '@/components/ui';
import { pickTextFile } from '@/lib/files';
import { parseMaterialList } from '@/lib/materialImport';
import { formatGBP } from '@/lib/money';
import { useStore } from '@/lib/store';
import { colors, radius, space, type } from '@/theme';

const EXAMPLE = `Postcrete 20kg, bag, 6.40
Jakcured post 100x100 2.4m, each, 18.95
Sharp sand - bulk bag - £55
Gravel board £12.50`;

export default function ImportMaterials() {
  const { importMaterials, customMaterials } = useStore();
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<string>();

  const result = useMemo(() => (text.trim() ? parseMaterialList(text) : undefined), [text]);

  const chooseFile = async () => {
    setError(undefined);
    setDone(undefined);
    try {
      const f = await pickTextFile();
      if (!f) return;
      setFileName(f.name);
      setText(f.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const add = () => {
    if (!result?.items.length) return;
    const r = importMaterials(result.items);
    setDone(
      [r.added ? `${r.added} new material${r.added === 1 ? '' : 's'} added` : '', r.updated ? `${r.updated} price${r.updated === 1 ? '' : 's'} updated` : ''].filter(Boolean).join(', ') + '.',
    );
    setText('');
    setFileName(undefined);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: 80, gap: space(4) }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.muted, lineHeight: 21 }}>
        Bring in your own materials and prices: a merchant price list, your spreadsheet, or a list from your notes. Graft will recognise them when you talk through a job.
      </Text>

      {done ? (
        <Card style={{ backgroundColor: colors.greenSoft, borderColor: '#BBE5CB', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="check-circle" color={colors.green} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.text }}>{done}</Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>You now have {customMaterials.length} of your own materials.</Text>
          </View>
        </Card>
      ) : null}

      <Card style={{ gap: space(3) }}>
        <Text style={type.h3}>From a file</Text>
        <Text style={{ color: colors.muted, lineHeight: 20 }}>
          A CSV from Excel or Google Sheets (File → Download → CSV). Columns like Name, Unit, Price and Category are picked up automatically.
        </Text>
        <Button variant="dark" icon="file-upload-outline" title={fileName ? `Loaded ${fileName}` : 'Choose a file'} onPress={chooseFile} />
        {error ? <Text style={{ color: colors.red }}>{error}</Text> : null}
      </Card>

      <Card style={{ gap: space(3) }}>
        <Text style={type.h3}>Or paste a list</Text>
        <Text style={{ color: colors.muted, lineHeight: 20 }}>One item per line: name, unit, price. The unit is optional.</Text>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            setDone(undefined);
          }}
          placeholder={EXAMPLE}
          placeholderTextColor={colors.faint}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          style={[ui.input, { minHeight: 150, textAlignVertical: 'top', fontSize: 15, lineHeight: 22 }]}
        />
      </Card>

      {result && (
        <View style={{ gap: space(2) }}>
          <Label>
            Preview · {result.items.length} found{result.skipped.length ? ` · ${result.skipped.length} skipped` : ''}
          </Label>
          <Card style={{ padding: 0 }}>
            {result.items.slice(0, 8).map((m, i) => (
              <View key={m.id} style={[st.row, i > 0 && st.line]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>{m.name}</Text>
                  <Text style={{ color: colors.faint, fontSize: 12, marginTop: 2 }}>
                    {m.category} · per {m.unit}
                  </Text>
                </View>
                <Text style={[{ fontWeight: '700', color: colors.text }, type.money]}>{formatGBP(m.price)}</Text>
              </View>
            ))}
            {result.items.length > 8 && <Text style={[st.row, st.line, { color: colors.muted }]}>…and {result.items.length - 8} more</Text>}
            {result.items.length === 0 && <Text style={[st.row, { color: colors.muted }]}>Nothing with a price found yet.</Text>}
          </Card>
          {result.skipped.length > 0 && (
            <View style={st.skipped}>
              <Text style={{ fontWeight: '700', color: colors.ink, marginBottom: 4 }}>Skipped (no price found)</Text>
              {result.skipped.slice(0, 5).map((s) => (
                <Text key={s.line} style={{ color: colors.ink2 }} numberOfLines={1}>
                  Line {s.line}: {s.text}
                </Text>
              ))}
            </View>
          )}
          <Button title={`Add ${result.items.length} material${result.items.length === 1 ? '' : 's'}`} icon="plus" onPress={add} disabled={!result.items.length} />
        </View>
      )}

      <Button variant="ghost" title="Done" onPress={() => router.back()} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space(4), paddingVertical: space(3) },
  line: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  skipped: { backgroundColor: colors.amberSoft, borderRadius: radius.md, padding: space(3), borderWidth: 1, borderColor: '#FBD38D' },
});
