// "Browse all help": every built-in guide, sorted into sections, so people
// can find help by tapping as well as by asking.

import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { CATEGORIES, type Category } from "./guideKit";
import { ALL_GUIDES, type OfflineGuide } from "./offlineGuides";
import { colors, T } from "./ui";

export function BrowseHelp({
  onPick,
  onHome,
}: {
  onPick: (g: OfflineGuide) => void;
  onHome: () => void;
}) {
  const [cat, setCat] = useState<Category | null>(null);
  const section = CATEGORIES.find((c) => c.id === cat);
  const guides = cat ? ALL_GUIDES.filter((g) => g.category === cat) : [];

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Pressable
        accessibilityRole="button"
        onPress={cat ? () => setCat(null) : onHome}
        style={styles.back}
      >
        <T size={18} color={colors.primary} bold>
          {cat ? "◀ All sections" : "✕ Start over"}
        </T>
      </Pressable>

      {!section ? (
        <>
          <T size={32} bold style={{ marginBottom: 4 }}>
            All the help
          </T>
          <T size={21} color={colors.muted} style={{ marginBottom: 12 }}>
            Touch a section to see what Mavis can help with.
          </T>
          {CATEGORIES.map((c) => {
            const count = ALL_GUIDES.filter((g) => g.category === c.id).length;
            if (!count) return null;
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={`${c.label}, ${count} guides`}
                onPress={() => setCat(c.id)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
              >
                <T size={34}>{c.emoji}</T>
                <View style={{ flex: 1 }}>
                  <T size={23} bold>
                    {c.label}
                  </T>
                  <T size={18} color={colors.muted}>
                    {count} guides
                  </T>
                </View>
              </Pressable>
            );
          })}
        </>
      ) : (
        <>
          <T size={32} bold style={{ marginBottom: 12 }}>
            {section.emoji} {section.label}
          </T>
          {guides.map((g) => (
            <Pressable
              key={g.id}
              accessibilityRole="button"
              accessibilityLabel={g.title}
              onPress={() => onPick(g)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
            >
              <T size={30}>{g.emoji}</T>
              <View style={{ flex: 1 }}>
                <T size={21} bold>
                  {g.title}
                </T>
              </View>
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  back: { paddingVertical: 12, paddingHorizontal: 4, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 6,
    minHeight: 76,
  },
});
