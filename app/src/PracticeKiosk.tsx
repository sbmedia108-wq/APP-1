// Practice mode: a pretend takeaway ordering screen, with a coach at the top.
//
// It behaves like the touch-screen kiosks in fast-food places, so people can
// try one at home with no queue and no pressure. Nothing here is real: there
// is no money and no food. The takeaway ("Corner Grill") is made up.

import { speak, stopSpeaking } from "./speech";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { BigButton, colors, T } from "./ui";

/* ---------- The pretend menu ---------- */

type Category = "Burgers" | "Chicken" | "Sides" | "Drinks" | "Desserts";
type Item = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: Category;
  mealable?: boolean;
};

const CATEGORIES: { name: Category; emoji: string }[] = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Chicken", emoji: "🍗" },
  { name: "Sides", emoji: "🍟" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Desserts", emoji: "🍦" },
];

const MENU: Item[] = [
  {
    id: "cheeseburger",
    name: "Cheeseburger",
    emoji: "🍔",
    price: 2.49,
    category: "Burgers",
    mealable: true,
  },
  {
    id: "big-burger",
    name: "Double Burger",
    emoji: "🍔",
    price: 4.29,
    category: "Burgers",
    mealable: true,
  },
  {
    id: "veggie",
    name: "Veggie Burger",
    emoji: "🥬",
    price: 3.79,
    category: "Burgers",
    mealable: true,
  },
  {
    id: "fish",
    name: "Fish Burger",
    emoji: "🐟",
    price: 3.49,
    category: "Burgers",
    mealable: true,
  },
  {
    id: "nuggets",
    name: "6 Nuggets",
    emoji: "🍗",
    price: 3.19,
    category: "Chicken",
    mealable: true,
  },
  {
    id: "wrap",
    name: "Chicken Wrap",
    emoji: "🌯",
    price: 3.99,
    category: "Chicken",
    mealable: true,
  },
  { id: "fries", name: "Fries", emoji: "🍟", price: 1.89, category: "Sides" },
  {
    id: "salad",
    name: "Side Salad",
    emoji: "🥗",
    price: 1.99,
    category: "Sides",
  },
  { id: "tea", name: "Tea", emoji: "☕", price: 1.29, category: "Drinks" },
  {
    id: "coffee",
    name: "Coffee",
    emoji: "☕",
    price: 1.59,
    category: "Drinks",
  },
  { id: "cola", name: "Cola", emoji: "🥤", price: 1.49, category: "Drinks" },
  { id: "water", name: "Water", emoji: "💧", price: 0.99, category: "Drinks" },
  {
    id: "icecream",
    name: "Ice Cream",
    emoji: "🍦",
    price: 1.19,
    category: "Desserts",
  },
  {
    id: "pie",
    name: "Apple Pie",
    emoji: "🥧",
    price: 1.29,
    category: "Desserts",
  },
];

const MEAL_EXTRA = 2.0;
const ORDER_NUMBER = 42;

type Line = { key: string; item: Item; meal: boolean; qty: number };
type Stage =
  | "attract"
  | "where"
  | "menu"
  | "review"
  | "payChoice"
  | "card"
  | "done"
  | "counter";

const money = (n: number) => `£${n.toFixed(2)}`;
const lineTotal = (l: Line) =>
  (l.item.price + (l.meal ? MEAL_EXTRA : 0)) * l.qty;

/* ---------- Glowing outline for "touch here" ---------- */

