import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip } from '@/components/ui';
import { PRICING_MODES } from '@/lib/labour';
import { useStore } from '@/lib/store';
import type { PricingMode } from '@/lib/types';
import { colors, radius, space, type } from '@/theme';

const TRADES = ['Fencing', 'Landscaping', 'Plastering', 'Decorating', 'Joinery', 'Tiling', 'Building', 'Roofing', 'Plumbing', 'Electrical', 'Handyman'];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, setOnboarded, clearExamples } = useStore();
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [trades, setTrades] = useState<string[]>([]);
  const [otherTrade, setOtherTrade] = useState('');
  const [mode, setMode] = useState<PricingMode>(profile.pricingMode);
  const [rate, setRate] = useState('');
  const [phone, setPhone] = useState(profile.phone);
  const [keepExamples, setKeepExamples] = useState(true);

  const toggleTrade = (t: string) => setTrades((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));

  const finish = () => {
    const r = Number(rate.replace(/[^0-9.]/g, ''));
    const all = [...trades.filter((t) => t !== 'Other'), ...(trades.includes('Other') && otherTrade.trim() ? [otherTrade.trim()] : [])];
    const rates = !r ? {} : mode === 'hour' ? { hourlyRate: r, dayRate: Math.round(r * 8) } : { dayRate: r, hourlyRate: Math.round(r / 8) };
    updateProfile({
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      trade: all.length ? all.join(' & ') : profile.trade,
      pricingMode: mode,
      ...rates,
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
          {[...TRADES, 'Other'].map((t) => (
            <Chip key={t} label={t === 'Other' ? 'Other…' : t} icon={t === 'Other' ? 'plus' : undefined} active={trades.includes(t)} onPress={() => toggleTrade(t)} onDark />
          ))}
        </View>
        {trades.includes('Other') && (
          <TextInput value={otherTrade} onChangeText={setOtherTrade} placeholder="e.g. Groundworks, Kitchen fitting, Gates" placeholderTextColor={st.ph.color} style={[st.input, { marginTop: 10 }]} autoFocus autoCapitalize="words" />
        )}

        <Text style={st.label}>How do you price your labour?</Text>
        <View style={{ gap: 8 }}>
          {PRICING_MODES.map((m) => {
            const on = mode === m.id;
            return (
              <Pressable key={m.id} onPress={() => setMode(m.id)} style={[st.option, on && st.optionOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                <View style={[st.radio, on && st.radioOn]}>{on ? <View style={st.radioDot} /> : null}</View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>{m.label}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{m.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: space(3) }}>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>{mode === 'hour' ? 'Hourly rate (£)' : mode === 'job' ? 'A day’s worth (£)' : 'Day rate (£)'}</Text>
            <TextInput value={rate} onChangeText={setRate} placeholder={mode === 'hour' ? '35' : '240'} placeholderTextColor={st.ph.color} keyboardType="decimal-pad" style={st.input} />
          </View>
          <View style={{ flex: 1.4 }}>
            <Text style={st.label}>Your mobile</Text>
            <TextInput value={phone} onChangeText={setPhone} placeholder="07700 900123" placeholderTextColor={st.ph.color} keyboardType="phone-pad" style={st.input} />
          </View>
        </View>

        {mode === 'job' && <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8, fontSize: 13, lineHeight: 18 }}>Only used so Graft can estimate a labour price. Your clients see one price for the job, never a rate.</Text>}

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
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: space(3.5), borderRadius: radius.md, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' },
  optionOn: { borderColor: colors.amber, backgroundColor: 'rgba(255,176,32,0.08)' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.amber },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.amber },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space(3), marginTop: space(7), padding: space(4), borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.05)' },
});
