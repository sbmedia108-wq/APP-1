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

function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "en-US";
  } catch {
    return "en-US";
  }
}
// Hooks must always be called; use a no-op when the module is missing.
const useEvent: SpeechModule["useSpeechRecognitionEvent"] =
  speech?.useSpeechRecognitionEvent ??
  ((() => noop) as unknown as SpeechModule["useSpeechRecognitionEvent"]);

export function useVoice() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const finalText = useRef("");

  useEvent("start", () => setListening(true));
  useEvent("end", () => setListening(false));
  useEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    if (event.isFinal) {
      finalText.current = `${finalText.current} ${text}`.trim();
      setTranscript(finalText.current);
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
    speech.ExpoSpeechRecognitionModule.start({
      lang: deviceLocale(),
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
    });
  }, []);

  const stop = useCallback(() => {
    speech?.ExpoSpeechRecognitionModule.stop();
  }, []);

  return {
    available: speech !== null,
    listening,
    transcript,
    setTranscript: (t: string) => {
      finalText.current = t;
      setTranscript(t);
    },
    error,
    start,
    stop,
  };
}