function Glow({
  on,
  children,
  style,
}: {
  on: boolean;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!on) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [on, pulse]);
  const borderColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFC400", "#FF8A00"],
  });
  return (
    <Animated.View
      style={[
        style,
        {
          borderRadius: 14,
          borderWidth: 4,
          borderColor: on ? borderColor : "transparent",
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ---------- The coach ---------- */

function useCoach(
  stage: Stage,
  lines: Line[],
  category: Category,
  askMealFor: Item | null,
  eatIn: boolean | null,
) {
  const hasBurger = lines.some((l) => l.item.id === "cheeseburger");
  const hasTea = lines.some((l) => l.item.id === "tea");
  const extras = lines.filter(
    (l) => l.item.id !== "cheeseburger" && l.item.id !== "tea",
  );

  let text = "";
  let target = "";
  switch (stage) {
    case "attract":
      text =
        "This is a pretend ordering screen, like the ones in takeaways. Nothing here is real, so you can't get it wrong. Touch the screen to start.";
      target = "attract";
      break;
    case "where":
      text =
        "First it asks where you'll eat. Let's say you're taking your food home. Touch “Take away”.";
      target = "takeaway";
      break;
    case "menu":
      if (askMealFor) {
        text = `It's asking if you'd like a meal, with fries and a drink. We only want the ${askMealFor.name.toLowerCase()}, so touch “No thanks”.`;
        target = "no-meal";
      } else if (!hasBurger) {
        text = `${eatIn ? "“Eat in” is fine too. " : ""}Today let's order a cheeseburger and a cup of tea. The burgers are showing. Touch the Cheeseburger.`;
        target = category === "Burgers" ? "item-cheeseburger" : "cat-Burgers";
        if (category !== "Burgers")
          text = "Let's find the cheeseburger. Touch “Burgers” on the left.";
      } else if (!hasTea) {
        text =
          category === "Drinks"
            ? "Now touch “Tea”."
            : "Lovely, the burger is in your order. Look at the bottom of the screen. Now for the tea. Drinks are in a different group, so touch “Drinks” on the left.";
        target = category === "Drinks" ? "item-tea" : "cat-Drinks";
      } else {
        text =
          "You've got everything. Touch the green “Checkout” button at the bottom.";
        target = "checkout";
      }
      break;
    case "review":
      text = extras.length
        ? `There's something extra in your order (${extras.map((l) => l.item.name).join(", ")}). That's fine! You can touch the − button to take it off, or keep it. When you're happy, touch “Pay”.`
        : "This is your order. Always check it. It's all correct, so touch “Pay”.";
      target = extras.length ? "" : "pay";
      break;
    case "payChoice":
      text =
        "You can pay here with your card, or pay a person at the counter. Let's try the card. Touch “Pay here by card”.";
      target = "pay-card";
      break;
    case "card":
      text =
        "Now hold your bank card flat on the card reader, under the screen. Here, just touch the card reader.";
      target = "reader";
      break;
    case "done":
      text = `Well done! You ordered all by yourself. Your order number is ${ORDER_NUMBER}. In a real takeaway, you'd wait for ${ORDER_NUMBER} to appear on the screen above the counter, then collect your food.`;
      break;
    case "counter":
      text = `That's fine too. You'd take your receipt to the counter and pay a person there. Your order number is ${ORDER_NUMBER}.`;
      break;
  }
  return { text, target };
}

/* ---------- Main component ---------- */

export function PracticeKiosk({
  onExit,
  readAloud,
}: {
  onExit: () => void;
  readAloud: boolean;
}) {
  const [stage, setStage] = useState<Stage>("attract");
  const [eatIn, setEatIn] = useState<boolean | null>(null);
  const [category, setCategory] = useState<Category>("Burgers");
  const [lines, setLines] = useState<Line[]>([]);
  const [askMealFor, setAskMealFor] = useState<Item | null>(null);
  const [paying, setPaying] = useState(false);

  const coach = useCoach(stage, lines, category, askMealFor, eatIn);
  const glow = (id: string) => coach.target === id;

  useEffect(() => {
    if (readAloud) speak(coach.text);
    else stopSpeaking();
  }, [coach.text, readAloud]);
  useEffect(() => () => stopSpeaking(), []);

  const total = useMemo(
    () => lines.reduce((s, l) => s + lineTotal(l), 0),
    [lines],
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const add = (item: Item, meal: boolean) => {
    setLines((prev) => {
      const key = `${item.id}${meal ? "-meal" : ""}`;
      const found = prev.find((l) => l.key === key);
      if (found)
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { key, item, meal, qty: 1 }];
    });
  };
  const change = (key: string, by: number) =>
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + by } : l))
        .filter((l) => l.qty > 0),
    );

  const restart = () => {
    setStage("attract");
    setEatIn(null);
    setCategory("Burgers");
    setLines([]);
    setAskMealFor(null);
    setPaying(false);
  };

  const tapReader = () => {
    if (paying) return;
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStage("done");
    }, 1400);
  };

  const finished = stage === "done" || stage === "counter";

  return (
    <View style={{ flex: 1 }}>
      {/* Coach */}
      <View style={styles.coach}>
        <View style={styles.coachTop}>
          <T size={16} bold color="#fff">
            🎓 PRACTICE
          </T>
          <Pressable accessibilityRole="button" onPress={onExit} hitSlop={12}>
            <T size={16} bold color="#fff">
              ✕ Leave
            </T>
          </Pressable>
        </View>
        <T size={21} color="#fff">
          {coach.text}
        </T>
        {!finished && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              speak(coach.text);
            }}
            style={styles.again}
          >
            <T size={16} bold color="#fff">
              🔊 Say that again
            </T>
          </Pressable>
        )}
      </View>

      {finished ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 4 }}>
          <View style={styles.receipt}>
            <Text style={styles.receiptBrand}>CORNER GRILL</Text>
            <Text style={styles.receiptSmall}>
              {eatIn ? "EAT IN" : "TAKE AWAY"}
            </Text>
            <Text style={styles.receiptNumLabel}>Your order number</Text>
            <Text style={styles.receiptNum}>{ORDER_NUMBER}</Text>
            {lines.map((l) => (
              <View key={l.key} style={styles.receiptRow}>
                <Text style={styles.receiptText}>
                  {l.qty} × {l.item.name}
                  {l.meal ? " meal" : ""}
                </Text>
                <Text style={styles.receiptText}>{money(lineTotal(l))}</Text>
              </View>
            ))}
            <View
              style={[
                styles.receiptRow,
                {
                  borderTopWidth: 1,
                  borderStyle: "dashed",
                  marginTop: 6,
                  paddingTop: 6,
                },
              ]}
            >
              <Text style={[styles.receiptText, { fontWeight: "700" }]}>
                Total
              </Text>
              <Text style={[styles.receiptText, { fontWeight: "700" }]}>
                {money(total)}
              </Text>
            </View>
            <Text style={styles.receiptSmall}>
              {stage === "done" ? "PAID BY CARD" : "PLEASE PAY AT THE COUNTER"}
            </Text>
          </View>
          <BigButton label="Practise again" icon="🔁" onPress={restart} />
          <BigButton
            label="Back to the start"
            variant="secondary"
            onPress={onExit}
          />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: 10, gap: 8 }}>
          {/* The pretend kiosk */}
          <View style={styles.kiosk}>
            <View style={styles.kioskHeader}>
              <Text style={styles.brand}>☀️ CORNER GRILL</Text>
              {stage !== "attract" && (
                <Pressable onPress={restart}>
                  <Text style={styles.headerLink}>Start again</Text>
                </Pressable>
              )}
            </View>

            {stage === "attract" && (
              <Glow on={glow("attract")} style={{ flex: 1, margin: 10 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Touch to order"
                  onPress={() => setStage("where")}
                  style={styles.attract}
                >
                  <Text style={{ fontSize: 80 }}>🍔🍟</Text>
                  <Text style={styles.attractTitle}>Order here</Text>
                  <Text style={styles.attractSub}>
                    Touch the screen to start
                  </Text>
                </Pressable>
              </Glow>
            )}

            {stage === "where" && (
              <View
                style={{
                  flex: 1,
                  padding: 14,
                  gap: 14,
                  justifyContent: "center",
                }}
              >
                <Text style={styles.kioskQuestion}>
                  Where will you be eating today?
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setEatIn(true);
                    setStage("menu");
                  }}
                  style={styles.choice}
                >
                  <Text style={{ fontSize: 44 }}>🍽️</Text>
                  <Text style={styles.choiceText}>Eat in</Text>
                </Pressable>
                <Glow on={glow("takeaway")}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setEatIn(false);
                      setStage("menu");
                    }}
                    style={styles.choice}
                  >
                    <Text style={{ fontSize: 44 }}>🛍️</Text>
                    <Text style={styles.choiceText}>Take away</Text>
                  </Pressable>
                </Glow>
              </View>
            )}

            {stage === "menu" && (
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View style={styles.cats}>
                    {CATEGORIES.map((c) => (
                      <Glow key={c.name} on={glow(`cat-${c.name}`)}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={c.name}
                          onPress={() => setCategory(c.name)}
                          style={[
                            styles.cat,
                            category === c.name && styles.catOn,
                          ]}
                        >
                          <Text style={{ fontSize: 26 }}>{c.emoji}</Text>
                          <Text
                            style={[
                              styles.catText,
                              category === c.name && { color: "#fff" },
                            ]}
                          >
                            {c.name}
                          </Text>
                        </Pressable>
                      </Glow>
                    ))}
                  </View>
                  <ScrollView contentContainerStyle={styles.items}>
                    {MENU.filter((m) => m.category === category).map((m) => (
                      <Glow
                        key={m.id}
                        on={glow(`item-${m.id}`)}
                        style={{ width: "47%" }}
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={m.name}
                          onPress={() =>
                            m.mealable ? setAskMealFor(m) : add(m, false)
                          }
                          style={styles.item}
                        >
                          <Text style={{ fontSize: 40 }}>{m.emoji}</Text>
                          <Text style={styles.itemName}>{m.name}</Text>
                          <Text style={styles.itemPrice}>{money(m.price)}</Text>
                        </Pressable>
                      </Glow>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.orderBar}>
                  <Text style={styles.orderBarText}>
                    Your order: {count} {count === 1 ? "item" : "items"} ·{" "}
                    {money(total)}
                  </Text>
                  <Glow on={glow("checkout")}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Checkout"
                      disabled={count === 0}
                      onPress={() => setStage("review")}
                      style={[styles.checkout, count === 0 && { opacity: 0.4 }]}
                    >
                      <Text style={styles.checkoutText}>Checkout ›</Text>
                    </Pressable>
                  </Glow>
                </View>

                {askMealFor && (
                  <View style={styles.popupBackdrop}>
                    <View style={styles.popup}>
                      <Text style={styles.kioskQuestion}>Make it a meal?</Text>
                      <Text style={styles.popupSub}>
                        Add fries and a drink for {money(MEAL_EXTRA)} more
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          add(askMealFor, true);
                          setAskMealFor(null);
                        }}
                        style={[styles.choice, { paddingVertical: 12 }]}
                      >
                        <Text style={styles.choiceText}>
                          🍔🍟🥤 Make it a meal
                        </Text>
                      </Pressable>
                      <Glow on={glow("no-meal")}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="No thanks"
                          onPress={() => {
                            add(askMealFor, false);
                            setAskMealFor(null);
                          }}
                          style={[styles.choice, { paddingVertical: 12 }]}
                        >
                          <Text style={styles.choiceText}>
                            No thanks, just the {askMealFor.name.toLowerCase()}
                          </Text>
                        </Pressable>
                      </Glow>
                    </View>
                  </View>
                )}
              </View>
            )}

            {stage === "review" && (
              <View style={{ flex: 1, padding: 14, gap: 10 }}>
                <Text style={styles.kioskQuestion}>Check your order</Text>
                <ScrollView contentContainerStyle={{ gap: 8 }}>
                  {lines.map((l) => (
                    <View key={l.key} style={styles.reviewRow}>
                      <Text style={{ fontSize: 28 }}>{l.item.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>
                          {l.item.name}
                          {l.meal ? " meal" : ""}
                        </Text>
                        <Text style={styles.itemPrice}>
                          {money(lineTotal(l))}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove one ${l.item.name}`}
                        onPress={() => change(l.key, -1)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyText}>−</Text>
                      </Pressable>
                      <Text
                        style={[
                          styles.itemName,
                          { width: 22, textAlign: "center" },
                        ]}
                      >
                        {l.qty}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Add one more ${l.item.name}`}
                        onPress={() => change(l.key, 1)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </Pressable>
                    </View>
                  ))}
                  {lines.length === 0 && (
                    <Text style={styles.popupSub}>Your order is empty.</Text>
                  )}
                </ScrollView>
                <View style={styles.reviewTotal}>
                  <Text style={styles.kioskQuestion}>Total</Text>
                  <Text style={styles.kioskQuestion}>{money(total)}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setStage("menu")}
                    style={[styles.choice, { flex: 1, paddingVertical: 14 }]}
                  >
                    <Text style={styles.choiceText}>‹ Add more</Text>
                  </Pressable>
                  <Glow on={glow("pay")} style={{ flex: 1 }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Pay"
                      disabled={lines.length === 0}
                      onPress={() => setStage("payChoice")}
                      style={[
                        styles.checkout,
                        { paddingVertical: 16, alignItems: "center" },
                        lines.length === 0 && { opacity: 0.4 },
                      ]}
                    >
                      <Text style={styles.checkoutText}>Pay</Text>
                    </Pressable>
                  </Glow>
                </View>
              </View>
            )}

            {(stage === "payChoice" || stage === "card") && (
              <View
                style={{
                  flex: 1,
                  padding: 14,
                  gap: 14,
                  justifyContent: "center",
                }}
              >
                {stage === "payChoice" ? (
                  <>
                    <Text style={styles.kioskQuestion}>
                      How would you like to pay?
                    </Text>
                    <Text style={styles.popupSub}>Total {money(total)}</Text>
                    <Glow on={glow("pay-card")}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Pay here by card"
                        onPress={() => setStage("card")}
                        style={styles.choice}
                      >
                        <Text style={{ fontSize: 40 }}>💳</Text>
                        <Text style={styles.choiceText}>Pay here by card</Text>
                      </Pressable>
                    </Glow>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setStage("counter")}
                      style={styles.choice}
                    >
                      <Text style={{ fontSize: 40 }}>🧑‍🍳</Text>
                      <Text style={styles.choiceText}>Pay at the counter</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.kioskQuestion}>
                      {paying ? "Processing…" : `Please pay ${money(total)}`}
                    </Text>
                    <Text style={[styles.popupSub, { fontSize: 20 }]}>
                      {paying
                        ? "Keep your card still"
                        : "Hold your card on the reader below ⬇️"}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* The pretend card reader, under the screen like a real one */}
          {stage === "card" && (
            <Glow on={glow("reader") && !paying}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Card reader"
                onPress={tapReader}
                style={styles.reader}
              >
                <Text style={styles.readerSymbol}>
                  {paying ? "✅" : "💳 )))"}
                </Text>
                <Text style={styles.readerText}>
                  {paying ? "Beep! Approved" : "Card reader: touch here"}
                </Text>
              </Pressable>
            </Glow>
          )}
        </View>
      )}
    </View>
  );
}

