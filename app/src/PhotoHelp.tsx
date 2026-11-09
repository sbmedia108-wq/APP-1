// "Show Mavis a photo": take or choose a photo of a confusing screen or error
// message, add a few words if you like, and get a step-by-step guide.
// Needs the online helper, so the home screen only offers it when one is set up.

import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { getHelp } from "./api";
import type { Guide } from "./types";
import { BigButton, Card, colors, T, useScale } from "./ui";

type Picked = { uri: string; base64: string };

async function shrink(uri: string): Promise<Picked> {
  // Phone photos are huge: make it about 1280 pixels wide so it sends quickly.
  const ctx = ImageManipulator.manipulate(uri).resize({ width: 1280 });
  const ref = await ctx.renderAsync();
  const saved = await ref.saveAsync({
    compress: 0.6,
    base64: true,
    format: SaveFormat.JPEG,
  });
  return { uri: saved.uri, base64: saved.base64 ?? "" };
}

export function PhotoHelp({
  onHome,
  onGuide,
}: {
  onHome: () => void;
  onGuide: (g: Guide) => void;
}) {
  const scale = useScale();
  const [photo, setPhoto] = useState<Picked | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (from: "camera" | "library") => {
    setError(null);
    try {
      if (from === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError(
            "To take a photo, please allow the camera in your phone's Settings.",
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        quality: 0.8,
      };
      const res =
        from === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (res.canceled || !res.assets?.[0]) return;
      setPhoto(await shrink(res.assets[0].uri));
    } catch {
      setError("Sorry, that photo didn't work. Please try again.");
    }
  };

  const send = async () => {
    if (!photo) return;
    setBusy(true);
    setError(null);
    const result = await getHelp(
      note.trim() ||
        "Here is a photo of my screen. What does it mean, and what should I do?",
      {
        mediaType: "image/jpeg",
        data: photo.base64,
      },
    );
    setBusy(false);
    if (result?.source === "online") onGuide(result.guide);
    else
      setError(
        "I couldn't look at the photo just now. Please check you're connected to the internet, or tell me what it says instead.",
      );
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
          Looking at your photo…
        </T>
      </View>
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
        Show me a photo
      </T>
      <T size={22} color={colors.muted} style={{ marginVertical: 8 }}>
        Take a photo of the screen or message that's confusing you, like the TV
        or a computer. I'll tell you what it means.
      </T>

      {photo ? (
        <>
          <Image
            source={{ uri: photo.uri }}
            style={styles.preview}
            resizeMode="contain"
            accessibilityLabel="Your photo"
          />
          <T size={22} bold style={{ marginTop: 8 }}>
            Anything to add? (you can skip this)
          </T>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="For example: this came up on the TV"
            placeholderTextColor="#777"
            multiline
            style={[styles.input, { fontSize: 22 * scale }]}
            accessibilityLabel="Anything to add about the photo"
          />
          <BigButton
            label="Help me with this"
            icon="✅"
            variant="success"
            onPress={send}
          />
          <BigButton
            label="Take a different photo"
            variant="secondary"
            onPress={() => setPhoto(null)}
          />
        </>
      ) : (
        <>
          <BigButton
            label="Take a photo"
            icon="📷"
            onPress={() => pick("camera")}
          />
          <BigButton
            label="Choose a photo I've already taken"
            icon="🖼️"
            variant="secondary"
            onPress={() => pick("library")}
          />
        </>
      )}

      {!!error && (
        <Card
          style={{
            backgroundColor: colors.dangerBg,
            borderColor: colors.danger,
          }}
        >
          <T size={21}>{error}</T>
        </Card>
      )}
      <Card style={{ marginTop: 12 }}>
        <T size={19} color={colors.muted}>
          Don't photograph bank cards, passwords or letters with personal
          details.
        </T>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  link: { paddingVertical: 12, alignSelf: "flex-start" },
  preview: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    backgroundColor: "#00000010",
    marginVertical: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
    marginVertical: 8,
    color: colors.text,
    textAlignVertical: "top",
  },
});
