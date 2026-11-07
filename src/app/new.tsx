import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, tap } from '@/components/ui';
import { draftQuote } from '@/lib/ai';
import { uid } from '@/lib/id';
import { findSimilarJobs } from '@/lib/memory';
import { formatGBP0 } from '@/lib/money';
import { useStore } from '@/lib/store';
import { useDictation } from '@/lib/useDictation';
import { colors, radius, space, type } from '@/theme';

const PROMPTS = ['What’s the job and where?', 'Sizes — metres, m², how many', 'Materials you’ll need', 'How long, and do you need a labourer?', 'Client’s name and number'];

export default function NewQuote() {
  const insets = useSafeAreaInsets();
  const { profile, quotes, createQuote, duplicateQuote } = useStore();
  const dict = useDictation();
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const listening = dict.state === 'listening';
  const live = `${dict.transcript}${dict.interim ? ` ${dict.interim}` : ''}`.trim();

  // Job memory — re-ranks as the user speaks.
  const similar = useMemo(() => findSimilarJobs(live, quotes, profile.vatRegistered, 2), [live, quotes, profile.vatRegistered]);

  // Pulse animation for the mic
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!listening) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  // Fall back to typing if the device has no recogniser
  useEffect(() => {
    if (dict.state === 'unavailable' || dict.state === 'denied') setTyping(true);
  }, [dict.state]);

  const toggle = () => {
    tap();
    if (listening) dict.stop();
    else dict.start();
  };

  const build = async () => {
    if (listening) dict.stop();
    const text = live;
    if (!text) return;
    setBusy(true);
    try {
      const d = await draftQuote(text, profile, quotes);
      const q = createQuote({
        title: d.title,
        trade: d.trade,
        client: d.client,
        items: d.items.map((i) => ({ ...i, id: i.id ?? uid() })),
        notes: d.notes,
        assumptions: d.assumptions,
        estimatedDays: d.estimatedDays,
        transcript: text,
      });
      router.replace(`/quote/${q.id}`);
    } finally {
      setBusy(false);
    }
  };

  const startFrom = (id: string) => {
    const q = duplicateQuote(id);
    if (q) router.replace(`/quote/${q.id}`);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.ink }}>
      <View style={[st.header, { paddingTop: insets.top + space(2) }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={st.close} accessibilityLabel="Close">
          <Icon name="close" color={colors.white} />
        </Pressable>
        <Text style={st.headerTitle}>New quote</Text>
        <Pressable onPress={() => setTyping((t) => !t)} hitSlop={12} style={st.close} accessibilityLabel={typing ? 'Use voice' : 'Type instead'}>
          <Icon name={typing ? 'microphone-outline' : 'keyboard-outline'} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space(5), paddingBottom: space(8) }} keyboardShouldPersistTaps="handled">
        {typing ? (
          <TextInput
            value={dict.transcript}
            onChangeText={dict.setText}
            placeholder="e.g. 20 metres of closeboard fencing, concrete posts and gravel boards, old fence to the tip, two days with a labourer. Sue Jones, 07700 900123."
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
            autoFocus
            style={st.typeBox}
          />
        ) : live ? (
          <Text style={st.transcript}>
            {dict.transcript}
            <Text style={{ color: 'rgba(255,255,255,0.45)' }}> {dict.interim}</Text>
          </Text>
        ) : (
          <View>
            <Text style={st.lead}>Talk me through the job.</Text>
            <Text style={st.leadSub}>Say it like you’d say it to your mate. I’ll do the sums.</Text>
            <View style={{ marginTop: space(6), gap: 10 }}>
              {PROMPTS.map((p, i) => (
                <View key={p} style={st.prompt}>
                  <Text style={st.promptNum}>{i + 1}</Text>
                  <Text style={st.promptText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dict.error && dict.state !== 'listening' ? <Text style={st.err}>{dict.error}</Text> : null}
        {dict.state === 'unavailable' ? <Text style={st.err}>Voice isn’t available on this device — type it instead.</Text> : null}
        {dict.state === 'denied' ? <Text style={st.err}>Microphone access is off. Allow it in Settings, or type it instead.</Text> : null}

        {similar.length > 0 && (
          <View style={{ marginTop: space(7) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="brain" color={colors.amber} size={18} />
              <Text style={{ color: colors.amber, fontWeight: '800', letterSpacing: 0.6, fontSize: 12 }}>YOU’VE DONE THIS BEFORE</Text>
            </View>
            {similar.map((s) => (
              <Pressable key={s.quote.id} onPress={() => startFrom(s.quote.id)} style={({ pressed }) => [st.memory, pressed && { opacity: 0.8 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                    {s.quote.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: 2 }} numberOfLines={1}>
                    {s.quote.client.name} · {new Date(s.quote.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[{ color: colors.white, fontWeight: '800', fontSize: 16 }, type.money]}>{formatGBP0(s.total)}</Text>
                  <Text style={{ color: colors.amber, fontWeight: '700', fontSize: 12, marginTop: 2 }}>Start from this →</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[st.footer, { paddingBottom: insets.bottom + space(4) }]}>
        {!typing && (
          <View style={{ alignItems: 'center', marginBottom: space(5) }}>
            <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View
                pointerEvents="none"
                style={[
                  st.ring,
                  { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }] },
                ]}
              />
              <Pressable onPress={toggle} style={[st.mic, listening && { backgroundColor: colors.white }]} accessibilityLabel={listening ? 'Stop recording' : 'Start recording'}>
                <Icon name={listening ? 'stop' : 'microphone'} size={40} color={colors.ink} />
              </Pressable>
            </View>
            <Text style={st.micHint}>{listening ? 'Listening… tap to pause' : live ? 'Tap to add more' : 'Tap and start talking'}</Text>
          </View>
        )}
        <Button title={busy ? 'Pricing it up…' : 'Build my quote'} icon="lightning-bolt" onPress={build} loading={busy} disabled={!live} />
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space(4), paddingBottom: space(2) },
  headerTitle: { color: colors.white, fontWeight: '700', fontSize: 16 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  lead: { ...type.hero, color: colors.white },
  leadSub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 8, lineHeight: 23 },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promptNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,176,32,0.15)', color: colors.amber, textAlign: 'center', lineHeight: 26, fontWeight: '800', fontSize: 13, overflow: 'hidden' },
  promptText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  transcript: { color: colors.white, fontSize: 24, lineHeight: 34, fontWeight: '600', letterSpacing: -0.3 },
  typeBox: { color: colors.white, fontSize: 19, lineHeight: 28, minHeight: 220, textAlignVertical: 'top', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.lg, padding: space(4) },
  err: { color: '#FCA5A5', marginTop: space(4), fontSize: 14 },
  memory: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,176,32,0.35)', borderWidth: 1, borderRadius: radius.md, padding: space(4), marginBottom: 10 },
  footer: { paddingHorizontal: space(5), paddingTop: space(3) },
  mic: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: colors.amber },
  micHint: { color: 'rgba(255,255,255,0.6)', marginTop: 6, fontWeight: '600' },
});
