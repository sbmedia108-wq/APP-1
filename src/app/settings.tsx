import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Field, Icon, Label } from '@/components/ui';
import { pickBackup, shareBackup } from '@/lib/files';
import { aiConfigured } from '@/lib/ai';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme';

const num = (t: string) => Number(t.replace(/[^0-9.]/g, '')) || 0;

export default function Settings() {
  const { profile: p, updateProfile: set, quotes, clearExamples, snapshot, restore } = useStore();
  const [msg, setMsg] = useState<string>();
  const examples = quotes.filter((q) => q.example).length;
  const realQuotes = quotes.length - examples;

  const backup = async () => {
    try {
      await shareBackup(snapshot());
      setMsg('Backup ready. Save it somewhere safe, like Google Drive or an email to yourself.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };
  const doRestore = async () => {
    try {
      const data = await pickBackup();
      if (data === undefined) return;
      const apply = () => setMsg(restore(data) ? 'Backup restored.' : 'That file isn’t a Graft backup.');
      if (Platform.OS === 'web') apply();
      else Alert.alert('Restore this backup?', 'It replaces everything on this phone with what’s in the backup.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Restore', style: 'destructive', onPress: apply }]);
    } catch {
      setMsg('Couldn’t read that file. Pick the .json backup Graft made.');
    }
  };
  return (
    <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.muted, lineHeight: 21 }}>This goes on every quote. Your rates are used when Graft prices up a job, so get them right once and forget about it.</Text>

      <Label style={st.label}>Business</Label>
      <Card style={st.card}>
        <Field label="Business name" value={p.businessName} onChangeText={(businessName) => set({ businessName })} placeholder="Hart Fencing & Landscapes" />
        <Field label="Your name" value={p.ownerName} onChangeText={(ownerName) => set({ ownerName })} placeholder="Dan Hart" autoCapitalize="words" />
        <Field label="Trade" value={p.trade} onChangeText={(trade) => set({ trade })} />
        <Field label="Mobile" value={p.phone} onChangeText={(phone) => set({ phone })} keyboardType="phone-pad" />
        <Field label="Email" value={p.email} onChangeText={(email) => set({ email })} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Base postcode" value={p.postcode} onChangeText={(postcode) => set({ postcode: postcode.toUpperCase() })} autoCapitalize="characters" />
      </Card>

      <Label style={st.label}>Your rates</Label>
      <Card style={st.card}>
        <View style={st.row}>
          <Field style={{ flex: 1 }} label="Day rate £" value={String(p.dayRate)} onChangeText={(t) => set({ dayRate: num(t) })} keyboardType="decimal-pad" />
          <Field style={{ flex: 1 }} label="Hourly £" value={String(p.hourlyRate)} onChangeText={(t) => set({ hourlyRate: num(t) })} keyboardType="decimal-pad" />
        </View>
        <View style={st.row}>
          <Field style={{ flex: 1 }} label="Materials markup %" value={String(p.markupPct)} onChangeText={(t) => set({ markupPct: num(t) })} keyboardType="decimal-pad" />
          <Field style={{ flex: 1 }} label="Default deposit %" value={String(p.defaultDepositPct)} onChangeText={(t) => set({ defaultDepositPct: Math.min(100, num(t)) })} keyboardType="decimal-pad" />
        </View>
        <Field label="Chase-up after (days)" value={String(p.followUpDays)} onChangeText={(t) => set({ followUpDays: num(t) })} keyboardType="number-pad" />
      </Card>

      <Label style={st.label}>VAT & payment</Label>
      <Card style={st.card}>
        <View style={[st.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>VAT registered</Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>Adds 20% VAT to quotes and invoices</Text>
          </View>
          <Switch value={p.vatRegistered} onValueChange={(vatRegistered) => set({ vatRegistered })} trackColor={{ true: colors.amber, false: colors.line }} thumbColor={colors.white} />
        </View>
        {p.vatRegistered && <Field label="VAT number" value={p.vatNumber} onChangeText={(vatNumber) => set({ vatNumber })} placeholder="GB123456789" autoCapitalize="characters" />}
        <Field label="Payment terms" value={p.paymentTerms} onChangeText={(paymentTerms) => set({ paymentTerms })} multiline />
        <Field label="Bank details (shown on invoices)" value={p.bankDetails} onChangeText={(bankDetails) => set({ bankDetails })} placeholder="Sort 00-00-00 · Acc 12345678" />
        <View style={st.row}>
          <Field style={{ flex: 1 }} label="Quote prefix" value={p.quotePrefix} onChangeText={(quotePrefix) => set({ quotePrefix })} autoCapitalize="characters" />
          <Field style={{ flex: 1 }} label="Next number" value={String(p.nextQuoteNumber)} onChangeText={(t) => set({ nextQuoteNumber: Math.max(1, Math.floor(num(t))) })} keyboardType="number-pad" />
        </View>
      </Card>

      <Label style={st.label}>My prices</Label>
      <Card onPress={() => router.push('/prices')} style={st.linkRow}>
        <Icon name="book-open-variant" color={colors.amberDeep} />
        <View style={{ flex: 1 }}>
          <Text style={st.rowTitle}>What you pay your merchant</Text>
          <Text style={st.rowSub}>{Object.keys(p.priceBook).length ? `${Object.keys(p.priceBook).length} saved · used instead of guide prices` : 'Use your real trade prices on every quote'}</Text>
        </View>
        <Icon name="chevron-right" color={colors.faint} />
      </Card>

      <Label style={st.label}>Backup</Label>
      <Card style={st.card}>
        <Text style={{ color: colors.muted, lineHeight: 20 }}>Your quotes live on this phone. Back them up now and then so a lost or broken phone doesn’t lose your work. {realQuotes} quote{realQuotes === 1 ? '' : 's'} so far.</Text>
        <View style={st.row}>
          <Button small variant="dark" icon="cloud-upload-outline" title="Back up now" onPress={backup} style={{ flex: 1 }} />
          <Button small variant="ghost" icon="backup-restore" title="Restore" onPress={doRestore} style={{ flex: 1 }} />
        </View>
        {msg ? <Text style={{ color: colors.text, fontWeight: '600' }}>{msg}</Text> : null}
      </Card>

      {examples > 0 && (
        <Pressable onPress={clearExamples} style={{ marginTop: space(5), alignSelf: 'center' }} hitSlop={10}>
          <Text style={{ color: colors.red, fontWeight: '700' }}>Remove the {examples} example jobs</Text>
        </Pressable>
      )}

      <Text style={{ color: colors.faint, fontSize: 12, marginTop: space(5), textAlign: 'center' }}>
        Quote engine: {aiConfigured ? 'Graft AI (online) with on-device fallback' : 'On-device'} · Your data stays on this phone
      </Text>
      <Button title="Done" onPress={() => router.back()} style={{ marginTop: space(5) }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  label: { marginTop: space(6), marginBottom: space(2) },
  card: { gap: space(3.5) },
  row: { flexDirection: 'row', gap: space(3) },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowSub: { color: colors.muted, marginTop: 2 },
});
