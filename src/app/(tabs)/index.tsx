import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Icon, SectionHeader, StatusPill } from '@/components/ui';
import { pipelineStats } from '@/lib/memory';
import { monthKey, summarise } from '@/lib/receipts';
import { formatBooking, fromKey, toKey, upcoming } from '@/lib/schedule';
import { calcTotals, formatGBP0 } from '@/lib/money';
import { useStore } from '@/lib/store';
import { chaseMessage, whatsAppUrl } from '@/lib/whatsapp';
import { colors, radius, space, type } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { quotes, profile, tools, updateQuote, ready, onboarded, purchases } = useStore();
  const month = new Date().toISOString().slice(0, 7);
  const spent = summarise(purchases.filter((p) => monthKey(p) === month));
  useEffect(() => {
    if (ready && !onboarded) router.push('/welcome');
  }, [ready, onboarded]);
  const stats = pipelineStats(quotes, profile.vatRegistered);
  const recent = quotes.slice(0, 4);
  const coming = upcoming(quotes).slice(0, 4);
  const todayKey = toKey(new Date());
  const lent = tools.filter((t) => t.lentTo);
  const name = profile.ownerName.split(' ')[0];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.ink, colors.ink2]} style={[st.hero, { paddingTop: insets.top + space(4) }]}>
        <View style={st.topRow}>
          <View style={st.brand}>
            <Image source={require('../../../assets/logo-mark.png')} style={st.logo} accessibilityIgnoresInvertColors />
            <Text style={st.brandText}>Graft</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} hitSlop={12} style={st.iconBtn} accessibilityLabel="Business settings">
            <Icon name="cog-outline" color={colors.white} size={22} />
          </Pressable>
        </View>
        <Text style={st.hello}>
          {greeting()}
          {name ? `, ${name}` : ''}.
        </Text>
        <Text style={st.heroTitle}>Got a job to price?</Text>
        <Text style={st.heroSub}>Walk it, talk it, send it. Your quote's on their phone before you're back in the van.</Text>
        <Button title="Talk a quote" icon="microphone" onPress={() => router.push('/new')} style={{ marginTop: space(5) }} />
        <View style={st.stats}>
          <Stat label="Out for quote" value={formatGBP0(stats.outstanding)} />
          <View style={st.divider} />
          <Stat label="Won this month" value={formatGBP0(stats.wonThisMonth)} />
          <View style={st.divider} />
          <Stat label="Win rate" value={`${Math.round(stats.winRate * 100)}%`} />
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: space(4) }}>
        {stats.chase.length > 0 && (
          <>
            <SectionHeader title="Chase these up" />
            {stats.chase.map((q) => (
              <Card key={q.id} style={{ marginBottom: space(3), flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[st.round, { backgroundColor: colors.amberSoft }]}>
                  <Icon name="bell-ring-outline" color={colors.amberDeep} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={type.h3}>{q.client.name || q.title}</Text>
                  <Text style={{ color: colors.muted, marginTop: 2 }}>
                    {q.title} · sent {Math.round((Date.now() - new Date(q.sentAt ?? q.createdAt).getTime()) / 86400000)}d ago
                  </Text>
                </View>
                <Button
                  small
                  variant="whatsapp"
                  icon="whatsapp"
                  title="Nudge"
                  onPress={() => {
                    Linking.openURL(whatsAppUrl(q.client.phone, chaseMessage(q, profile)));
                    updateQuote(q.id, { followUpAt: new Date(Date.now() + profile.followUpDays * 86400000).toISOString() });
                  }}
                />
              </Card>
            ))}
          </>
        )}

        {coming.length > 0 && (
          <>
            <SectionHeader title="Coming up" />
            <Card style={{ padding: 0 }}>
              {coming.map(({ quote: q, dates }, i) => {
                const on = dates.includes(todayKey);
                const d = fromKey(dates[0]!);
                return (
                  <Pressable key={q.id} onPress={() => router.push(`/quote/${q.id}`)} style={[st.comingRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
                    <View style={[st.dateTile, on && { backgroundColor: colors.amber }]}>
                      <Text style={[st.dateMon, on && { color: colors.ink }]}>{on ? 'NOW' : d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</Text>
                      <Text style={[st.dateNum, on && { color: colors.ink }]}>{d.getDate()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={type.h3} numberOfLines={1}>
                        {q.title}
                      </Text>
                      <Text style={{ color: colors.muted, marginTop: 2 }} numberOfLines={1}>
                        {formatBooking(q.booking!)}
                        {q.client.address ? ` · ${q.client.address}` : ''}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </Card>
          </>
        )}

        <SectionHeader title="Recent quotes" action="See all" onAction={() => router.push('/quotes')} />
        {recent.map((q) => (
          <Card key={q.id} onPress={() => router.push(`/quote/${q.id}`)} style={{ marginBottom: space(3) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={type.h3} numberOfLines={1}>
                  {q.title}
                </Text>
                <Text style={{ color: colors.muted, marginTop: 3 }} numberOfLines={1}>
                  {q.client.name || 'No client yet'} · {q.number}{q.example ? ' · Example' : ''}
                </Text>
              </View>
              <Text style={[type.h3, type.money]}>{formatGBP0(calcTotals(q.items, profile.vatRegistered).total)}</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <StatusPill status={q.status} />
            </View>
          </Card>
        ))}

        <SectionHeader title="Receipts" />
        <Card onPress={() => router.push('/receipts')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={[st.round, { backgroundColor: colors.amberSoft }]}>
            <Icon name="receipt-text-outline" color={colors.amberDeep} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h3}>Snap a receipt</Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>
              {spent.count ? `${spent.count} this month · ${formatGBP0(spent.total)} spent` : 'Clean records for your tax return'}
            </Text>
          </View>
          <Icon name="camera-outline" color={colors.faint} />
        </Card>

        <SectionHeader title="Before you set off" />
        <Card onPress={() => router.push('/tools')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={[st.round, { backgroundColor: colors.ink }]}>
            <Icon name="truck-check-outline" color={colors.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h3}>Run the van check</Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>
              {lent.length ? `${lent.length} tool${lent.length > 1 ? 's' : ''} out on loan · ` : ''}Tick off your kit in 30 seconds
            </Text>
          </View>
          <Icon name="chevron-right" color={colors.faint} />
        </Card>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[st.statValue, type.money]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  hero: { paddingHorizontal: space(5), paddingBottom: space(6), borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space(7) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 44, height: 44, marginLeft: -4 },
  brandText: { color: colors.white, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  hello: { color: colors.amber, fontWeight: '700', fontSize: 15 },
  heroTitle: { ...type.hero, color: colors.white, marginTop: 6 },
  heroSub: { color: 'rgba(255,255,255,0.68)', fontSize: 15, lineHeight: 22, marginTop: 8 },
  stats: { flexDirection: 'row', marginTop: space(6), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.md, padding: space(4) },
  statValue: { color: colors.white, fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2, fontWeight: '600' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: space(3) },
  comingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: space(4) },
  dateTile: { width: 48, height: 52, borderRadius: 12, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  dateMon: { color: colors.amber, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  dateNum: { color: colors.white, fontSize: 20, fontWeight: '800', marginTop: -2 },
  round: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
