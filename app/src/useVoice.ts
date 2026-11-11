// Voice-to-text. Uses the phone's own speech recogniser.
//
// Note: this needs a development build (npx expo run:ios / run:android or an
// EAS build). In Expo Go the native module isn't present, so `available`
// is false and the app falls back to typing (the phone keyboard's own
// microphone key still works for dictation).

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechModule = typeof import("expo-speech-recognition");

let speech: SpeechModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  speech = require("expo-speech-recognition") as SpeechModule;
  // Touch the native module so a missing one throws here, not later.
  void speech.ExpoSpeechRecognitionModule.isRecognitionAvailable;
} catch {
  speech = null;
}

const noop = () => {};

// British English for English speakers: it understands "telly", "Freeview"
// and UK accents better than the American default.
function speechLanguage(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || "en-GB";
    return locale.toLowerCase().startsWith("en") ? "en-GB" : locale;
  } catch {
    return "en-GB";
  }
}

// Words the phone should listen out for. Without these, "WhatsApp" often
// comes out as "what's up" and "iPlayer" as "I player". (Android 13 and
// newer use this list; older phones ignore it, and the matcher fixes the
// common mix-ups anyway.)
const TECH_WORDS = [
  "WhatsApp", "Netflix", "iPlayer", "BBC iPlayer", "ITVX", "YouTube", "Freeview", "Freesat",
  "Sky", "Virgin Media", "Fire Stick", "Roku", "Chromecast", "Disney Plus", "Prime Video",
  "Wi-Fi", "router", "broadband", "Bluetooth", "hearing aids", "Alexa", "Google", "Gmail",
  "Outlook", "Hotmail", "attachment", "email", "voicemail", "voice note", "video call",
  "Zoom", "FaceTime", "Facebook", "Instagram", "TikTok", "Messenger", "text message",
  "screenshot", "selfie", "Play Store", "app", "update", "password", "PIN", "verification code",
  "NHS App", "GP", "repeat prescription", "111", "banking app", "contactless", "Google Wallet",
  "cash machine", "QR code", "RingGo", "PayByPhone", "self-checkout", "subtitles",
  "audio description", "remote", "telly", "tablet", "Samsung", "scam", "159",
];
// Hooks must always be called; use a no-op when the module is missing.
const useEvent: SpeechModule["useSpeechRecognitionEvent"] =
  speech?.useSpeechRecognitionEvent ??
  ((() => noop) as unknown as SpeechModule["useSpeechRecognitionEvent"]);

export function useVoice() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  // The phone's other guesses at what was said, used if the first guess
  // doesn't match anything well.
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const finalText = useRef("");

  useEvent("start", () => setListening(true));
  useEvent("end", () => setListening(false));
  useEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    if (event.isFinal) {
      const before = finalText.current;
      finalText.current = `${before} ${text}`.trim();
      setTranscript(finalText.current);
      setAlternatives(
        event.results
          .slice(1)
          .map((r) => `${before} ${r.transcript}`.trim())
          .filter(Boolean),
      );
    } else {
      setTranscript(`${finalText.current} ${text}`.trim());
    }
  });
  useEvent("error", (event) => {
    setListening(false);
    if (event.error === "no-speech" || event.error === "aborted") return;
    setError(
      "Sorry, I couldn't hear that. Please try again, or type it instead.",
    );
  });

  useEffect(() => () => speech?.ExpoSpeechRecognitionModule.abort(), []);

  const start = useCallback(async () => {
    setError(null);
    if (!speech) {
      setError(
        "Talking isn't available on this phone yet. Please type instead.",
      );
      return;
    }
    const perm =
      await speech.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError(
        "To use your voice, please allow the microphone in your phone's Settings.",
      );
      return;
    }
    finalText.current = "";
    setTranscript("");
    setAlternatives([]);
    speech.ExpoSpeechRecognitionModule.start({
      lang: speechLanguage(),
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
      maxAlternatives: 3,
      contextualStrings: TECH_WORDS,
      // Give people time to think mid-sentence before it stops listening.
      // (Only some phones honour these; it's harmless on the rest.)
      androidIntentOptions: {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 4000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
      },
    });
  }, []);

  const stop = useCallback(() => {
    speech?.ExpoSpeechRecognitionModule.stop();
  }, []);

  return {
    available: speech !== null,
    listening,
    transcript,
    alternatives,
    setTranscript: (t: string) => {
      finalText.current = t;
      setTranscript(t);
      setAlternatives([]);
    },
    error,
    start,
    stop,
  };
}
