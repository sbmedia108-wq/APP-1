// "Is this a scam?" screen: say, type or paste what the message or call said,
// and get a clear red / amber / grey answer with what to do next.

import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { checkScam } from "./api";
import type { ScamResult } from "./scamCheck";
import { speak, stopSpeaking } from "./speech";
import type { Settings } from "./types";
import { BigButton, Card, colors, T, useScale } from "./ui";
import type { useVoice } from "./useVoice";

const LOOK = {
  high: { bg: "#FDECEA", border: "#B3261E", ink: "#B3261E", icon: "🛑" },
  medium: { bg: "#FFF4E0", border: "#B26A00", ink: "#8A4F00", icon: "⚠️" },
  low: { bg: "#EEF1F5", border: "#6B7785", ink: "#2A2522", icon: "🔎" },
};

export function ScamCheck({
  voice,
  settings,
  onHome,
  helperButtons,
}: {
  voice: ReturnType<typeof useVoice>;
  settings: Settings;
  onHome: () => void;
  helperButtons: React.ReactNode;
}) {
  const scale = useScale();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ScamResult | null>(null);

  // Words spoken into the microphone go into the box.
  useEffect(() => {
    if (!voice.listening && voice.transcript) setText(voice.transcript);
  }, [voice.listening, voice.transcript]);

  useEffect(() => {
    if (!settings.readAloud) return;
    if (result) speak(`${result.headline}. ${result.reasons.join(" ")}`);
    else
      speak(
        "Is this a scam? Tell me what the message or phone call said, and I'll check it for warning signs.",
      );
    return () => stopSpeaking();
  }, [result, settings.readAloud]);

  const check = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setResult(await checkScam(text));
    setBusy(false);
  };

  const again = () => {
    setResult(null);
    setText("");
    voice.setTranscript("");
  };

  if (busy) {
    return (
      <View
        style={[
          styles.scroll,
          { flex: 1, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <T size={28} bold center style={{ marginTop: 20 }}>
          Checking it for warning signs…
        </T>
      </View>
    );
  }

  if (result) {
    const look = LOOK[result.level];
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable
          accessibilityRole="button"
          onPress={onHome}
          style={styles.link}
        >
          <T size={18} color={colors.primary} bold>
            ✕ Start over
          </T>
        </Pressable>
        <View
          style={[
            styles.banner,
            { backgroundColor: look.bg, borderColor: look.border },
          ]}
        >
          <T size={44} center>
            {look.icon}
          </T>
          <T size={30} bold center color={look.ink}>
            {result.headline}
          </T>
        </View>

        <T size={22} bold style={{ marginTop: 16 }}>
          {result.level === "low" ? "Good to know" : "Why"}
        </T>
        {result.reasons.map((r) => (
          <Card key={r}>
            <T size={21}>{r}</T>
          </Card>
        ))}

        <T size={22} bold style={{ marginTop: 16 }}>
          What to do
        </T>
        {result.whatToDo.map((w) => (
          <Card key={w}>
            <T size={21}>{w}</T>
          </Card>
        ))}

        <BigButton
          label="Ring my bank safely (159)"
          icon="🏦"
          onPress={() => Linking.openURL("tel:159")}
          style={{ marginTop: 16 }}
        />
        {helperButtons}
        <BigButton
          label="Check something else"
          variant="secondary"
          onPress={again}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        accessibilityRole="button"
        onPress={onHome}
        style={styles.link}
      >
        <T size={18} color={colors.primary} bold>
          ✕ Start over
        </T>
      </Pressable>
      <T size={32} bold>
        Is this a scam?
      </T>
      <T size={22} color={colors.muted} style={{ marginVertical: 8 }}>
        Tell me what the message or phone call said. You can say it, type it, or
        paste a text message.
      </T>

      <BigButton
        label={
          voice.listening
            ? "I'm listening… tap when finished"
            : "Tap and tell me"
        }
        icon={voice.listening ? "⏹" : "🎤"}
        variant={voice.listening ? "danger" : "primary"}
        onPress={voice.listening ? voice.stop : voice.start}
      />
      {!!voice.error && (
        <Card
          style={{
            backgroundColor: colors.dangerBg,
            borderColor: colors.danger,
          }}
        >
          <T size={20}>{voice.error}</T>
        </Card>
      )}

      <TextInput
        value={voice.listening ? voice.transcript : text}
        onChangeText={setText}
        placeholder="For example: a text saying my parcel can't be delivered and I need to pay £1.99"
        placeholderTextColor="#777"
        multiline
        style={[styles.input, { fontSize: 22 * scale }]}
        accessibilityLabel="What the message or call said"
      />
      <BigButton
        label="Check it"
        icon="🛡️"
        variant="success"
        onPress={check}
        disabled={!text.trim()}
      />

      <Card style={{ marginTop: 16 }}>
        <T size={20} bold>
          Remember
        </T>
        <T size={20}>
          Your bank will never ask for your PIN, a code, or for you to move
          money. If you're unsure, hang up and ring 159.
        </T>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  link: { paddingVertical: 12, alignSelf: "flex-start" },
  banner: {
    borderWidth: 3,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    alignItems: "center",
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    marginVertical: 8,
    color: colors.text,
    textAlignVertical: "top",
  },
});
