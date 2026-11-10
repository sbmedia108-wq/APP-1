// "Today's brain teaser": three questions a day, with stars, a streak and badges.

import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import {
  badgesFor,
  loadProgress,
  questionsFor,
  recordDay,
  todayKey,
  type QuizKind,
  type QuizProgress,
} from "./dailyQuiz";
import { celebrate } from "./celebrate";
import { playSound } from "./sounds";
import { speak, stopSpeaking } from "./speech";
import type { Settings } from "./types";
import { BigButton, Card, colors, T } from "./ui";

const KIND: Record<QuizKind, { label: string; icon: string }> = {
  tech: { label: "Tech tip", icon: "💡" },
  scam: { label: "Spot the scam", icon: "🛡️" },
  word: { label: "Word puzzle", icon: "🧩" },
};

const CHEERS = [
  "Brilliant!",
  "Spot on!",
  "Well done!",
  "Lovely, that's right!",
];
const KIND_WORDS = [
  "Not quite, but now you know!",
  "Good try! Here's the answer.",
  "Nearly! Here's how it works.",
];

export function BrainTeaser({
  settings,
  onHome,
}: {
  settings: Settings;
  onHome: () => void;
}) {
  const key = todayKey();
  const questions = useMemo(() => questionsFor(key), [key]);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [practice, setPractice] = useState(false); // replaying after today's is done: no stars
  const [index, setIndex] = useState(-1); // -1 intro, 0..2 questions, 3 results
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<{ kind: QuizKind; right: boolean }[]>(
    [],
  );
  const [before, setBefore] = useState<QuizProgress | null>(null);
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    loadProgress().then(setProgress);
    return () => stopSpeaking();
  }, []);

  const doneToday = progress?.lastPlayed === key;
  const current =
    index >= 0 && index < questions.length ? questions[index] : null;

  const say = (t: string) => settings.readAloud && speak(t);

  useEffect(() => {
    if (current && picked === null)
      say(`${KIND[current.kind].label}. ${current.question}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const choose = (i: number) => {
    if (!current || picked !== null) return;
    setPicked(i);
    const right = i === current.answer;
    setResults((r) => [...r, { kind: current.kind, right }]);
    // Bring the explanation into view, above the Next button.
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 150);
    const lead = right
      ? CHEERS[index % CHEERS.length]
      : KIND_WORDS[index % KIND_WORDS.length];
    if (right) celebrate("small");
    else playSound("try_again");
    // Let the chime finish before Mavis speaks.
    setTimeout(() => say(`${lead} ${current.explain}`), 800);
  };

  const next = async () => {
    setPicked(null);
    if (index + 1 < questions.length) return setIndex(index + 1);
    if (!practice) {
      setBefore(progress);
      const p = await recordDay(results);
      setProgress(p);
      const got = results.filter((r) => r.right).length;
      if (got > 0) celebrate("big");
      else playSound("step");
      await new Promise((r) => setTimeout(r, 1200));
      say(
        `You got ${got} out of 3. ${p.streak > 1 ? `That's ${p.streak} days in a row!` : "Come back tomorrow for three new ones."}`,
      );
    }
    setIndex(questions.length);
  };

  const start = (asPractice: boolean) => {
    setPractice(asPractice);
    setResults([]);
    setPicked(null);
    setIndex(0);
  };

  const back = (
    <Pressable accessibilityRole="button" onPress={onHome} style={styles.link}>
      <T size={18} color={colors.primary} bold>
        ✕ Back to the start
      </T>
    </Pressable>
  );

  if (!progress) return null;

  // Intro, or "you've done today's".
  if (index === -1) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        {back}
        <T size={56}>🧠</T>
        <T size={32} bold>
          Today's brain teaser
        </T>
        {doneToday ? (
          <T size={22} color={colors.muted} style={{ marginVertical: 8 }}>
            You've done today's. Well done! There are three new questions
            tomorrow.
          </T>
        ) : (
          <T size={22} color={colors.muted} style={{ marginVertical: 8 }}>
            Three quick questions: a tech tip, spot the scam, and a word puzzle.
            There's no rush, and no wrong answers, only things to learn.
          </T>
        )}
        <Stats progress={progress} />
        {doneToday ? (
          <BigButton
            label="Play today's again, just for fun"
            icon="🔁"
            variant="secondary"
            onPress={() => start(true)}
          />
        ) : (
          <BigButton
            label="Let's play"
            icon="▶️"
            variant="success"
            onPress={() => start(false)}
          />
        )}
        <Badges progress={progress} />
      </ScrollView>
    );
  }

  // A question.
  if (current) {
    const right = picked !== null && picked === current.answer;
    return (
      <View style={{ flex: 1 }}>
        <ScrollView ref={scroller} contentContainerStyle={styles.scroll}>
          {back}
          <View style={styles.topRow}>
            <T size={20} bold color={colors.primary}>
              {KIND[current.kind].icon} {KIND[current.kind].label}
            </T>
            <T size={20} bold color={colors.muted}>
              {index + 1} of {questions.length}
            </T>
          </View>
          <Card>
            <T size={26} bold>
              {current.question}
            </T>
          </Card>
          {current.options.map((o, i) => {
            const isAnswer = i === current.answer;
            const chosen = i === picked;
            const style =
              picked === null
                ? undefined
                : isAnswer
                  ? { backgroundColor: "#E3F3E6", borderColor: colors.success }
                  : chosen
                    ? {
                        backgroundColor: colors.dangerBg,
                        borderColor: colors.danger,
                      }
                    : { opacity: 0.55 };
            return (
              <Pressable
                key={o}
                accessibilityRole="button"
                accessibilityLabel={o}
                disabled={picked !== null}
                onPress={() => choose(i)}
                style={({ pressed }) => [
                  styles.option,
                  style,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <T size={23} bold>
                  {picked !== null && isAnswer
                    ? "✅ "
                    : picked !== null && chosen
                      ? "❌ "
                      : ""}
                  {o}
                </T>
              </Pressable>
            );
          })}
          {picked !== null && (
            <Card
              style={{
                backgroundColor: right ? "#E3F3E6" : "#FFF4E0",
                borderColor: right ? colors.success : "#B26A00",
              }}
            >
              <T size={24} bold>
                {right
                  ? `⭐ ${CHEERS[index % CHEERS.length]}`
                  : KIND_WORDS[index % KIND_WORDS.length]}
              </T>
              <T size={22}>{current.explain}</T>
            </Card>
          )}
        </ScrollView>
        {picked !== null && (
          <View style={styles.footer}>
            <BigButton
              label={
                index + 1 < questions.length ? "Next question" : "See how I did"
              }
              icon="➡️"
              variant="success"
              onPress={next}
            />
          </View>
        )}
      </View>
    );
  }

  // Results.
  const got = results.filter((r) => r.right).length;
  const newBadges =
    before && !practice
      ? badgesFor(progress).filter(
          (b, i) => b.earned && !badgesFor(before).at(i)?.earned,
        )
      : [];
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <T size={64} center>
        {got === 3 ? "🏆" : got >= 1 ? "🌟" : "🌱"}
      </T>
      <T size={34} bold center>
        {got === 3 ? "Full marks!" : got >= 1 ? "Well done!" : "Good effort!"}
      </T>
      <T size={24} center style={{ marginVertical: 8 }}>
        You got {got} out of 3
        {practice
          ? "."
          : `, and earned ${got} ${got === 1 ? "star" : "stars"}.`}
      </T>
      {!practice && progress.streak > 1 && (
        <Card style={{ backgroundColor: "#FFF4E0", borderColor: "#B26A00" }}>
          <T size={24} bold center>
            🔥 {progress.streak} days in a row!
          </T>
        </Card>
      )}
      {newBadges.map((b) => (
        <Card
          key={b.id}
          style={{ backgroundColor: "#E3F3E6", borderColor: colors.success }}
        >
          <T size={24} bold center>
            {b.emoji} New badge: {b.name}
          </T>
        </Card>
      ))}
      <T size={22} center color={colors.muted} style={{ marginVertical: 8 }}>
        Every question you try teaches you something. Come back tomorrow for
        three new ones.
      </T>
      <BigButton label="Back to the start" onPress={onHome} />
      <Stats progress={progress} />
      <Badges progress={progress} />
    </ScrollView>
  );
}

function Stats({ progress }: { progress: QuizProgress }) {
  return (
    <View style={styles.stats}>
      <Stat icon="⭐" value={progress.stars} label="stars" />
      <Stat icon="🔥" value={progress.streak} label="day streak" />
      <Stat icon="📅" value={progress.daysPlayed} label="days played" />
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <T size={26} center>
        {icon}
      </T>
      <T size={28} bold center>
        {value}
      </T>
      <T size={16} center color={colors.muted}>
        {label}
      </T>
    </View>
  );
}

function Badges({ progress }: { progress: QuizProgress }) {
  return (
    <View style={{ marginTop: 16 }}>
      <T size={22} bold>
        Your badges
      </T>
      <View style={styles.badges}>
        {badgesFor(progress).map((b) => (
          <View
            key={b.id}
            style={[styles.badge, !b.earned && { opacity: 0.45 }]}
            accessibilityLabel={`${b.name}: ${b.earned ? "earned" : b.how}`}
          >
            <T size={32} center>
              {b.earned ? b.emoji : "🔒"}
            </T>
            <T size={16} bold center>
              {b.name}
            </T>
            {!b.earned && (
              <T size={14} center color={colors.muted}>
                {b.how}
              </T>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  link: { paddingVertical: 12, alignSelf: "flex-start" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  option: {
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginVertical: 6,
    minHeight: 72,
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  stats: { flexDirection: "row", gap: 10, marginVertical: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  badge: {
    width: "30%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 10,
    gap: 2,
  },
});
