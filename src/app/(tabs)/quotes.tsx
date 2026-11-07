import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, Empty, Icon, StatusPill, s as ui } from '@/components/ui';
import { calcTotals, formatGBP0 } from '@/lib/money';
import { useStore } from '@/lib/store';
import type { QuoteStatus } from '@/lib/types';
import { colors, space, STATUS_META, type } from '@/theme';

const FILTERS: (QuoteStatus | 'all')[] = ['all', 'draft', 'sent', 'accepted', 'invoiced', 'paid', 'declined'];

export default function Quotes() {
  const insets = useSafeAreaInsets();
  const { quotes, profile } = useStore();
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return quotes.filter(
      (x) =>
        (filter === 'all' || x.status === filter) &&
        (!needle || `${x.title} ${x.client.name} ${x.client.address} ${x.number}`.toLowerCase().includes(needle)),
    );
  }, [quotes, filter, q]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top + space(3) }}>
      <View style={{ paddingHorizontal: space(4) }}>
        <Text style={type.h1}>Quotes</Text>
        <View style={{ marginTop: space(4), justifyContent: 'center' }}>
          <TextInput value={q} onChangeText={setQ} placeholder="Search client, job or street" placeholderTextColor={colors.faint} style={[ui.input, { paddingLeft: 42 }]} />
          <View style={{ position: 'absolute', left: 14 }}>
            <Icon name="magnify" color={colors.faint} />
          </View>
        </View>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: space(4), paddingVertical: space(4) }}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f === 'all' ? 'All' : STATUS_META[f].label} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={list}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: 40, gap: space(3) }}
        ListEmptyComponent={<Empty icon="file-document-outline" title="Nothing here yet" body="Tap the mic and talk through your next job — the quote builds itself." />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/quote/${item.id}`)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={type.h3} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.muted, marginTop: 3 }} numberOfLines={1}>
                  {item.client.name || 'No client yet'}{item.example ? ' · Example' : ''}
                  {item.client.address ? ` · ${item.client.address}` : ''}
                </Text>
              </View>
              <Text style={[type.h3, type.money]}>{formatGBP0(calcTotals(item.items, profile.vatRegistered).total)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <StatusPill status={item.status} />
              <Text style={{ color: colors.faint, fontSize: 12, fontWeight: '600' }}>
                {item.number} · {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
