// Celebrations: the "well done" chime with fireworks, or a right-answer chime
// with a little sparkle. The fireworks show even when sounds are switched off,
// so people who keep their phone quiet still get the reward.

import { playSound } from "./sounds";

export type Celebration = "big" | "small";

type Listener = (kind: Celebration) => void;
const listeners = new Set<Listener>();

export function onCelebrate(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** "big": a task finished (well done chime + fireworks).
 *  "small": a right answer (correct chime + a sparkle). */
export function celebrate(kind: Celebration) {
  playSound(kind === "big" ? "well_done" : "correct");
  listeners.forEach((fn) => fn(kind));
}