const K = {
  red: "#C8102E",
  sun: "#FFC72C",
  cream: "#FFF8E7",
  ink: "#222",
};

const styles = StyleSheet.create({
  coach: { backgroundColor: colors.primary, padding: 16, gap: 8 },
  coachTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  again: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  kiosk: {
    flex: 1,
    backgroundColor: K.cream,
    borderRadius: 18,
    borderWidth: 6,
    borderColor: "#2B2B2B",
    overflow: "hidden",
  },
  kioskHeader: {
    backgroundColor: K.red,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: K.sun, fontWeight: "900", fontSize: 20, letterSpacing: 1 },
  headerLink: { color: "#fff", fontSize: 14, textDecorationLine: "underline" },

  attract: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: K.sun,
    borderRadius: 10,
    gap: 8,
  },
  attractTitle: { fontSize: 40, fontWeight: "900", color: K.red },
  attractSub: { fontSize: 20, color: K.ink },

  kioskQuestion: { fontSize: 22, fontWeight: "800", color: K.ink },
  choice: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2D9C3",
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  choiceText: {
    fontSize: 20,
    fontWeight: "700",
    color: K.ink,
    textAlign: "center",
  },

  cats: {
    width: 92,
    backgroundColor: "#F3E9D0",
    paddingVertical: 6,
    gap: 4,
    paddingHorizontal: 4,
  },
  cat: { alignItems: "center", paddingVertical: 8, borderRadius: 10 },
  catOn: { backgroundColor: K.red },
  catText: { fontSize: 13, fontWeight: "700", color: K.ink },

  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 8,
    justifyContent: "space-between",
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: K.ink,
    textAlign: "center",
  },
  itemPrice: { fontSize: 14, color: "#555" },

  orderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E2D9C3",
    gap: 8,
  },
  orderBarText: {
    fontSize: 14,
    fontWeight: "700",
    color: K.ink,
    flexShrink: 1,
  },
  checkout: {
    backgroundColor: "#1E7B34",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkoutText: { color: "#fff", fontWeight: "800", fontSize: 18 },

  popupBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 14,
  },
  popup: { backgroundColor: K.cream, borderRadius: 16, padding: 16, gap: 10 },
  popupSub: { fontSize: 16, color: "#555" },

  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3E9D0",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 22, fontWeight: "800", color: K.ink },
  reviewTotal: { flexDirection: "row", justifyContent: "space-between" },

  reader: {
    backgroundColor: "#2B2B2B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    gap: 2,
  },
  readerSymbol: { fontSize: 26, color: "#fff" },
  readerText: { fontSize: 15, color: "#ddd", fontWeight: "700" },

  receipt: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "stretch",
    gap: 4,
    marginBottom: 12,
  },
  receiptBrand: {
    textAlign: "center",
    fontWeight: "900",
    fontSize: 20,
    color: K.red,
    letterSpacing: 2,
  },
  receiptSmall: {
    textAlign: "center",
    fontSize: 13,
    color: "#555",
    letterSpacing: 1,
  },
  receiptNumLabel: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 8,
    color: K.ink,
  },
  receiptNum: {
    textAlign: "center",
    fontSize: 64,
    fontWeight: "900",
    color: K.ink,
  },
  receiptRow: { flexDirection: "row", justifyContent: "space-between" },
  receiptText: { fontSize: 15, color: K.ink },
});
