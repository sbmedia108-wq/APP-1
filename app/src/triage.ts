// "What's happening?" picker.
//
// When someone just says one word, like "Netflix!" or "The TV!", often when
// they're fed up, we don't guess. We calmly ask what's happening and show a
// few big picture buttons. One tap takes them to the right simple guide.

export type TriageOption = { emoji: string; label: string; guideId: string };
export type Triage = {
  id: string;
  emoji: string;
  /** Shown on the home screen picture button */
  tileLabel: string;
  question: string;
  words: string[];
  options: TriageOption[];
};

const TV_APP_NAMES: Record<string, string> = {
  netflix: "Netflix",
  iplayer: "BBC iPlayer",
  "bbc iplayer": "BBC iPlayer",
  youtube: "YouTube",
  itvx: "ITVX",
  "itv hub": "ITVX",
  prime: "Prime Video",
  "amazon prime": "Prime Video",
  "prime video": "Prime Video",
  disney: "Disney+",
  "now tv": "NOW",
  "channel 4": "Channel 4",
  my5: "My5",
  firestick: "the Fire Stick",
  "fire stick": "the Fire Stick",
  roku: "the Roku",
  "apple tv": "Apple TV",
  "smart tv": "the smart TV",
  apps: "the TV apps",
  streaming: "the TV apps",
  "catch up": "catch-up TV",
  catchup: "catch-up TV",
};

export const TRIAGES: Triage[] = [
  {
    id: "tv-apps",
    emoji: "🍿",
    tileLabel: "Netflix & TV apps",
    question: "What's happening with Netflix?",
    words: Object.keys(TV_APP_NAMES),
    options: [
      {
        emoji: "🔍",
        label: "I can't find it on the TV",
        guideId: "tv-apps-open",
      },
      {
        emoji: "⏳",
        label: "It's stuck or keeps loading",
        guideId: "tv-apps-loading",
      },
      {
        emoji: "🔑",
        label: "It wants a password or payment",
        guideId: "tv-apps-signin",
      },
      {
        emoji: "🎬",
        label: "I can't find my programme",
        guideId: "tv-find-show",
      },
      {
        emoji: "💬",
        label: "Words at the bottom of the screen",
        guideId: "subtitles",
      },
      { emoji: "🔇", label: "There's no sound", guideId: "tv-sound" },
    ],
  },
  {
    id: "tv",
    emoji: "📺",
    tileLabel: "TV problem",
    question: "What's happening with the TV?",
    words: [
      "tv",
      "telly",
      "television",
      "the box",
      "freeview",
      "sky box",
      "sky",
      "virgin box",
    ],
    options: [
      {
        emoji: "⬛",
        label: "Black screen, or it says “No Signal”",
        guideId: "tv-no-signal",
      },
      { emoji: "🔇", label: "There's no sound", guideId: "tv-sound" },
      { emoji: "🎛️", label: "The remote isn't working", guideId: "remote" },
      {
        emoji: "🍿",
        label: "I can't get to Netflix or other apps",
        guideId: "tv-apps-open",
      },
      {
        emoji: "⏳",
        label: "Netflix is stuck or loading",
        guideId: "tv-apps-loading",
      },
      {
        emoji: "💬",
        label: "Words at the bottom of the screen",
        guideId: "subtitles",
      },
    ],
  },
  {
    id: "phone",
    emoji: "📱",
    tileLabel: "Phone or tablet",
    question: "What's happening with your phone or tablet?",
    words: [
      "phone",
      "mobile",
      "iphone",
      "ipad",
      "tablet",
      "smartphone",
      "samsung",
      "android",
    ],
    options: [
      { emoji: "🧊", label: "It's frozen or stuck", guideId: "frozen" },
      { emoji: "🔋", label: "It won't charge or turn on", guideId: "charging" },
      { emoji: "🔍", label: "The writing is too small", guideId: "text-size" },
      {
        emoji: "🎥",
        label: "A video call isn't working",
        guideId: "video-call",
      },
      { emoji: "🔑", label: "I've forgotten a password", guideId: "password" },
      { emoji: "⚠️", label: "A strange message or call", guideId: "scam" },
    ],
  },
];

// Words people use when they're fed up, which don't tell us what's wrong.
const FILLER = new Set(
  (
    "the my a an it its it s is isnt isn t not no wont won t doesnt doesn t does working work works " +
    "broken broke again help please me i im i m cant can t this that what whats what s wrong up " +
    "going playing gone keeps keep thing stupid bloody flaming flipping sodding useless damn " +
    "shit shitty fucking fuckin f ing bleeding rubbish oh god come on with there on off why " +
    "how do does did ugh argh and just at all now today ever"
  ).split(" "),
);

const normalise = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

/** The app name they said, e.g. "BBC iPlayer", so we can ask about it by name. */
function appNameIn(text: string): string | null {
  const names = Object.keys(TV_APP_NAMES).sort((a, b) => b.length - a.length);
  const hit = names.find((n) => text.includes(` ${n} `));
  return hit ? TV_APP_NAMES[hit] : null;
}

/**
 * If what they said is just a device or app name (maybe with some
 * frustration around it), return the picker to show. Otherwise null.
 * `matchedGuide` says whether a specific built-in guide already fits.
 */
export function findTriage(
  problem: string,
  matchedGuide: boolean,
): Triage | null {
  const text = normalise(problem);

  // Take out every device/app name. If nothing useful is left, it's vague.
  let rest = text;
  for (const w of TRIAGES.flatMap((t) => t.words).sort(
    (a, b) => b.length - a.length,
  )) {
    rest = rest.split(` ${w} `).join(" ");
  }
  const leftover = rest
    .trim()
    .split(" ")
    .filter((w) => w.length > 1 && !FILLER.has(w));

  for (const t of TRIAGES) {
    const hit = t.words.some((w) => text.includes(` ${w} `));
    if (!hit) continue;
    // Only ask when it's vague: just a name, or nothing more specific matched.
    const vague = leftover.length === 0 || !matchedGuide;
    if (!vague) continue;
    if (t.id === "tv-apps") {
      const name = appNameIn(text) ?? "Netflix";
      return { ...t, question: `What's happening with ${name}?` };
    }
    return t;
  }
  return null;
}
