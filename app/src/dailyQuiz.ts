// "Today's brain teaser": three gentle questions a day. One tech tip, one
// "spot the scam", one word puzzle. The same three all day, new ones tomorrow,
// with stars, a day streak and badges to make learning feel rewarding.

import AsyncStorage from "@react-native-async-storage/async-storage";

export type QuizKind = "tech" | "scam" | "word";
export type QuizQuestion = {
  kind: QuizKind;
  question: string;
  options: string[];
  answer: number; // index into options
  explain: string; // shown after answering, right or wrong
};

const q = (
  kind: QuizKind,
  question: string,
  options: string[],
  answer: number,
  explain: string,
): QuizQuestion => ({
  kind,
  question,
  options,
  answer,
  explain,
});

const TECH: QuizQuestion[] = [
  q(
    "tech",
    "On most TV remotes, which button takes you to the apps, like Netflix?",
    [
      "The red power button",
      "The button with a little house",
      "The volume button",
    ],
    1,
    "The button with a little house is the Home button. It shows your apps.",
  ),
  q(
    "tech",
    "What does the little aeroplane picture at the top of a phone mean?",
    [
      "You're on a plane",
      "Aeroplane mode is on: no calls or internet",
      "The battery is full",
    ],
    1,
    "Aeroplane mode switches off calls, texts and internet. Turn it off to make calls again.",
  ),
  q(
    "tech",
    "What is Wi-Fi?",
    [
      "A type of TV channel",
      "How devices connect to the internet without wires",
      "A phone company",
    ],
    1,
    "Wi-Fi comes from your internet box (router) and connects your phone, tablet and TV.",
  ),
  q(
    "tech",
    "Your phone's writing is too small. Where do you make it bigger?",
    ["In Settings, under Display", "In the Camera app", "You can't change it"],
    0,
    "Open Settings, then Display or Display & Brightness, then Text size.",
  ),
  q(
    "tech",
    "The internet has stopped working. What's a good first thing to try?",
    [
      "Buy a new phone",
      "Turn the internet box off at the wall for a minute",
      "Ring the police",
    ],
    1,
    "Restarting the router fixes most internet problems. Give it 5 minutes to come back.",
  ),
  q(
    "tech",
    "What does the symbol of four curved lines on a card reader mean?",
    ["Wi-Fi", "You can pay contactless", "Out of order"],
    1,
    "Hold your card flat on it until it beeps to pay contactless.",
  ),
  q(
    "tech",
    "In WhatsApp, how do you send a voice message?",
    [
      "Shout at the phone",
      "Press and hold the microphone button while you talk",
      "Tap the camera",
    ],
    1,
    "Hold the microphone button, speak, then let go to send it.",
  ),
  q(
    "tech",
    "What is 'the cloud'?",
    [
      "The weather forecast",
      "Storing photos and files safely on the internet",
      "A type of printer",
    ],
    1,
    "The cloud keeps a copy of your photos online, so they're safe if you lose your phone.",
  ),
  q(
    "tech",
    "A software update pops up on your phone. Is it usually safe to let it install?",
    ["Yes, updates keep your phone safe", "No, never", "Only on Sundays"],
    0,
    "Real updates from your phone are safe and fix security problems. Let it update overnight on charge.",
  ),
  q(
    "tech",
    "What does 'streaming' mean?",
    [
      "Watching or listening over the internet straight away",
      "A leaking tap",
      "Recording a programme on video tape",
    ],
    0,
    "Netflix, BBC iPlayer and YouTube all stream programmes over the internet.",
  ),
  q(
    "tech",
    "You want to see who rang you while you were out. Where do you look?",
    ["The Phone app, then Recents", "The Camera", "Settings"],
    0,
    "Recents shows your recent calls. Missed ones are in red.",
  ),
  q(
    "tech",
    "What is a QR code?",
    [
      "A square pattern you scan with your phone camera",
      "A type of password",
      "A TV channel",
    ],
    0,
    "Point your camera at it and tap the link that appears. Only scan ones you trust.",
  ),
  q(
    "tech",
    "How do you take a screenshot on most Android phones?",
    [
      "Press power and volume down together",
      "Shake the phone",
      "Tap the screen three times",
    ],
    0,
    "Press power and volume down at the same time. The picture goes into your Photos.",
  ),
  q(
    "tech",
    "What is AI?",
    [
      "Computer software that can answer questions in everyday words",
      "A new type of TV",
      "A bank",
    ],
    0,
    "AI means artificial intelligence. It's helpful, but can make mistakes, so check important things.",
  ),
];

