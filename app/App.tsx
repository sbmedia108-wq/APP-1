import { StatusBar } from "expo-status-bar";
import * as Speech from "expo-speech";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { getHelp } from "./src/api";
import { OFFLINE_GUIDES } from "./src/offlineGuides";
import type { Guide, Settings } from "./src/types";
import { BigButton, Card, colors, ScaleContext, T, useScale } from "./src/ui";
import { useSettings } from "./src/useSettings";
import { useVoice } from "./src/useVoice";

type Screen =
  | { name: "home" }
  | { name: "confirm" }
  | { name: "loading" }
  | { name: "notFound" }
  | { name: "guide"; guide: Guide; offline: boolean }
  | { name: "fixed" }
  | { name: "notFixed"; guide: Guide }
  | { name: "settings" };

function say(text: string, enabled: boolean) {
  Speech.stop();
  if (enabled && text) Speech.speak(text, { rate: 0.9 });
}

export default function App() {
  const [settings, updateSettings] = useSettings();
  return (
    <SafeAreaProvider>
      <ScaleContext.Provider value={settings.textScale}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <StatusBar style="dark" />
          <Main settings={settings} updateSettings={updateSettings} />
        </SafeAreaView>
      </ScaleContext.Provider>
    </SafeAreaProvider>
  );
}

function Main({
  settings,
  updateSettings,
}: {
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
}) {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const voice = useVoice();

  const goHome = () => {
    Speech.stop();
    voice.setTranscript("");
    setScreen({ name: "home" });
  };

  const askForHelp = async (problem: string) => {
    if (!problem.trim()) return;
    setScreen({ name: "loading" });
    const result = await getHelp(problem);
    if (!result) return setScreen({ name: "notFound" });
    setScreen({
      name: "guide",
      guide: result.guide,
      offline: result.source === "offline",
    });
  };

  // When they finish talking, show them what we heard so they can check it.
  useEffect(() => {
    if (!voice.listening && voice.transcript && screen.name === "home") {
      setScreen({ name: "confirm" });
    }
  }, [voice.listening, voice.transcript, screen.name]);

  switch (screen.name) {
    case "home":
      return (
        <HomeScreen
          voice={voice}
          onSubmitText={(t) => {
            voice.setTranscript(t);
            setScreen({ name: "confirm" });
          }}
          onPickGuide={(g) =>
            setScreen({ name: "guide", guide: g, offline: true })
          }
          onSettings={() => setScreen({ name: "settings" })}
        />
      );
    case "confirm":
      return (
        <ConfirmScreen
          text={voice.transcript}
          onChange={voice.setTranscript}
          onYes={() => askForHelp(voice.transcript)}
          onRetry={goHome}
        />
      );
    case "loading":
      return (
        <Centered>
          <ActivityIndicator size="large" color={colors.primary} />
          <T size={30} bold center style={{ marginTop: 24 }}>
            Working it out…
          </T>
          <T size={22} center color={colors.muted} style={{ marginTop: 12 }}>
            This takes a few seconds. You're doing great.
          </T>
        </Centered>
      );
    case "notFound":
      return (
        <Centered>
          <T size={30} bold center>
            I'm not quite sure what's wrong yet
          </T>
          <T size={22} center style={{ marginVertical: 16 }}>
            Could you try again and say which thing isn't working, and what it's
            doing? For example: “My TV is on but the screen is black.”
          </T>
          <BigButton
            label="Try again"
            icon="🎤"
            onPress={goHome}
            style={{ alignSelf: "stretch" }}
          />
          <CallHelper settings={settings} />
        </Centered>
      );
    case "guide":
      return (
        <GuideScreen
          guide={screen.guide}
          offline={screen.offline}
          settings={settings}
          onFixed={() => setScreen({ name: "fixed" })}
          onNotFixed={() =>
            setScreen({ name: "notFixed", guide: screen.guide })
          }
          onAskAgain={goHome}
          onHome={goHome}
        />
      );
    case "fixed":
      return (
        <Centered>
          <T size={64} center>
            🎉
          </T>
          <T size={34} bold center>
            Well done!
          </T>
          <T size={24} center style={{ marginVertical: 16 }}>
            You fixed it yourself. That's brilliant.
          </T>
          <BigButton
            label="Back to the start"
            onPress={goHome}
            style={{ alignSelf: "stretch" }}
          />
        </Centered>
      );
    case "notFixed":
      return (
        <Centered>
          <T size={30} bold center>
            That's okay
          </T>
          <T size={22} center style={{ marginVertical: 16 }}>
            Some problems need a bit more help. It isn't anything you've done
            wrong.
          </T>
          {!!screen.guide.whenToGetHelp && (
            <Card style={{ alignSelf: "stretch" }}>
              <T size={22}>{screen.guide.whenToGetHelp}</T>
            </Card>
          )}
          <BigButton
            label="Describe it a different way"
            icon="🎤"
            onPress={goHome}
            style={{ alignSelf: "stretch" }}
          />
          <CallHelper settings={settings} />
        </Centered>
      );
    case "settings":
      return (
        <SettingsScreen
          settings={settings}
          update={updateSettings}
          onDone={goHome}
        />
      );
  }
}

