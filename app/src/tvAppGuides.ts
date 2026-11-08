// Guides for Netflix and other TV apps (BBC iPlayer, ITVX, YouTube, Prime Video...).
// These are reached through the "What's happening?" picker, so they are not
// shown as their own picture buttons on the home screen.

import type { OfflineGuide } from "./offlineGuides";

const step = (instruction: string, lookFor = "") => ({ instruction, lookFor });

const TV_WORDS = [
  "netflix",
  "iplayer",
  "youtube",
  "itvx",
  "prime",
  "disney",
  "tv",
  "telly",
  "television",
];

const OTHER_APPS =
  "The same steps work for BBC iPlayer, ITVX, YouTube and the others. Just look for their picture instead.";

export const TV_APP_GUIDES: OfflineGuide[] = [
  {
    id: "tv-apps-open",
    hidden: true,
    boost: TV_WORDS,
    emoji: "🍿",
    shortLabel: "Get to Netflix",
    keywords: [
      "find netflix",
      "get to netflix",
      "open netflix",
      "where is netflix",
      "can t find netflix",
      "get netflix on",
      "apps",
      "iplayer",
      "youtube",
      "itvx",
      "prime video",
      "disney",
    ],
    understood: true,
    title: "Getting to Netflix on the TV",
    reassurance: `Lots of people get lost finding Netflix. It's hiding behind a button or two. ${OTHER_APPS}`,
    device: "TV",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Turn the TV on with the red power button on the remote.",
        "A picture comes on the screen.",
      ),
      step(
        "Look on the remote for a button with the word NETFLIX on it, in red letters. If there is one, press it.",
        "Netflix opens. If it does, you can stop here. Well done!",
      ),
      step(
        "No Netflix button? Find the button with a little house on it. It's called the Home button. Press it once.",
        "A row of small pictures appears on the screen. These are the apps.",
      ),
      step(
        "Find the ring of arrow buttons in the middle of the remote. Press the arrows to move along the row of pictures.",
        "A box or outline moves from picture to picture as you press.",
      ),
      step(
        "Stop when the box is on the red picture with a big letter N. That's Netflix.",
        "",
      ),
      step(
        "Press the button in the middle of the arrows. It often says OK.",
        "Netflix opens. It can take a few seconds.",
      ),
      step(
        "If it asks “Who's watching?”, use the arrows to move to your name or picture, then press OK.",
        "Your programmes appear.",
      ),
    ],
    whenToGetHelp:
      "If you can't see Netflix anywhere, it may not be set up on this TV. Ask the family member who set up the TV.",
  },
  {
    id: "tv-apps-loading",
    hidden: true,
    boost: TV_WORDS,
    emoji: "⏳",
    shortLabel: "Netflix stuck",
    keywords: [
      "loading",
      "spinning",
      "stuck",
      "buffering",
      "keeps loading",
      "error",
      "won t load",
      "won t play",
      "not loading",
      "circle",
    ],
    understood: true,
    title: "Netflix is stuck or keeps loading",
    reassurance:
      "A spinning circle or an error message is very common. It's almost never anything you did. A restart usually fixes it.",
    device: "TV",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Press the Back button on the remote once or twice. It often has a curved arrow on it.",
        "You go back to the Netflix menu or the TV.",
      ),
      step(
        "Wait for one minute, then try your programme again.",
        "It plays. If it does, you can stop here.",
      ),
      step(
        "Still stuck? Turn the TV off at the wall socket.",
        "The screen and the little light on the TV go off.",
      ),
      step(
        "Count slowly to 30. Then turn it back on at the wall, and press the red power button on the remote.",
        "The TV comes on. Give it a minute to start properly.",
      ),
      step(
        "Open Netflix again. Press the NETFLIX button on the remote, or the Home button with the little house, then the red N.",
        "Netflix opens and your programme plays.",
      ),
      step(
        "If it still won't play, look at your phone or tablet. If the internet isn't working there either, the problem is your internet, not the TV.",
        "",
      ),
    ],
    whenToGetHelp:
      "If the internet is down, turn the internet box (router) off at the wall for a minute, then on again. The “Internet / Wi-Fi” guide in this app shows how.",
  },
  {
    id: "tv-apps-signin",
    hidden: true,
    boost: TV_WORDS,
    emoji: "🔑",
    shortLabel: "Password or payment",
    keywords: [
      "password",
      "sign in",
      "log in",
      "login",
      "signed out",
      "payment",
      "account",
      "suspended",
      "subscription",
      "email from netflix",
      "text from netflix",
    ],
    understood: true,
    title: "Netflix wants a password or says there's a payment problem",
    reassurance:
      "Don't worry. Your programmes aren't lost. This happens when an app signs you out, or a payment needs checking.",
    device: "TV",
    clarifyingQuestion: "",
    safetyWarning:
      "Netflix will never text or email you asking for your card details. If you got a message like that, don't press any links. It's a scam.",
    steps: [
      step(
        "If the TV is asking for an email and password, look for where they're written down. Whoever set it up may have put them in your address book or on a note by the TV.",
        "",
      ),
      step(
        "To type on the TV, use the arrow buttons to move to each letter on the screen, and press OK for each one. It's slow, and that's normal.",
        "The letters appear in the box one by one.",
      ),
      step(
        "When you've typed it all, move to “Sign in” or “Next” and press OK.",
        "Netflix opens.",
      ),
      step(
        "If it says there's a payment problem, don't type any card details. Ask the person who pays for Netflix to check it for you.",
        "",
      ),
      step(
        "If a text or email says your Netflix is stopped or suspended, don't press anything in it. Just delete it.",
        "",
      ),
    ],
    whenToGetHelp:
      "The person who set up Netflix can sign you back in, often in a couple of minutes.",
  },
  {
    id: "tv-find-show",
    hidden: true,
    boost: TV_WORDS,
    emoji: "🎬",
    shortLabel: "Find a programme",
    keywords: [
      "find a programme",
      "find my programme",
      "find a film",
      "find a show",
      "search",
      "where is my programme",
      "what was i watching",
      "carry on watching",
      "continue watching",
    ],
    understood: true,
    title: "Finding a programme to watch",
    reassurance: `Finding things on Netflix confuses everybody. The search is the easiest way. ${OTHER_APPS}`,
    device: "TV",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step("Open Netflix.", "Rows of programme pictures."),
      step(
        "Something you were already watching? Press the down arrow until you see a row called “Continue Watching”.",
        "The programme you were watching is in that row. If it is, move to it and press OK.",
      ),
      step(
        "To search: press the left arrow a few times until a menu opens down the left side.",
        "A list down the left, with a magnifying glass at the top.",
      ),
      step(
        "Move up to the magnifying glass and press OK.",
        "Letters appear on the screen, like a keyboard.",
      ),
      step(
        "Use the arrows and OK to type just the first few letters of the programme's name.",
        "Pictures of programmes appear as you type.",
      ),
      step(
        "Move to the right onto the pictures, find your programme, and press OK. Then press OK on “Play”.",
        "Your programme starts.",
      ),
    ],
    whenToGetHelp:
      "If you can't find it, it may have left Netflix, or be on a different app like BBC iPlayer.",
  },
  {
    id: "subtitles",
    hidden: true,
    boost: TV_WORDS,
    emoji: "💬",
    shortLabel: "Words on the screen",
    keywords: [
      "subtitles",
      "subtitle",
      "words at the bottom",
      "writing at the bottom",
      "words on the screen",
      "captions",
      "text on the screen",
    ],
    understood: true,
    title: "Words at the bottom of the screen (subtitles)",
    reassurance:
      "Those words are called subtitles. They are easy to switch on or off, and lots of people like having them on.",
    device: "TV",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "While the programme is playing, press the down arrow or OK on the remote once.",
        "A bar of buttons appears at the bottom of the screen.",
      ),
      step(
        "Use the arrows to move to the picture of a speech bubble, or the words “Audio & Subtitles”. Press OK.",
        "A list of languages appears.",
      ),
      step(
        "Under Subtitles, choose “Off” to remove the words, or “English” to show them. Press OK.",
        "",
      ),
      step(
        "Press the Back button (the curved arrow) to go back to your programme.",
        "Your programme carries on, with or without the words.",
      ),
      step(
        "On normal TV channels (not Netflix), look for a button on the remote marked SUB, ST or SUBTITLE, and press it once.",
        "The words turn on or off.",
      ),
    ],
    whenToGetHelp:
      "If you can't find the button, a family member can switch them on or off for you in a minute.",
  },
];