const SCAM: QuizQuestion[] = [
  q(
    "scam",
    "A text says: “Hi Mum, I've broken my phone, this is my new number. Can you send £200?” What should you do?",
    [
      "Send the money quickly",
      "Ring your child on their old number to check",
      "Reply asking which child it is",
    ],
    1,
    "“Hi Mum, new number” is one of the most common scams. Always check by ringing their usual number.",
  ),
  q(
    "scam",
    "Someone rings from your “bank's fraud team” asking you to move your money to a safe account. What is it?",
    ["A scam: hang up and ring 159", "A normal bank call", "A good idea"],
    0,
    "Banks never ask you to move money to a safe account. Hang up and ring 159 to reach your bank.",
  ),
  q(
    "scam",
    "A text says your Royal Mail parcel needs a £1.99 fee, with a link. What should you do?",
    [
      "Pay it, it's only £1.99",
      "Don't tap the link. Forward it to 7726",
      "Ring the number in the text",
    ],
    1,
    "Fake parcel fees are very common. Forward scam texts to 7726 for free.",
  ),
  q(
    "scam",
    "A pop-up says your computer has a virus and to ring Microsoft on a number. Is it real?",
    ["Yes, ring them", "No, it's a scam. Close it", "Only if it's in red"],
    1,
    "Microsoft never puts phone numbers in pop-ups. Close the page or switch the computer off.",
  ),
  q(
    "scam",
    "Someone on the phone asks you to read out the code your bank just texted you. Should you?",
    [
      "Yes, they're from the bank",
      "Never share codes with anyone",
      "Only the first half",
    ],
    1,
    "Codes are only for you to type in yourself. Anyone asking for one is a scammer.",
  ),
  q(
    "scam",
    "An email says you've won £5,000 in a lottery you never entered. What is it?",
    ["Lucky you!", "A scam", "A tax refund"],
    1,
    "You can't win a lottery you didn't enter. Delete it.",
  ),
  q(
    "scam",
    "A caller says you owe HMRC tax and must pay today with gift cards. What is it?",
    [
      "A scam: no one official takes gift cards",
      "Normal for HMRC",
      "Pay to be safe",
    ],
    0,
    "No government body ever asks to be paid in gift cards. Hang up.",
  ),
  q(
    "scam",
    "Your GP surgery texts a reminder about your appointment on Tuesday. Is this likely a scam?",
    [
      "Probably not. It isn't asking for money or details",
      "Definitely a scam",
      "Reply with your bank details",
    ],
    0,
    "A simple reminder with no links or requests is usually genuine. If unsure, ring the surgery.",
  ),
  q(
    "scam",
    "Which number can you ring to reach your bank safely?",
    ["999", "159", "101"],
    1,
    "159 connects you to your bank's fraud team safely. Ring it from a phone you trust.",
  ),
  q(
    "scam",
    "Netflix emails saying your account is suspended and to update your card with a link. What should you do?",
    [
      "Tap the link and update",
      "Don't tap it. Open Netflix the usual way to check",
      "Forward your card details",
    ],
    1,
    "Fake Netflix emails are common. Check by opening the Netflix app yourself, not through a link.",
  ),
];

