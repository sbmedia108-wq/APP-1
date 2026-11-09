// "What is…?" explanations for everyday tech words, in plain English.
// Used offline, and as instant answers before asking the online helper.

export type Explanation = {
  id: string;
  term: string;
  emoji: string;
  /** One or two short sentences: what it is. */
  short: string;
  /** A little more: what people use it for. */
  more: string;
  /** Optional safety tip. */
  tip?: string;
  aliases: string[];
};

const e = (
  id: string,
  term: string,
  emoji: string,
  short: string,
  more: string,
  aliases: string[],
  tip?: string,
): Explanation => ({
  id,
  term,
  emoji,
  short,
  more,
  aliases: [term.toLowerCase(), ...aliases],
  tip,
});

export const GLOSSARY: Explanation[] = [
  e(
    "ai",
    "AI",
    "🤖",
    "AI stands for “artificial intelligence”. It's computer software that can understand questions in everyday words and answer them, a bit like a very well-read helper.",
    "People use AI to answer questions, write letters, or explain things. Ask Mavis uses AI to help with tech problems. AI can make mistakes, so it's worth double-checking anything important.",
    ["artificial intelligence", "a i", "chatbot", "chat bot"],
    "AI isn't a person, and it can be wrong. Never give it bank details or passwords.",
  ),
  e(
    "chatgpt",
    "ChatGPT",
    "💬",
    "ChatGPT is a popular AI helper on phones and computers. You type or say a question, and it writes back an answer.",
    "People use it to explain things, plan trips or help write messages. It's one of several AI helpers, like Claude, Gemini and Copilot.",
    ["chat gpt", "claude", "gemini", "copilot"],
    "It can sound confident and still be wrong, so check important things elsewhere.",
  ),
  e(
    "netflix",
    "Netflix",
    "🍿",
    "Netflix is a paid service for watching films and TV series whenever you like, on your TV, tablet or phone.",
    "There are no adverts on most plans, and you can pause and carry on later. You pay a monthly fee, and you need the internet to watch.",
    ["netflicks"],
    "Netflix never texts or emails asking for card details. Messages like that are scams.",
  ),
  e(
    "streaming",
    "Streaming",
    "📺",
    "Streaming means watching or listening to something over the internet straight away, without needing a disc or a recording.",
    "Netflix, BBC iPlayer, YouTube and Spotify are all streaming services. You need a good internet connection.",
    ["stream", "streaming service"],
  ),
  e(
    "iplayer",
    "BBC iPlayer",
    "📺",
    "BBC iPlayer lets you watch BBC programmes whenever you like, including ones you missed, over the internet.",
    "It's free with a TV licence. You'll find it on most smart TVs, phones and tablets.",
    ["iplayer", "i player", "catch up", "catch-up tv"],
  ),
  e(
    "youtube",
    "YouTube",
    "▶️",
    "YouTube is a free website and app full of videos made by people all over the world.",
    "You can find almost anything: old TV clips, music, cooking, how-to videos and more. It's free, but has adverts.",
    ["you tube"],
  ),
  e(
    "internet",
    "The internet",
    "🌐",
    "The internet links computers, phones and TVs all around the world, so they can share information.",
    "It's what lets you send emails, video call family, watch Netflix and look things up.",
    ["internet", "the web", "online", "world wide web"],
  ),
  e(
    "wifi",
    "Wi-Fi",
    "📶",
    "Wi-Fi is how your phone, tablet and TV connect to the internet at home without any wires.",
    "It comes from your internet box (the router). Each Wi-Fi network has a name and a password, usually on a sticker on the box.",
    ["wi fi", "wifi", "wireless", "wi-fi"],
  ),
  e(
    "router",
    "Router (internet box)",
    "📦",
    "The router is the small box with lights that brings the internet into your home and sends out the Wi-Fi.",
    "If the internet stops working, turning the router off at the wall for a minute often fixes it.",
    ["router", "hub", "internet box", "broadband box"],
  ),
  e(
    "broadband",
    "Broadband",
    "🔌",
    "Broadband is your home internet connection, which usually comes in through the phone line or a cable.",
    "You pay a company like BT, Sky or Virgin Media for it each month.",
    ["fibre", "fiber"],
  ),
  e(
    "mobile-data",
    "Mobile data",
    "📱",
    "Mobile data lets your phone use the internet when you're out and about, away from Wi-Fi.",
    "It comes from your phone company. Your plan includes a certain amount each month.",
    ["data", "4g", "5g", "3g"],
  ),
  e(
    "app",
    "An app",
    "🔲",
    "An app is a small program on your phone or tablet. Each little picture on your screen is an app.",
    "There are apps for nearly everything: WhatsApp for messages, BBC iPlayer for TV, your bank's app and so on.",
    ["apps", "application"],
  ),
  e(
    "smartphone",
    "A smartphone",
    "📱",
    "A smartphone is a mobile phone with a touch screen that can also use the internet, take photos and run apps.",
    "iPhones and Samsung Galaxy phones are smartphones.",
    ["smart phone", "iphone", "android"],
  ),
  e(
    "tablet",
    "A tablet",
    "📲",
    "A tablet is like a big smartphone without the phone calls: a flat touch screen you hold in your hands.",
    "The bigger screen makes it easier to read, watch TV and video call. The iPad is a well-known tablet.",
    ["ipad"],
  ),
  e(
    "email",
    "Email",
    "✉️",
    "Email is a way of sending letters over the internet. They arrive in seconds, and it's free.",
    "Every email address has an @ in it, like name@example.com.",
    ["e-mail", "e mail", "emails"],
    "Be careful with emails asking you to click a link or give details. These are often scams.",
  ),
  e(
    "whatsapp",
    "WhatsApp",
    "💬",
    "WhatsApp is a free app for sending messages, photos and voice notes, and making video calls, over the internet.",
    "Lots of families use it to keep in touch, often in a family group.",
    ["whats app"],
  ),
  e(
    "facebook",
    "Facebook",
    "👍",
    "Facebook is a website and app where people share news, photos and messages with friends and family.",
    "It's free. You can join local groups and see what family are up to.",
    ["fb"],
    "Only accept friend requests from people you know.",
  ),
  e(
    "video-call",
    "A video call",
    "🎥",
    "A video call is a phone call where you can see each other on the screen, using the internet.",
    "WhatsApp, FaceTime and Zoom all do video calls, and they're usually free.",
    ["video calling", "facetime", "zoom", "skype", "teams"],
  ),
  e(
    "google",
    "Google",
    "🔎",
    "Google is a website for looking things up. You type a question, and it finds web pages with answers.",
    "“Googling” something just means looking it up online.",
    ["googling", "search engine", "search"],
  ),
  e(
    "browser",
    "A web browser",
    "🧭",
    "A web browser is the app you use to look at websites, like Chrome, Safari or Edge.",
    "You type a website's address or a question at the top.",
    ["browser", "chrome", "safari", "edge"],
  ),
  e(
    "website",
    "A website",
    "🖥️",
    "A website is a set of pages on the internet, like a shop, a newspaper or the NHS.",
    "Each website has an address, like www.bbc.co.uk.",
    ["web site", "web page", "webpage"],
  ),
  e(
    "link",
    "A link",
    "🔗",
    "A link is a word or picture you tap to go to another page on the internet. Links are often blue or underlined.",
    "They're handy, but links in unexpected messages can lead to fake websites.",
    ["links", "hyperlink"],
    "Don't tap links in messages you weren't expecting.",
  ),
  e(
    "download",
    "Downloading",
    "⬇️",
    "Downloading means copying something from the internet onto your phone or computer, like an app or a photo.",
    "Uploading is the opposite: sending something from your phone to the internet.",
    ["download", "upload", "uploading"],
  ),
  e(
    "update",
    "An update",
    "🔄",
    "An update is a free improvement for your phone or apps that fixes problems and keeps them safe.",
    "It's a good idea to let updates happen, often overnight while the phone charges.",
    ["updates", "software update"],
  ),
  e(
    "the-cloud",
    "The cloud",
    "☁️",
    "“The cloud” just means storing your photos and files on the internet instead of only on your phone.",
    "It means your photos are safe even if you lose your phone. iCloud and Google Photos are examples.",
    ["cloud", "icloud", "google photos"],
  ),
  e(
    "password",
    "A password",
    "🔑",
    "A password is a secret word or phrase you use to prove it's really you when you sign in.",
    "It's best to use different passwords for important things, and keep them somewhere safe at home.",
    ["passwords"],
    "Never tell anyone your password, even if they say they're from your bank.",
  ),
  e(
    "pin",
    "A PIN",
    "🔢",
    "A PIN is a short secret number, usually 4 digits, used for your bank card or to unlock your phone.",
    "Cover the keypad when you type it in a shop or cash machine.",
    ["pin number"],
    "Your bank will never ask for your PIN.",
  ),
  e(
    "code",
    "A code by text",
    "🔢",
    "Some websites text you a code, often 6 numbers, to check it's really you signing in.",
    "You type it into the website you're using. It only works for a few minutes.",
    [
      "verification code",
      "security code",
      "two factor",
      "2fa",
      "one time code",
    ],
    "Never read a code out to anyone who rings or messages you.",
  ),
  e(
    "scam",
    "A scam",
    "⚠️",
    "A scam is a trick by criminals to get your money or details, often by pretending to be your bank, a delivery company or family.",
    "They often rush you or ask for codes, card details or gift cards. Ask Mavis has a scam checker on the home screen.",
    ["scams", "phishing", "fraud", "scammer"],
    "If you're unsure, hang up and ring 159 to reach your bank safely.",
  ),
  e(
    "virus",
    "A computer virus",
    "🦠",
    "A computer virus is harmful software that can damage a computer or steal information.",
    "Keeping your phone and computer updated helps keep them safe.",
    ["malware", "viruses"],
    "Pop-ups saying “your computer has a virus, ring this number” are scams.",
  ),
  e(
    "bluetooth",
    "Bluetooth",
    "🎧",
    "Bluetooth lets gadgets connect to each other without wires over a short distance.",
    "It's how wireless headphones, hearing aids and car stereos connect to your phone.",
    ["blue tooth"],
  ),
  e(
    "qr-code",
    "A QR code",
    "🔳",
    "A QR code is a black-and-white square pattern. Point your phone's camera at it to open a web page.",
    "Restaurants use them for menus, and car parks for payments.",
    ["qr", "q r code"],
    "Be careful with QR code stickers on parking machines. Some are fake.",
  ),
  e(
    "contactless",
    "Contactless",
    "💳",
    "Contactless means paying by holding your bank card or phone near the card reader, instead of putting it in.",
    "Look for the symbol of four curved lines. It's quick, and has a limit for each payment.",
    ["tap to pay", "apple pay", "google pay"],
  ),
  e(
    "online-banking",
    "Online banking",
    "🏦",
    "Online banking means checking and managing your bank account on a phone or computer instead of in a branch.",
    "You can check your balance and pay bills any time.",
    ["banking app", "mobile banking", "internet banking"],
    "Your bank will never ask you to move money to a “safe account”.",
  ),
  e(
    "smart-speaker",
    "A smart speaker",
    "🔊",
    "A smart speaker, like an Amazon Echo (Alexa) or Google Nest, is a speaker you talk to.",
    "You can ask it for the weather, music, the radio, or reminders.",
    ["alexa", "echo", "google home", "nest"],
  ),
  e(
    "smart-tv",
    "A smart TV",
    "📺",
    "A smart TV is a TV that connects to the internet, so it has apps like Netflix, BBC iPlayer and YouTube built in.",
    "It still shows normal channels too.",
    ["smart tv", "smart telly"],
  ),
  e(
    "fire-stick",
    "A Fire Stick",
    "🔥",
    "A Fire Stick is a small gadget from Amazon that plugs into the back of your TV and adds Netflix, iPlayer and other apps.",
    "Roku and Google TV sticks do the same job.",
    ["firestick", "fire tv", "roku"],
  ),
  e(
    "selfie",
    "A selfie",
    "🤳",
    "A selfie is a photo you take of yourself, usually with the front camera on your phone.",
    "Tap the little button with arrows going round to switch to the front camera.",
    ["selfies"],
  ),
  e(
    "screenshot",
    "A screenshot",
    "📸",
    "A screenshot is a picture of whatever is on your screen at that moment.",
    "On most phones, press the power button and volume down button together.",
    ["screen shot", "screen grab"],
  ),
  e(
    "emoji",
    "Emoji",
    "😊",
    "Emoji are the little pictures, like smiley faces and hearts, that people add to messages.",
    "There's an emoji button on your phone's keyboard, often a smiley face.",
    ["emojis", "emoticon", "smiley"],
  ),
  e(
    "podcast",
    "A podcast",
    "🎙️",
    "A podcast is like a radio programme you can listen to whenever you like, on your phone.",
    "There are podcasts on almost every subject, and most are free.",
    ["podcasts"],
  ),
  e(
    "instagram",
    "Instagram",
    "📷",
    "Instagram is an app for sharing photos and short videos with friends, family and followers.",
    "Many younger family members use it.",
    ["insta"],
  ),
  e(
    "tiktok",
    "TikTok",
    "🎵",
    "TikTok is an app full of very short videos, often funny or musical, that people swipe through.",
    "It's especially popular with younger people.",
    ["tik tok"],
  ),
  e(
    "spam",
    "Spam",
    "🗑️",
    "Spam means unwanted messages, like junk mail, sent to lots of people at once.",
    "Spam texts can be forwarded to 7726 for free, to help stop them.",
    ["junk mail", "junk"],
  ),
  e(
    "aeroplane-mode",
    "Aeroplane mode",
    "✈️",
    "Aeroplane mode switches off your phone's calls, texts and internet in one go. You'll see a little aeroplane at the top.",
    "If your phone suddenly can't make calls, check it isn't switched on.",
    ["airplane mode", "flight mode"],
  ),
  e(
    "cookies",
    "Cookies (on websites)",
    "🍪",
    "Cookies are small notes a website saves on your device to remember you, like what's in your shopping basket.",
    "When a website asks, it's fine to tap “Reject” or “Accept necessary only”.",
    ["cookie"],
  ),
  e(
    "amazon",
    "Amazon",
    "📦",
    "Amazon is a huge online shop. You order things on the website or app, and they're delivered to your door.",
    "Amazon also makes Alexa speakers, Fire Sticks and Prime Video.",
    ["prime", "amazon prime"],
    "Amazon will never ring you about a problem with your account. Calls like that are scams.",
  ),
  e(
    "nhs-app",
    "The NHS App",
    "🩺",
    "The NHS App lets you book GP appointments, order repeat prescriptions and see your health records on your phone.",
    "It's free and made by the NHS. You can still phone or visit your surgery instead.",
    ["nhs app"],
  ),
  e(
    "usb-c",
    "A USB-C charger",
    "🔌",
    "USB-C is the small, oval-shaped charging plug that most new phones and tablets use. It goes in either way up.",
    "Older phones may use a different plug, so check before buying a charger.",
    ["usb c", "usb", "charger", "lightning"],
  ),
];