/* ---------------- Home ---------------- */

function HomeScreen({
  voice,
  onSubmitText,
  onPickGuide,
  onSettings,
}: {
  voice: ReturnType<typeof useVoice>;
  onSubmitText: (t: string) => void;
  onPickGuide: (g: Guide) => void;
  onSettings: () => void;
}) {
  const [typed, setTyped] = useState("");
  const scale = useScale();

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <T size={18} color={colors.muted}>
          Easy Tech Help
        </T>
        <Pressable
          accessibilityRole="button"
          onPress={onSettings}
          style={styles.settingsLink}
        >
          <T size={18} color={colors.primary} bold>
            ⚙️ Settings
          </T>
        </Pressable>
      </View>

      <T size={34} bold>
        Hello! What's not working?
      </T>
      <T size={22} color={colors.muted} style={{ marginTop: 8 }}>
        Tap the big button and tell me in your own words. There's no wrong way
        to say it.
      </T>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          voice.listening ? "Stop listening" : "Tap and tell me the problem"
        }
        onPress={voice.listening ? voice.stop : voice.start}
        style={({ pressed }) => [
          styles.micButton,
          {
            backgroundColor: voice.listening
              ? colors.listening
              : colors.primary,
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        <T size={56} center color="#fff">
          {voice.listening ? "⏹" : "🎤"}
        </T>
        <T size={26} bold center color="#fff">
          {voice.listening
            ? "I'm listening…\nTap here when you've finished"
            : "Tap and tell me"}
        </T>
      </Pressable>

      {voice.listening && !!voice.transcript && (
        <Card>
          <T size={22} color={colors.muted}>
            I'm hearing:
          </T>
          <T size={24}>{voice.transcript}</T>
        </Card>
      )}

      {!!voice.error && (
        <Card
          style={{
            backgroundColor: colors.dangerBg,
            borderColor: colors.danger,
          }}
        >
          <T size={22}>{voice.error}</T>
        </Card>
      )}

      <T size={22} bold style={{ marginTop: 24 }}>
        Or type it here:
      </T>
      <TextInput
        value={typed}
        onChangeText={setTyped}
        placeholder="For example: my TV says no signal"
        placeholderTextColor="#777"
        multiline
        style={[styles.input, { fontSize: 22 * scale }]}
        accessibilityLabel="Type your problem"
      />
      <BigButton
        label="Help me with this"
        onPress={() => onSubmitText(typed)}
        disabled={!typed.trim()}
      />

      <T size={22} bold style={{ marginTop: 24, marginBottom: 8 }}>
        Or pick a common problem:
      </T>
      <View style={styles.grid}>
        {OFFLINE_GUIDES.map((g) => (
          <Pressable
            key={g.id}
            accessibilityRole="button"
            accessibilityLabel={g.shortLabel}
            onPress={() => onPickGuide(g)}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
          >
            <T size={34} center>
              {g.emoji}
            </T>
            <T size={18} bold center>
              {g.shortLabel}
            </T>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---------------- Confirm ---------------- */

function ConfirmScreen({
  text,
  onChange,
  onYes,
  onRetry,
}: {
  text: string;
  onChange: (t: string) => void;
  onYes: () => void;
  onRetry: () => void;
}) {
  const scale = useScale();
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <T size={30} bold>
        Is this right?
      </T>
      <T size={22} color={colors.muted} style={{ marginVertical: 8 }}>
        This is what I heard. You can tap on it to change any words.
      </T>
      <TextInput
        value={text}
        onChangeText={onChange}
        multiline
        style={[styles.input, { fontSize: 24 * scale, minHeight: 160 }]}
        accessibilityLabel="What you said"
      />
      <BigButton
        label="Yes, help me"
        icon="✅"
        variant="success"
        onPress={onYes}
        disabled={!text.trim()}
      />
      <BigButton
        label="No, start again"
        icon="🔄"
        variant="secondary"
        onPress={onRetry}
      />
    </ScrollView>
  );
}

/* ---------------- Step-by-step guide ---------------- */

function GuideScreen({
  guide,
  offline,
  settings,
  onFixed,
  onNotFixed,
  onAskAgain,
  onHome,
}: {
  guide: Guide;
  offline: boolean;
  settings: Settings;
  onFixed: () => void;
  onNotFixed: () => void;
  onAskAgain: () => void;
  onHome: () => void;
}) {
  // -1 = intro page, 0..n-1 = steps, n = "did it work?"
  const [index, setIndex] = useState(-1);
  const total = guide.steps.length;
  const current = index >= 0 && index < total ? guide.steps[index] : null;

  const spoken = !guide.understood
    ? guide.clarifyingQuestion
    : index === -1
      ? `${guide.reassurance} ${guide.safetyWarning ? `Important: ${guide.safetyWarning}` : ""} There are ${total} steps.`
      : current
        ? `Step ${index + 1}. ${current.instruction}`
        : "Did that fix it?";

  useEffect(() => {
    say(spoken, settings.readAloud);
    return () => {
      Speech.stop();
    };
  }, [spoken, settings.readAloud]);

  // The helper couldn't tell what the problem was: ask them one question.
  if (!guide.understood || total === 0) {
    return (
      <Centered>
        <T size={28} bold center>
          Can you tell me a bit more?
        </T>
        <Card style={{ alignSelf: "stretch" }}>
          <T size={24}>
            {guide.clarifyingQuestion ||
              "Which thing isn't working, and what is it doing?"}
          </T>
        </Card>
        <BigButton
          label="Answer"
          icon="🎤"
          onPress={onAskAgain}
          style={{ alignSelf: "stretch" }}
        />
      </Centered>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={onHome}
            style={styles.settingsLink}
          >
            <T size={18} color={colors.primary} bold>
              ✕ Start over
            </T>
          </Pressable>
          {index >= 0 && index < total && (
            <T size={20} bold color={colors.muted}>
              Step {index + 1} of {total}
            </T>
          )}
        </View>

        {index >= 0 && index < total && (
          <View style={styles.progress} accessibilityElementsHidden>
            {guide.steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i <= index ? colors.success : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {index === -1 && (
          <>
            <T size={30} bold>
              {guide.title}
            </T>
            <T size={22} style={{ marginVertical: 12 }}>
              {guide.reassurance}
            </T>
            {!!guide.safetyWarning && (
              <Card
                style={{
                  backgroundColor: colors.dangerBg,
                  borderColor: colors.danger,
                }}
              >
                <T size={22} bold color={colors.danger}>
                  ⚠️ Important
                </T>
                <T size={22}>{guide.safetyWarning}</T>
              </Card>
            )}
            <T size={22} style={{ marginVertical: 12 }}>
              We'll go one small step at a time. Take as long as you need.
            </T>
            {offline && (
              <T size={18} color={colors.muted} style={{ marginBottom: 8 }}>
                (This is one of the built-in guides.)
              </T>
            )}
            <BigButton
              label="Let's start"
              icon="▶️"
              onPress={() => setIndex(0)}
            />
          </>
        )}

        {current && (
          <>
            <Card>
              <T size={28} bold>
                {current.instruction}
              </T>
            </Card>
            {!!current.lookFor && (
              <Card
                style={{
                  backgroundColor: colors.hintBg,
                  borderColor: colors.primary,
                }}
              >
                <T size={20} bold color={colors.primary}>
                  👀 What you should see
                </T>
                <T size={22}>{current.lookFor}</T>
              </Card>
            )}
            <BigButton
              label="Read it to me again"
              icon="🔊"
              variant="secondary"
              onPress={() =>
                say(`Step ${index + 1}. ${current.instruction}`, true)
              }
            />
            <BigButton
              label="Go back a step"
              icon="◀️"
              variant="secondary"
              onPress={() => setIndex(index - 1)}
            />
            <BigButton
              label="It's working now!"
              icon="🎉"
              variant="secondary"
              onPress={onFixed}
            />
          </>
        )}

        {index === total && (
          <>
            <T size={32} bold center style={{ marginVertical: 24 }}>
              Did that fix it?
            </T>
            <BigButton
              label="Yes, it's working!"
              icon="👍"
              variant="success"
              onPress={onFixed}
            />
            <BigButton
              label="No, it's still not working"
              icon="👎"
              variant="secondary"
              onPress={onNotFixed}
            />
            <BigButton
              label="Go back a step"
              icon="◀️"
              variant="secondary"
              onPress={() => setIndex(total - 1)}
            />
          </>
        )}
      </ScrollView>
      {current && (
        // Always visible at the bottom, so nobody has to scroll to find it.
        <View style={styles.footer}>
          <BigButton
            label={index === total - 1 ? "Done" : "Done – next step"}
            icon="✅"
            variant="success"
            onPress={() => setIndex(index + 1)}
          />
        </View>
      )}
    </View>
  );
}

/* ---------------- Settings ---------------- */

function SettingsScreen({
  settings,
  update,
  onDone,
}: {
  settings: Settings;
  update: (p: Partial<Settings>) => void;
  onDone: () => void;
}) {
  const scale = useScale();
  const sizes: { label: string; value: Settings["textScale"] }[] = [
    { label: "Big", value: 1 },
    { label: "Bigger", value: 1.2 },
    { label: "Biggest", value: 1.4 },
  ];
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <T size={30} bold>
        Settings
      </T>

      <T size={22} bold style={{ marginTop: 20 }}>
        Writing size
      </T>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {sizes.map((s) => (
          <BigButton
            key={s.value}
            label={s.label}
            variant={settings.textScale === s.value ? "primary" : "secondary"}
            onPress={() => update({ textScale: s.value })}
            style={{ flex: 1 }}
          />
        ))}
      </View>

      <View style={[styles.topRow, { marginTop: 20 }]}>
        <T size={22} bold style={{ flex: 1 }}>
          Read steps out loud
        </T>
        <Switch
          value={settings.readAloud}
          onValueChange={(v) => update({ readAloud: v })}
          style={{ transform: [{ scale: 1.4 }] }}
        />
      </View>

      <T size={22} bold style={{ marginTop: 24 }}>
        Someone to call if you're stuck
      </T>
      <T size={18} color={colors.muted}>
        A family member or friend can fill this in for you.
      </T>
      <TextInput
        value={settings.helperName}
        onChangeText={(t) => update({ helperName: t })}
        placeholder="Their name, e.g. Sarah"
        placeholderTextColor="#777"
        style={[styles.input, { fontSize: 22 * scale, minHeight: 64 }]}
      />
      <TextInput
        value={settings.helperPhone}
        onChangeText={(t) => update({ helperPhone: t })}
        placeholder="Their phone number"
        placeholderTextColor="#777"
        keyboardType="phone-pad"
        style={[styles.input, { fontSize: 22 * scale, minHeight: 64 }]}
      />

      <BigButton label="Done" onPress={onDone} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

/* ---------------- Helpers ---------------- */

function CallHelper({ settings }: { settings: Settings }) {
  if (!settings.helperPhone.trim()) return null;
  const name = settings.helperName.trim() || "my helper";
  return (
    <BigButton
      label={`Call ${name}`}
      icon="📞"
      variant="secondary"
      onPress={() =>
        Linking.openURL(`tel:${settings.helperPhone.replace(/[^\d+]/g, "")}`)
      }
      style={{ alignSelf: "stretch" }}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView contentContainerStyle={[styles.scroll, styles.centered]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 48 },
  centered: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  settingsLink: { paddingVertical: 12, paddingHorizontal: 4 },
  micButton: {
    marginTop: 24,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    marginVertical: 8,
    color: colors.text,
    textAlignVertical: "top",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "47%",
    minHeight: 120,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  progress: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  dot: { width: 28, height: 12, borderRadius: 6 },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
