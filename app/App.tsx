import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { getHelp } from "./src/api";
import {
  decideGuide,
  guideById,
  OFFLINE_GUIDES,
  type OfflineGuide,
} from "./src/offlineGuides";
import { findTriage, TRIAGES, type Triage } from "./src/triage";
import type { Guide, Settings } from "./src/types";
import { BRAND } from "./src/brand";
import { ONLINE_HELP_AVAILABLE } from "./src/api";
import { BrowseHelp } from "./src/BrowseHelp";
import { BrainTeaser } from "./src/BrainTeaser";
import { loadProgress, todayKey, type QuizProgress } from "./src/dailyQuiz";
import { PhotoHelp } from "./src/PhotoHelp";
import { PracticeKiosk } from "./src/PracticeKiosk";
import { ScamCheck } from "./src/ScamCheck";
import { celebrate } from "./src/celebrate";
import { Fireworks } from "./src/Fireworks";
import { playSound, setSoundsEnabled } from "./src/sounds";
import { setSpeechSpeed, speak, stopSpeaking } from "./src/speech";
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
  | { name: "settings" }
  | { name: "practice" }
  | { name: "triage"; triage: Triage }
  | { name: "scam" }
  | { name: "photo" }
  | { name: "browse" }
  | { name: "teaser" };

