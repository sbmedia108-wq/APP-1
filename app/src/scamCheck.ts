// "Is this a scam?" checker.
//
// Offline: spots the warning signs that UK scams almost always have
// (codes, "safe accounts", gift cards, urgency, links, "Hi Mum, new number").
// It never says a message is definitely safe: the best it can say is that it
// can't see the usual signs. The online helper can give a fuller answer.

export type ScamLevel = "high" | "medium" | "low";

export type ScamResult = {
  level: ScamLevel;
  headline: string;
  reasons: string[];
  whatToDo: string[];
};

type Sign = { level: "high" | "medium"; words: string[]; reason: string };

const SIGNS: Sign[] = [
  {
    level: "high",
    words: [
      "code",
      "pin",
      "password",
      "passcode",
      "one time",
      "verification",
      "otp",
      "security number",
    ],
    reason:
      "It asks for a code, PIN or password. Real banks and companies never ask for these.",
  },
  {
    level: "high",
    words: [
      "safe account",
      "move your money",
      "move my money",
      "transfer your money",
      "protect your money",
    ],
    reason:
      "It talks about moving money to a “safe account”. This is always a scam.",
  },
  {
    level: "high",
    words: [
      "gift card",
      "voucher",
      "itunes",
      "google play card",
      "amazon card",
      "steam card",
      "bitcoin",
      "crypto",
      "cryptocurrency",
    ],
    reason:
      "It asks for gift cards or crypto. No real company or official asks to be paid this way.",
  },
  {
    level: "high",
    words: [
      "hi mum",
      "hi mom",
      "hi dad",
      "hello mum",
      "hello dad",
      "new number",
      "lost my phone",
      "broke my phone",
      "phone broke",
      "my old phone",
    ],
    reason:
      "It's a “new number” message from family. This is one of the most common scams. Ring them on their old number to check.",
  },
  {
    level: "high",
    words: [
      "remote access",
      "anydesk",
      "teamviewer",
      "virus on your computer",
      "computer has a virus",
      "microsoft",
      "your computer is infected",
      "windows support",
    ],
    reason:
      "It wants to get into your computer, or says it has a virus. Microsoft never rings or messages people about this.",
  },
  {
    level: "high",
    words: [
      "you have won",
      "you've won",
      "you won",
      "prize",
      "lottery",
      "inheritance",
      "claim your reward",
    ],
    reason:
      "It says you've won something you didn't enter. That's a classic scam.",
  },
  {
    level: "high",
    words: [
      "card number",
      "card details",
      "sort code",
      "account number",
      "long number on your card",
      "three digits on the back",
      "bank details",
    ],
    reason:
      "It asks for card or bank details. Never give these to someone who contacted you.",
  },
  {
    level: "medium",
    words: [
      "urgent",
      "immediately",
      "within 24 hours",
      "within 48 hours",
      "today only",
      "final notice",
      "act now",
      "suspended",
      "locked",
      "will be closed",
      "last chance",
      "arrest",
      "police will",
    ],
    reason:
      "It's trying to rush or frighten you. Scammers do this so you don't stop to think.",
  },
  {
    level: "medium",
    words: ["click", "tap the link", "link", "http", "www.", ".com", "bit.ly"],
    reason:
      "It wants you to tap a link. Links in unexpected messages often lead to fake websites.",
  },
  {
    level: "medium",
    words: [
      "parcel",
      "delivery",
      "royal mail",
      "evri",
      "dpd",
      "redelivery",
      "missed delivery",
      "customs fee",
      "delivery fee",
    ],
    reason:
      "It's about a parcel or delivery fee. Fake delivery messages are very common.",
  },
  {
    level: "medium",
    words: [
      "hmrc",
      "tax refund",
      "tax rebate",
      "council tax",
      "energy rebate",
      "tv licence",
      "dvla",
      "fine",
      "penalty",
    ],
    reason:
      "It claims to be from HMRC, the council or another official body. These are often faked.",
  },
  {
    level: "medium",
    words: [
      "your bank",
      "fraud team",
      "fraud department",
      "barclays",
      "lloyds",
      "natwest",
      "halifax",
      "santander",
      "hsbc",
      "nationwide",
    ],
    reason:
      "It claims to be your bank. Banks do contact people, but scammers pretend to be banks all the time.",
  },
];

const normalise = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9.' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

const TO_DO_ALWAYS = [
  "Don't tap any links or ring any numbers in the message.",
  "Never share codes, PINs, passwords or card details.",
  "To check with your bank safely, hang up and ring 159 from a phone you trust. It connects you to your bank.",
  "Forward scam text messages to 7726. It's free, and helps stop them.",
];

const TO_DO_IF_PAID =
  "If you've already paid or shared any details, ring your bank on 159 straight away. It's not your fault, and they can often help.";

export function checkScamOffline(text: string): ScamResult {
  const t = normalise(text);
  // Match whole words or word starts ("link" matches "links"), never the middle of a word.
  const has = (w: string) =>
    w.startsWith(".") ? t.includes(w) : t.includes(` ${w}`);
  const found = SIGNS.filter((s) => s.words.some(has));
  const reasons = found.map((s) => s.reason);
  const high = found.some((s) => s.level === "high");

  if (high || found.length >= 2) {
    return {
      level: "high",
      headline: "This looks like a scam",
      reasons,
      whatToDo: ["Don't reply.", ...TO_DO_ALWAYS, TO_DO_IF_PAID],
    };
  }
  if (found.length === 1) {
    return {
      level: "medium",
      headline: "Be careful: this has warning signs",
      reasons,
      whatToDo: [...TO_DO_ALWAYS, TO_DO_IF_PAID],
    };
  }
  return {
    level: "low",
    headline: "I can't see the usual warning signs",
    reasons: [
      "That doesn't mean it's definitely safe. Scams change all the time.",
      "If it's from someone you know, check with them another way, like ringing their usual number.",
    ],
    whatToDo: TO_DO_ALWAYS,
  };
}
