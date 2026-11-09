// "What is…?": ask what a tech word means and get a short, friendly answer.

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { explain, type Answer } from "./api";
import { GLOSSARY, POPULAR_QUESTIONS } from "./glossary";
import { speak, stopSpeaking } from "./speech";
import type { Settings } from "./types";
import { BigButton, Card, colors, T, useScale } from "./ui";
import type { useVoice } from "./useVoice";

export function AskQuestion({
  voice,
  settings,
  initialQuestion,
  onHome,
}: {
  voice: ReturnType<typeof useVoice>;
  settings: Settings;
  initialQuestion?: string;
  onHome: () => void;
}) {
  const scale = useScale();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [notKnown, setNotKnown] = useState(false);

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setBusy(true);
    setNotKnown(false);
    const a = await explain(question);
    setBusy(false);
    if (a) setAnswer(a);
    else setNotKnown(true);
  };

  // Came from the big button on the home screen with a "what is…?" question.
  useEffect(() => {
    if (initialQuestion) ask(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Words spoken into the microphone go into the box.
  useEffect(() => {
    if (!voice.listening && voice.transcript && !initialQuestion)
      setText(voice.transcript);
  }, [voice.listening, voice.transcript, initialQuestion]);

  useEffect(() => {
    if (!settings.readAloud) return;
    if (answer)
      speak(
        `${answer.term}. ${answer.short} ${answer.more} ${answer.tip ?? ""}`,
      );
    else if (!busy && !initialQuestion)
      speak(
        "What would you like to know about? Ask me what something means, like, what is Wi-Fi?",
      );
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, settings.readAloud]);

  const again = () => {
    setAnswer(null);
    setText("");
    setNotKnown(false);
    voice.setTranscript("");
  };

  const back = (
    <Pressable accessibilityRole="button" onPress={onHome} style={styles.link}>
      <T size={18} color={colors.primary} bold>
        ✕ Start over
      </T>
    </Pressable>
  );

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
          Let me explain…
        </T>
      </View>
    );
  }

  if (answer) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        {back}
        <T size={56}>{answer.emoji}</T>
        <T size={34} bold>
          {answer.term}
        </T>
        <Card>
          <T size={24}>{answer.short}</T>
        </Card>
        {!!answer.more && (
          <Card>
            <T size={22}>{answer.more}</T>
          </Card>
        )}
        {!!answer.tip && (
          <Card
            style={{
              backgroundColor: colors.dangerBg,
              borderColor: colors.danger,
            }}
          >
            <T size={21} bold color={colors.danger}>
              ⚠️ Good to know
            </T>
            <T size={21}>{answer.tip}</T>
          </Card>
        )}
        <BigButton
          label="Read it to me again"
          icon="🔊"
          variant="secondary"
          onPress={() =>
            speak(`${answer.term}. ${answer.short} ${answer.more}`)
          }
        />
        <BigButton label="Ask something else" icon="❓" onPress={again} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {back}
      <T size={32} bold>
        What is…?
      </T>
      <T size={22} color={colors.muted} style={{ marginVertical: 8 }}>
        Ask me what something means, in your own words. Like “What is AI?” or
        “What's the cloud?” There are no silly questions.
      </T>

      <BigButton
        label={
          voice.listening
            ? "I'm listening… tap when finished"
            : "Tap and ask me"
        }
        icon={voice.listening ? "⏹" : "🎤"}
        variant={voice.listening ? "danger" : "primary"}
        onPress={voice.listening ? voice.stop : voice.start}
      />
      <TextInput
        value={voice.listening ? voice.transcript : text}
        onChangeText={setText}
        placeholder="For example: what is Bluetooth?"
        placeholderTextColor="#777"
        style={[styles.input, { fontSize: 22 * scale }]}
        accessibilityLabel="Your question"
        onSubmitEditing={() => ask(text)}
      />
      <BigButton
        label="Explain it to me"
        icon="💡"
        variant="success"
        onPress={() => ask(text)}
        disabled={!text.trim()}
      />

      {notKnown && (
        <Card>
          <T size={21}>
            I don't know that one yet. Try asking in a different way, or pick
            one of the questions below.
          </T>
        </Card>
      )}

      <T size={22} bold style={{ marginTop: 20, marginBottom: 6 }}>
        People often ask
      </T>
      <View style={styles.grid}>
        {POPULAR_QUESTIONS.map((id) => GLOSSARY.find((g) => g.id === id)!).map(
          (g) => (
            <Pressable
              key={g.id}
              accessibilityRole="button"
              accessibilityLabel={`What is ${g.term}?`}
              onPress={() =>
                setAnswer({
                  term: g.term,
                  emoji: g.emoji,
                  short: g.short,
                  more: g.more,
                  tip: g.tip,
                })
              }
              style={({ pressed }) => [
                styles.chip,
                pressed && { opacity: 0.7 },
              ]}
            >
              <T size={26}>{g.emoji}</T>
              <T size={18} bold center>
                {g.term}?
              </T>
            </Pressable>
          ),
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  link: { paddingVertical: 12, alignSelf: "flex-start" },
  input: {
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 64,
    marginVertical: 8,
    color: colors.text,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    width: "47%",
    minHeight: 96,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
