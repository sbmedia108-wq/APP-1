import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Field, Label } from '@/components/ui';
import { aiConfigured } from '@/lib/ai';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme';

const num = (t: string) => Number(t.replace(/[^0-9.]/g, '')) || 0;

export default function Settings() {
  const { profile: p, updateProfile: set } = useStore();
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
});
