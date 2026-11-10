// Fireworks that go off with the "well done" chime, and a little sparkle for a
// right answer. Kept gentle on purpose: soft colours that fade out (no
// flashing), about two and a half seconds long, never in the way of a tap,
// and switched off when the phone's "Remove animations" (reduce motion)
// setting is on.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { onCelebrate, type Celebration } from "./celebrate";

const COLOURS = ["#FFC845", "#1F5FBF", "#E05A47", "#2E9E5B", "#F28C28", "#D96BA8"];

type Burst = {
  id: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
  radius: number;
  count: number;
  colours: string[];
};

// Where the bursts go, as a share of the screen, and when they start.
// They stay in the space above and below the middle of the screen, so the
// "Well done!" words can always be read.
const BIG = [
  { x: 0.26, y: 0.14, delay: 0 },
  { x: 0.76, y: 0.12, delay: 280 },
  { x: 0.5, y: 0.2, delay: 560 },
  { x: 0.2, y: 0.8, delay: 840 },
  { x: 0.8, y: 0.78, delay: 1120 },
];

function makeBursts(kind: Celebration, width: number, height: number): Burst[] {
  const stamp = `${Date.now()}-${Math.random()}`;
  if (kind === "small") {
    return [
      {
        id: `${stamp}-0`,
        x: width / 2,
        y: height * 0.12,
        delay: 0,
        duration: 950,
        radius: Math.min(width, height) * 0.16,
        count: 10,
        colours: ["#FFC845", "#2E9E5B", "#1F5FBF"],
      },
    ];
  }
  const radius = Math.min(width, height) * 0.24;
  return BIG.map((b, i) => ({
    id: `${stamp}-${i}`,
    x: b.x * width,
    y: b.y * height,
    delay: b.delay,
    duration: 1400,
    radius,
    count: 16,
    // Each burst leads with its own colour, mixed with two others.
    colours: [COLOURS[i % 6], COLOURS[(i + 2) % 6], COLOURS[(i + 4) % 6]],
  }));
}

export function Fireworks() {
  const { width, height } = useWindowDimensions();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const reduceMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => (reduceMotion.current = v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
      reduceMotion.current = v;
    });
    return () => sub?.remove();
  }, []);

  useEffect(
    () =>
      onCelebrate((kind) => {
        if (reduceMotion.current) return;
        const added = makeBursts(kind, width, height);
        const ids = new Set(added.map((b) => b.id));
        setBursts((prev) => [...prev, ...added]);
        const last = Math.max(...added.map((b) => b.delay + b.duration));
        setTimeout(() => setBursts((prev) => prev.filter((b) => !ids.has(b.id))), last + 150);
      }),
    [width, height],
  );

  if (bursts.length === 0) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      {bursts.map((b) => (
        <BurstView key={b.id} burst={b} />
      ))}
    </View>
  );
}

function BurstView({ burst }: { burst: Burst }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration: burst.duration,
      delay: burst.delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    });
    anim.start();
    return () => anim.stop();
  }, [t, burst]);

  // Two rings of sparks: big ones flying far, small ones closer in.
  const sparks = useMemo(() => {
    const list: { dx: number; dy: number; fall: number; r: number; colour: string }[] = [];
    for (let ring = 0; ring < 2; ring++) {
      const n = ring === 0 ? burst.count : Math.round(burst.count * 0.6);
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 + ring * 0.3 + Math.random() * 0.15;
        const dist = burst.radius * (ring === 0 ? 0.9 + Math.random() * 0.2 : 0.45 + Math.random() * 0.15);
        list.push({
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          fall: burst.radius * 0.18, // a gentle drift down as they fade, like real fireworks
          r: ring === 0 ? 6 : 4,
          colour: burst.colours[(i + ring) % burst.colours.length],
        });
      }
    }
    return list;
  }, [burst]);

  const opacity = t.interpolate({ inputRange: [0, 0.05, 0.6, 1], outputRange: [0, 1, 1, 0] });
  const scale = t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.3, 1.15, 0.5] });

  return (
    <View style={{ position: "absolute", left: burst.x, top: burst.y }}>
      {sparks.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: s.r,
            marginLeft: -s.r,
            marginTop: -s.r,
            backgroundColor: s.colour,
            opacity,
            transform: [
              { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, s.dx] }) },
              {
                translateY: t.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [0, s.dy, s.dy + s.fall],
                }),
              },
              { scale },
            ],
          }}
        />
      ))}
    </View>
  );
}