const normalise = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

/** Is this a "what is…?" style question rather than a problem to fix? */
export function isWhatIsQuestion(text: string): boolean {
  const t = normalise(text);
  // "What's wrong with my telly?" is a problem to fix, not a word to explain.
  if (
    / (wrong|happening|happened|broken|not working|isn't working|isnt working|won't|wont|do i do|should i|can i|going on|up with) /.test(
      t,
    )
  )
    return false;
  return (
    /^ (what is|what's|whats|what are|what does|what do|what on earth is|what the heck is|explain|tell me about|who is|how does|how do i explain|what is meant by|whats a|what's an|what's the|what is the|what is an|what is a) /.test(
      t,
    ) || / (mean|means) $/.test(t.replace(/\?/g, ""))
  );
}

/** Find a built-in explanation that matches the question, if there is one. */
export function findExplanation(question: string): Explanation | null {
  const t = normalise(question);
  let best: Explanation | null = null;
  let bestLen = 0;
  for (const item of GLOSSARY) {
    for (const a of item.aliases) {
      const n = normalise(a);
      if (t.includes(n) && n.length > bestLen) {
        best = item;
        bestLen = n.length;
      }
    }
  }
  return best;
}

export const POPULAR_QUESTIONS = [
  "ai",
  "wifi",
  "the-cloud",
  "netflix",
  "whatsapp",
  "qr-code",
  "streaming",
  "scam",
];
