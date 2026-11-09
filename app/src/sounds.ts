// Little reward sounds: a rising chime for a right answer, a soft "not quite",
// a happy "well done" for milestones, a gentle tick for each step, and a card
// reader beep in practice mode. All made for this app (no licence needed) and
// kept below about 1 kHz, where older ears hear best. They can be switched off
// in Settings, and every sound comes with something on screen too.

import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";

const SOURCES = {
  correct: require("../assets/sounds/correct.wav"),
  try_again: require("../assets/sounds/try_again.wav"),
  well_done: require("../assets/sounds/well_done.wav"),
  step: require("../assets/sounds/step.wav"),
  card_beep: require("../assets/sounds/card_beep.wav"),
} as const;

export type SoundName = keyof typeof SOURCES;

let enabled = true;
let modeSet = false;
const players: Partial<Record<SoundName, AudioPlayer>> = {};

export function setSoundsEnabled(on: boolean) {
  enabled = on;
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  try {
    if (!modeSet) {
      modeSet = true;
      // Respect the phone's silent switch, and don't stop Mavis reading aloud.
      setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: "mixWithOthers",
      }).catch(() => {});
    }
    const player = (players[name] ??= createAudioPlayer(SOURCES[name]));
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // A sound is a nice extra; never let it break the app.
  }
}
