// What people see of their rewards: the level card, "New badge!" cards, the home tile and the "My badges" screen.

import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { BigButton, Card, T, colors } from "./ui";
import { loadProgress, type QuizProgress } from "./dailyQuiz";
import { allBadges, levelFor, loadActivity, newlyEarned, SECTIONS, type Activity, type Badge } from "./achievements";

export type Snapshot = { q: QuizProgress; a: Activity; badges: Badge[]; levelUp?: boolean };

export async function snapshot(): Promise<Snapshot> {
  const [q, a] = await Promise.all([loadProgress(), loadActivity()]);
  return { q, a, badges: allBadges(q, a) };
}

/** Run something that adds progress, and get back the badges it unlocked. */
export async function withRewards(record: () => Promise<unknown>): Promise<{ after: Snapshot; fresh: Badge[] }> {
  const before = await snapshot();
  await record();
  const after = await snapshot();
  after.levelUp = levelFor(after.q, after.a).number > levelFor(before.q, before.a).number;
  return { after, fresh: newlyEarned(before.badges, after.badges) };
}

export function useSnapshot(deps: unknown[] = []) {
  const [s, setS] = useState<Snapshot | null>(null);
  useEffect(() => {
    snapshot().then(setS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return s;
}

/* ---------- Pieces ---------- */

export function Bar({ value, color = colors.success }: { value: number; color?: string }) {
  return (
    <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.barFill, { width: `${value > 0 ? Math.max(4, Math.min(100, value * 100)) : 0}%`, backgroundColor: color }]} />
    </View>
  );
}

export function LevelCard({ snap }: { snap: Snapshot }) {
  const lv = levelFor(snap.q, snap.a);
  return (
    <View
      style={styles.level}
      accessible
      accessibilityLabel={`${snap.levelUp ? "Level up! " : ""}Level ${lv.number}, ${lv.name}.${lv.next ? ` ${lv.next.toGo} points to ${lv.next.name}.` : " The top level."}`}
    >
      <View style={styles.levelRow}>
        <View style={styles.levelBadge}>
          <T size={40} center>
            {lv.emoji}
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T size={18} bold color="#FFE7A3">
            {snap.levelUp ? `🎉 LEVEL UP! LEVEL ${lv.number}` : `LEVEL ${lv.number}`}
          </T>
          <T size={26} bold color="#fff">
            {lv.name}
          </T>
        </View>
      </View>
      {lv.next ? (
        <>
          <Bar value={lv.next.progress} color="#FFC845" />
          <T size={18} color="#fff">
            {lv.next.toGo} more points to {lv.next.name}
          </T>
        </>
      ) : (
        <T size={20} bold color="#fff">
          You've reached the top level. Amazing!
        </T>
      )}
    </View>
  );
}

export function NewBadges({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;
  return (
    <View style={{ gap: 10, marginVertical: 8 }}>
      {badges.map((b) => (
        <View key={b.id} style={styles.newCard} accessible accessibilityLabel={`New badge: ${b.name}`}>
          <View style={styles.newEmoji}>
            <T size={40} center>
              {b.emoji}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T size={18} bold color={colors.success}>
              NEW BADGE!
            </T>
            <T size={26} bold>
              {b.name}
            </T>
          </View>
        </View>
      ))}
    </View>
  );
}

/** The small tile on the home screen. */
export function RewardsTile({ onPress, refresh }: { onPress: () => void; refresh?: unknown }) {
  const snap = useSnapshot([refresh]);
  if (!snap) return null;
  const lv = levelFor(snap.q, snap.a);
  const earned = snap.badges.filter((b) => b.earned).length;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`My badges. Level ${lv.number}, ${lv.name}. ${earned} of ${snap.badges.length} badges.`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
    >
      <T size={34}>🏅</T>
      <View style={{ flex: 1 }}>
        <T size={22} bold>
          My badges
        </T>
        <T size={18} color={colors.text}>
          Level {lv.number} {lv.emoji} · {earned} of {snap.badges.length} badges
        </T>
      </View>
      <T size={28} color={colors.primary} bold>
        ›
      </T>
    </Pressable>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <T size={26} center>
        {icon}
      </T>
      <T size={28} bold center>
        {value}
      </T>
      <T size={16} center color={colors.text}>
        {label}
      </T>
    </View>
  );
}

function BadgeTile({ b }: { b: Badge }) {
  return (
    <View
      style={[styles.badge, b.earned ? styles.badgeEarned : styles.badgeLocked]}
      accessible
      accessibilityLabel={b.earned ? `${b.name}: earned` : `${b.name}: locked. ${b.how}. ${b.have} of ${b.need}.`}
    >
      <T size={36} center>
        {b.earned ? b.emoji : "🔒"}
      </T>
      <T size={17} bold center>
        {b.name}
      </T>
      {!b.earned && (
        <>
          <T size={16} center color={colors.text}>
            {b.how}
          </T>
          {b.need > 1 && (
            <>
              <Bar value={b.have / b.need} />
              <T size={16} bold center color={colors.text}>
                {b.have} of {b.need}
              </T>
            </>
          )}
        </>
      )}
    </View>
  );
}

/* ---------- The screen ---------- */

const earnedIn = (list: Badge[], section: string) => list.filter((b) => b.section === section && b.earned).length;

export function MyBadges({ onHome }: { onHome: () => void }) {
  const snap = useSnapshot();
  if (!snap) return null;
  const earned = snap.badges.filter((b) => b.earned).length;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Pressable accessibilityRole="button" onPress={onHome} style={styles.back}>
        <T size={20} bold color={colors.primary}>
          ✕ Back to the start
        </T>
      </Pressable>
      <T size={34} bold>
        My badges
      </T>
      <T size={22} style={{ marginBottom: 12 }}>
        You've earned {earned} of {snap.badges.length}. Every fix and every question counts.
      </T>
      <LevelCard snap={snap} />
      <View style={styles.stats}>
        <Stat icon="🔧" value={snap.a.fixes} label="things fixed" />
        <Stat icon="🔥" value={snap.q.streak} label="teaser streak" />
        <Stat icon="⭐" value={snap.q.stars} label="stars" />
      </View>
      {/* sections with badges earned come first, so what they've won is the first thing they see */}
      {[...SECTIONS]
        .sort((x, y) => earnedIn(snap.badges, y.id) - earnedIn(snap.badges, x.id))
        .map((sec) => {
        const list = snap.badges.filter((b) => b.section === sec.id);
        const got = list.filter((b) => b.earned).length;
        // earned first, then the ones closest to unlocking
        const sorted = [...list].sort((x, y) => Number(y.earned) - Number(x.earned) || y.have / y.need - x.have / x.need);
        return (
          <View key={sec.id} style={{ marginTop: 22 }}>
            <View style={styles.secHead}>
              <T size={24} bold style={{ flex: 1 }}>
                {sec.title}
              </T>
              <T size={18} bold color={colors.text}>
                {got} of {list.length}
              </T>
            </View>
            <View style={styles.grid}>
              {sorted.map((b) => (
                <BadgeTile key={b.id} b={b} />
              ))}
            </View>
          </View>
        );
      })}
      <BigButton label="Back to the start" onPress={onHome} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  back: { minHeight: 48, justifyContent: "center", alignSelf: "flex-start", marginBottom: 4 },
  bar: { height: 12, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.12)", overflow: "hidden", marginVertical: 8, alignSelf: "stretch" },
  barFill: { height: "100%", borderRadius: 6 },
  level: { backgroundColor: "#1F5FBF", borderRadius: 22, padding: 18, gap: 4 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  levelBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  newCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#E3F3E6", borderWidth: 3, borderColor: colors.success, borderRadius: 20, padding: 14 },
  newEmoji: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  tile: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#EAF1FC", borderWidth: 3, borderColor: "#9DBBEA", borderRadius: 18, padding: 16, marginVertical: 8, minHeight: 84 },
  stats: { flexDirection: "row", gap: 10, marginTop: 14 },
  stat: { flex: 1, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4 },
  secHead: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: "47%", flexGrow: 1, borderRadius: 18, borderWidth: 2, padding: 12, gap: 2, alignItems: "center" },
  badgeEarned: { backgroundColor: "#FFF4D6", borderColor: "#F2C14E" },
  badgeLocked: { backgroundColor: "#F4EFE6", borderColor: colors.border, borderStyle: "dashed" },
});
