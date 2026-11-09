// Reading aloud, in one place, so the "Reading speed" setting applies everywhere.
import * as Speech from "expo-speech";

export type SpeechSpeed = "normal" | "slow";

let rate = 0.9;

export function setSpeechSpeed(speed: SpeechSpeed) {
  rate = speed === "slow" ? 0.7 : 0.9;
}

export function speak(text: string) {
  Speech.stop();
  if (text) Speech.speak(text, { rate });
}

export function stopSpeaking() {
  Speech.stop();
}