const WORD: QuizQuestion[] = [
  q(
    "word",
    "Unscramble this word: L L E T Y",
    ["TELLY", "YELLT", "LYTLE"],
    0,
    "TELLY! Well done.",
  ),
  q(
    "word",
    "Unscramble this word: T E N R E N I T",
    ["INTERNET", "INTENTER", "TINNERET"],
    0,
    "INTERNET!",
  ),
  q(
    "word",
    "Which is the odd one out?",
    ["Netflix", "BBC iPlayer", "Kettle", "YouTube"],
    2,
    "The kettle! The others are all ways to watch TV over the internet.",
  ),
  q(
    "word",
    "Which is the odd one out?",
    ["Email", "WhatsApp", "Text message", "Toaster"],
    3,
    "The toaster! The others are all ways to send messages.",
  ),
  q(
    "word",
    "Finish the saying: “An apple a day…”",
    ["…keeps the doctor away", "…makes a pie", "…is plenty"],
    0,
    "“An apple a day keeps the doctor away.”",
  ),
  q(
    "word",
    "Unscramble this word: E P H O N",
    ["PHONE", "HOPEN", "NOPEH"],
    0,
    "PHONE!",
  ),
  q(
    "word",
    "What comes next? 2, 4, 6, 8, …",
    ["9", "10", "12"],
    1,
    "10. It goes up by 2 each time.",
  ),
  q(
    "word",
    "Which word means the same as “happy”?",
    ["Cheerful", "Gloomy", "Tired"],
    0,
    "Cheerful!",
  ),
  q(
    "word",
    "Finish the saying: “Every cloud has a…”",
    ["…silver lining", "…rainbow", "…puddle"],
    0,
    "“Every cloud has a silver lining.”",
  ),
  q(
    "word",
    "Unscramble this word: T B L E T A",
    ["TABLET", "BOTTLE", "TALENT"],
    0,
    "TABLET!",
  ),
  q(
    "word",
    "Which is the odd one out?",
    ["Robin", "Sparrow", "Blackbird", "Salmon"],
    3,
    "The salmon! It's a fish. The others are garden birds.",
  ),
  q(
    "word",
    "What comes next? 5, 10, 15, 20, …",
    ["21", "25", "30"],
    1,
    "25. It goes up by 5 each time.",
  ),
  q(
    "word",
    "Which of these is a type of flower?",
    ["Daffodil", "Dandruff", "Doughnut"],
    0,
    "The daffodil!",
  ),
  q(
    "word",
    "Unscramble this word: D A R O I",
    ["RADIO", "DIARO", "ROADI"],
    0,
    "RADIO!",
  ),
];

// A day number that is the same all day, wherever you are.
export function todayKey(d = new Date()): string {
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dayNumber(key: string): number {
  return Math.floor(
    Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) /
      86_400_000,
  );
}

export function questionsFor(key = todayKey()): QuizQuestion[] {
  const n = dayNumber(key);
  return [TECH[n % TECH.length], SCAM[(n + 3) % SCAM.length], WORD[(n + 7) % WORD.length]];
}

/* ---------- Progress: stars, streak and badges ---------- */

export type QuizProgress = {
  lastPlayed: string | null; // day key of the last finished teaser
  streak: number; // days in a row
  bestStreak: number;
  stars: number; // one per right answer, ever
  scamRight: number;
  techRight: number;
  daysPlayed: number;
};

const KEY = "ask-mavis/quiz-progress";
const EMPTY: QuizProgress = {
  lastPlayed: null,
  streak: 0,
  bestStreak: 0,
  stars: 0,
  scamRight: 0,
  techRight: 0,
  daysPlayed: 0,
};

export async function loadProgress(): Promise<QuizProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw
      ? { ...EMPTY, ...(JSON.parse(raw) as Partial<QuizProgress>) }
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Record today's finished teaser. Returns the new progress. */
export async function recordDay(
  results: { kind: QuizKind; right: boolean }[],
  key = todayKey(),
): Promise<QuizProgress> {
  const p = await loadProgress();
  if (p.lastPlayed === key) return p; // already counted today
  const yesterday =
    p.lastPlayed !== null && dayNumber(key) - dayNumber(p.lastPlayed) === 1;
  const streak = yesterday ? p.streak + 1 : 1;
  const next: QuizProgress = {
    lastPlayed: key,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    stars: p.stars + results.filter((r) => r.right).length,
    scamRight:
      p.scamRight + results.filter((r) => r.right && r.kind === "scam").length,
    techRight:
      p.techRight + results.filter((r) => r.right && r.kind === "tech").length,
    daysPlayed: p.daysPlayed + 1,
  };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  earned: boolean;
  how: string;
};

export function badgesFor(p: QuizProgress): Badge[] {
  return [
    {
      id: "first",
      emoji: "🌱",
      name: "First go",
      earned: p.daysPlayed >= 1,
      how: "Finish your first brain teaser",
    },
    {
      id: "streak3",
      emoji: "🔥",
      name: "Three days running",
      earned: p.bestStreak >= 3,
      how: "Play 3 days in a row",
    },
    {
      id: "scam5",
      emoji: "🛡️",
      name: "Scam Spotter",
      earned: p.scamRight >= 5,
      how: "Spot 5 scams correctly",
    },
    {
      id: "tech5",
      emoji: "💡",
      name: "Tech Whizz",
      earned: p.techRight >= 5,
      how: "Get 5 tech questions right",
    },
    {
      id: "streak7",
      emoji: "🏆",
      name: "Full week",
      earned: p.bestStreak >= 7,
      how: "Play 7 days in a row",
    },
    {
      id: "stars25",
      emoji: "⭐",
      name: "Star collector",
      earned: p.stars >= 25,
      how: "Collect 25 stars",
    },
  ];
}