function say(text: string, enabled: boolean) {
  if (enabled && text) speak(text);
  else stopSpeaking();
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
        <Fireworks />
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

  useEffect(() => setSpeechSpeed(settings.speechSpeed), [settings.speechSpeed]);
  useEffect(() => setSoundsEnabled(settings.sounds), [settings.sounds]);

  const goHome = () => {
    stopSpeaking();
    voice.setTranscript("");
    setScreen({ name: "home" });
  };

  const showGuide = (g: Guide) =>
    setScreen({ name: "guide", guide: g, offline: true });

  const askForHelp = async (problem: string) => {
    if (!problem.trim()) return;
    // What the built-in guides make of it, using the phone's other guesses
    // at the words too.
    const decision = decideGuide(problem, voice.alternatives);
    // Just "Netflix!" or "The TV!"? Don't guess: ask what's happening.
    const triage = findTriage(
      problem,
      !!(decision.guide ?? decision.choices[0]),
    );
    if (triage) return setScreen({ name: "triage", triage });
    if (!ONLINE_HELP_AVAILABLE) {
      if (decision.guide) return showGuide(decision.guide);
      // A few guides fit about equally: ask rather than guess.
      if (decision.choices.length)
        return setScreen({
          name: "triage",
          triage: {
            id: "choices",
            emoji: "🤔",
            tileLabel: "",
            question: "Is it one of these?",
            words: [],
            options: decision.choices.map((g) => ({
              emoji: g.emoji,
              label: g.title,
              guideId: g.id,
            })),
          },
        });
      return setScreen({ name: "notFound" });
    }
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
          onPractice={() => setScreen({ name: "practice" })}
          onPickTriage={(triage) => setScreen({ name: "triage", triage })}
          onScam={() => {
            voice.setTranscript("");
            setScreen({ name: "scam" });
          }}
          onPhoto={() => setScreen({ name: "photo" })}
          onBrowse={() => setScreen({ name: "browse" })}
          onTeaser={() => setScreen({ name: "teaser" })}
        />
      );
    case "browse":
      return <BrowseHelp onPick={showGuide} onHome={goHome} />;
    case "teaser":
      return <BrainTeaser settings={settings} onHome={goHome} />;
    case "scam":
      return (
        <ScamCheck
          voice={voice}
          settings={settings}
          onHome={goHome}
          helperButtons={
            <HelperButtons
              settings={settings}
              about="a message I think might be a scam"
            />
          }
        />
      );
    case "photo":
      return (
        <PhotoHelp
          onHome={goHome}
          onGuide={(g) =>
            setScreen({ name: "guide", guide: g, offline: false })
          }
        />
      );
    case "triage":
      return (
        <TriageScreen
          triage={screen.triage}
          readAloud={settings.readAloud}
          onPick={(id) => {
            const g = guideById(id);
            if (g) showGuide(g);
          }}
          onSomethingElse={goHome}
        />
      );
    case "practice":
      return <PracticeKiosk onExit={goHome} readAloud={settings.readAloud} />;
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
          <BigButton
            label="Browse all the help"
            icon="📚"
            variant="secondary"
            onPress={() => setScreen({ name: "browse" })}
            style={{ alignSelf: "stretch" }}
          />
          <HelperButtons
            settings={settings}
            about="something on my phone or TV"
          />
        </Centered>
      );
    case "guide":
      return (
        <GuideScreen
          guide={screen.guide}
          offline={screen.offline}
          settings={settings}
          onFixed={() => {
            celebrate("big");
            setScreen({ name: "fixed" });
          }}
          onNotFixed={() =>
            setScreen({ name: "notFixed", guide: screen.guide })
          }
          onAskAgain={goHome}
          onHome={goHome}
          onPractice={() => setScreen({ name: "practice" })}
          onChoose={(choice) => askForHelp(`${voice.transcript}. ${choice}`)}
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
          <HelperButtons settings={settings} about={screen.guide.title} />
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
  onPractice,
  onPickTriage,
  onScam,
  onPhoto,
  onBrowse,
  onTeaser,
}: {
  voice: ReturnType<typeof useVoice>;
  onSubmitText: (t: string) => void;
  onPickGuide: (g: Guide) => void;
  onSettings: () => void;
  onPractice: () => void;
  onPickTriage: (t: Triage) => void;
  onScam: () => void;
  onPhoto: () => void;
  onBrowse: () => void;
  onTeaser: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [quiz, setQuiz] = useState<QuizProgress | null>(null);
  useEffect(() => {
    loadProgress().then(setQuiz);
  }, []);
  const teaserDone = quiz?.lastPlayed === todayKey();
  const scale = useScale();

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={require("./assets/logo.png")}
            style={{ width: 36, height: 36 }}
            accessibilityIgnoresInvertColors
          />
          <T size={20} bold color={colors.text}>
            {BRAND.appName}
          </T>
        </View>
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
        Hello, I'm {BRAND.helperName}. What's not working?
      </T>
      <T size={22} color={colors.muted} style={{ marginTop: 8 }}>
        Tap the big button and tell me in your own words. I'm a computer helper,
        not a real person, so there's no wrong way to say it.
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

      <BigButton
        label="Is this a scam? Check a message or call"
        icon="🛡️"
        variant="secondary"
        onPress={onScam}
        style={{ marginTop: 12 }}
      />
      <BigButton
        label="Browse all the help"
        icon="📚"
        variant="secondary"
        onPress={onBrowse}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Today's brain teaser"
        onPress={onTeaser}
        style={({ pressed }) => [styles.teaser, pressed && { opacity: 0.85 }]}
      >
        <T size={34}>🧠</T>
        <View style={{ flex: 1 }}>
          <T size={22} bold>
            Today's brain teaser
          </T>
          <T size={18} color={colors.muted}>
            {teaserDone
              ? `Done for today${quiz && quiz.streak > 1 ? ` · 🔥 ${quiz.streak} days in a row` : ""}`
              : quiz && quiz.streak > 0
                ? `3 new questions · 🔥 ${quiz.streak}-day streak`
                : "3 quick questions, new every day"}
          </T>
        </View>
        {!teaserDone && (
          <View style={styles.newBadge}>
            <T size={15} bold color="#fff">
              NEW
            </T>
          </View>
        )}
      </Pressable>
      {ONLINE_HELP_AVAILABLE && (
        <BigButton
          label="Show Mavis a photo of the screen"
          icon="📷"
          variant="secondary"
          onPress={onPhoto}
        />
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

      <T size={22} bold style={{ marginTop: 24 }}>
        Or pick a common problem:
      </T>
      <GuideTiles
        heading="🏠 At home"
        tiles={[
          ...["tv", "tv-apps", "phone", "messages", "health", "money"]
            .map((id) => TRIAGES.find((t) => t.id === id)!)
            .map((t) => ({
              key: t.id,
              emoji: t.emoji,
              label: t.tileLabel,
              onPress: () => onPickTriage(t),
            })),
          ...OFFLINE_GUIDES.filter(
            (g) => g.place !== "out" && !g.hidden && !IN_PICKERS.has(g.id),
          ).map(toTile(onPickGuide)),
        ]}
      />
      <GuideTiles
        heading="🛍️ Out and about"
        subheading="Ordering screens, self-checkouts and ticket machines"
        tiles={OFFLINE_GUIDES.filter((g) => g.place === "out").map(
          toTile(onPickGuide),
        )}
      />
      <BigButton
        label="Practise ordering on a pretend screen"
        icon="🎓"
        variant="secondary"
        onPress={onPractice}
        style={{ marginTop: 12 }}
      />
    </ScrollView>
  );
}

// Guides already reachable from the TV and phone pickers (scams stay visible).
const IN_PICKERS = new Set(
  TRIAGES.flatMap((t) => t.options.map((o) => o.guideId)).filter(
    (id) => id !== "scam",
  ),
);

type Tile = { key: string; emoji: string; label: string; onPress: () => void };

const toTile =
  (onPick: (g: Guide) => void) =>
  (g: OfflineGuide): Tile => ({
    key: g.id,
    emoji: g.emoji,
    label: g.shortLabel,
    onPress: () => onPick(g),
  });

function GuideTiles({
  heading,
  subheading,
  tiles,
}: {
  heading: string;
  subheading?: string;
  tiles: Tile[];
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <T size={20} bold color={colors.muted}>
        {heading}
      </T>
      {!!subheading && (
        <T size={17} color={colors.muted}>
          {subheading}
        </T>
      )}
      <View style={[styles.grid, { marginTop: 8 }]}>
        {tiles.map((t) => (
          <Pressable
            key={t.key}
            accessibilityRole="button"
            accessibilityLabel={t.label}
            onPress={t.onPress}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
          >
            <T size={34} center>
              {t.emoji}
            </T>
            <T size={18} bold center>
              {t.label}
            </T>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ---------------- "What's happening?" picker ---------------- */

function TriageScreen({
  triage,
  readAloud,
  onPick,
  onSomethingElse,
}: {
  triage: Triage;
  readAloud: boolean;
  onPick: (guideId: string) => void;
  onSomethingElse: () => void;
}) {
  const intro =
    triage.id === "choices"
      ? "I want to be sure I've got this right."
      : "No problem, let's sort it out.";
  useEffect(() => {
    say(
      `${intro} ${triage.question} Touch the one that matches.`,
      readAloud,
    );
    return () => {
      stopSpeaking();
    };
  }, [triage.question, readAloud, intro]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onSomethingElse}
          style={styles.settingsLink}
        >
          <T size={18} color={colors.primary} bold>
            ✕ Start over
          </T>
        </Pressable>
      </View>
      <T size={22} color={colors.muted}>
        {intro}
      </T>
      <T size={32} bold style={{ marginTop: 4, marginBottom: 12 }}>
        {triage.question}
      </T>
      {triage.options.map((o) => (
        <Pressable
          key={o.guideId + o.label}
          accessibilityRole="button"
          accessibilityLabel={o.label}
          onPress={() => onPick(o.guideId)}
          style={({ pressed }) => [styles.option, pressed && { opacity: 0.75 }]}
        >
          <T size={34}>{o.emoji}</T>
          <View style={{ flex: 1 }}>
            <T size={22} bold>
              {o.label}
            </T>
          </View>
        </Pressable>
      ))}
      <BigButton
        label="Something else"
        icon="🎤"
        variant="primary"
        onPress={onSomethingElse}
        style={{ marginTop: 12 }}
      />
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
  onPractice,
  onChoose,
}: {
  guide: Guide;
  offline: boolean;
  settings: Settings;
  onFixed: () => void;
  onNotFixed: () => void;
  onAskAgain: () => void;
  onHome: () => void;
  onPractice: () => void;
  onChoose: (choice: string) => void;
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
      stopSpeaking();
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
        {(guide.choices ?? []).map((c) => (
          <BigButton
            key={c}
            label={c}
            variant="secondary"
            onPress={() => onChoose(c)}
            style={{ alignSelf: "stretch" }}
          />
        ))}
        <BigButton
          label={guide.choices?.length ? "Something else" : "Answer"}
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
            {(guide as OfflineGuide).id === "order-kiosk" && (
              <BigButton
                label="Practise first, at home"
                icon="🎓"
                variant="secondary"
                onPress={onPractice}
              />
            )}
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
            onPress={() => {
              playSound("step");
              setIndex(index + 1);
            }}
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

      <View style={[styles.topRow, { marginTop: 12 }]}>
        <T size={22} bold style={{ flex: 1 }}>
          Play cheerful sounds
        </T>
        <Switch
          value={settings.sounds}
          onValueChange={(v) => {
            update({ sounds: v });
            setSoundsEnabled(v);
            if (v) playSound("correct");
          }}
          style={{ transform: [{ scale: 1.4 }] }}
        />
      </View>

      <T size={22} bold style={{ marginTop: 20 }}>
        Reading speed
      </T>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(
          [
            { label: "Normal", value: "normal" },
            { label: "Slower", value: "slow" },
          ] as const
        ).map((o) => (
          <BigButton
            key={o.value}
            label={o.label}
            variant={settings.speechSpeed === o.value ? "primary" : "secondary"}
            onPress={() => {
              update({ speechSpeed: o.value });
              setSpeechSpeed(o.value);
              speak("This is how fast I'll read the steps to you.");
            }}
            style={{ flex: 1 }}
          />
        ))}
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

function HelperButtons({
  settings,
  about,
}: {
  settings: Settings;
  about: string;
}) {
  const phone = settings.helperPhone.replace(/[^\d+]/g, "");
  if (!phone) return null;
  const name = settings.helperName.trim() || "my helper";
  const message = `Hi${settings.helperName.trim() ? ` ${settings.helperName.trim()}` : ""}, I'm stuck with ${about}. Could you give me a ring when you have a minute? Thank you x`;
  return (
    <View style={{ alignSelf: "stretch" }}>
      <BigButton
        label={`Call ${name}`}
        icon="📞"
        variant="secondary"
        onPress={() => Linking.openURL(`tel:${phone}`)}
      />
      <BigButton
        label={`Send ${name} a text`}
        icon="💬"
        variant="secondary"
        onPress={() =>
          Linking.openURL(`sms:${phone}?body=${encodeURIComponent(message)}`)
        }
      />
    </View>
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
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginVertical: 6,
    minHeight: 84,
  },
  teaser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFF4D6",
    borderWidth: 3,
    borderColor: "#F2C14E",
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    minHeight: 84,
  },
  newBadge: {
    backgroundColor: colors.success,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
