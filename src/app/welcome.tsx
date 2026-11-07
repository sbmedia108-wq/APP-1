import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, radius, space, type } from '@/theme';

const TRADES = ['Fencing', 'Landscaping', 'Plastering', 'Decorating', 'Joinery', 'Tiling', 'Building', 'Roofing', 'Plumbing', 'Electrical', 'Handyman'];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, setOnboarded, clearExamples } = useStore();
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [trades, setTrades] = useState<string[]>([]);
  const [dayRate, setDayRate] = useState(String(profile.dayRate));
  const [phone, setPhone] = useState(profile.phone);
  const [keepExamples, setKeepExamples] = useState(true);

  const toggleTrade = (t: string) => setTrades((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));

  const finish = () => {
    const rate = Number(dayRate.replace(/[^0-9.]/g, '')) || profile.dayRate;
    updateProfile({
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      trade: trades.length ? trades.join(' & ') : profile.trade,
      dayRate: rate,
      hourlyRate: Math.round(rate / 8),
      phone: phone.trim(),
    });
    if (!keepExamples) clearExamples();
    setOnboarded();
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.ink }}>
      <ScrollView contentContainerStyle={{ padding: space(5), paddingTop: insets.top + space(6), paddingBottom: insets.bottom + space(8) }} keyboardShouldPersistTaps="handled">
        <Image source={require('../../assets/logo-mark.png')} style={{ width: 72, height: 72, marginLeft: -6 }} />
        <Text style={st.title}>Let’s get you set up.</Text>
        <Text style={st.sub}>Thirty seconds, and your first quote comes out right. You can change any of this later in Settings.</Text>

        <Text style={st.label}>Your name</Text>
        <TextInput value={ownerName} onChangeText={setOwnerName} placeholder="Dan Hart" placeholderTextColor={st.ph.color} style={st.input} autoCapitalize="words" />

        <Text style={st.label}>Business name</Text>
        <TextInput value={businessName} onChangeText={setBusinessName} placeholder="Hart Fencing & Landscapes" placeholderTextColor={st.ph.color} style={st.input} />

        <Text style={st.label}>What do you do?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TRADES.map((t) => (
            <Chip key={t} label={t} active={trades.includes(t)} onPress={() => toggleTrade(t)} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: space(3) }}>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Day rate (£)</Text>
            <TextInput value={dayRate} onChangeText={setDayRate} keyboardType="decimal-pad" style={st.input} />
          </View>
          <View style={{ flex: 1.4 }}>
            <Text style={st.label}>Your mobile</Text>
            <TextInput value={phone} onChangeText={setPhone} placeholder="07700 900123" placeholderTextColor={st.ph.color} keyboardType="phone-pad" style={st.input} />
          </View>
        </View>

        <View style={st.toggle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>Show example jobs</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 2, lineHeight: 19 }}>Three sample quotes so you can see how it works. Remove them any time in Settings.</Text>
          </View>
          <Switch value={keepExamples} onValueChange={setKeepExamples} trackColor={{ true: colors.amber, false: 'rgba(255,255,255,0.2)' }} thumbColor={colors.white} />
        </View>

        <Button title="Start quoting" icon="arrow-right" onPress={finish} style={{ marginTop: space(8) }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  title: { ...type.hero, color: colors.white, marginTop: space(6) },
  sub: { color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 23, marginTop: 8 },
  label: { ...type.label, color: colors.amber, marginTop: space(6), marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: colors.white, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13 },
  ph: { color: 'rgba(255,255,255,0.35)' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space(3), marginTop: space(7), padding: space(4), borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.05)' },
});
