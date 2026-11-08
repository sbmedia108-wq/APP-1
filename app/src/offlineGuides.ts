// Built-in guides for the most common problems.
// Used when there is no internet, the helper server isn't set up yet,
// or the person taps one of the picture buttons on the home screen.

import type { Guide } from "./types";

export type OfflineGuide = Guide & {
  id: string;
  emoji: string;
  shortLabel: string;
  keywords: string[];
};

const step = (instruction: string, lookFor = "") => ({ instruction, lookFor });

export const OFFLINE_GUIDES: OfflineGuide[] = [
  {
    id: "tv-no-signal",
    emoji: "📺",
    shortLabel: "TV problem",
    keywords: [
      "tv",
      "telly",
      "television",
      "no signal",
      "blank",
      "black screen",
      "blue screen",
      "channel",
      "input",
      "source",
      "hdmi",
      "picture",
    ],
    understood: true,
    title: "TV shows no picture or says “No Signal”",
    reassurance:
      "This is one of the most common TV problems, and it is usually a quick fix.",
    device: "TV",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Pick up the TV remote. Find the button marked “Source” or “Input”. It is often near the top and may have a picture of a box with an arrow going into it.",
        "A list or a row of names like HDMI 1, HDMI 2 or TV appears on the screen.",
      ),
      step(
        "Press the “Source” button again a few times, waiting two seconds each time. Stop when you see your normal TV picture.",
        "Your usual channels come back.",
      ),
      step(
        "If that didn't work: turn the TV off at the wall socket. Count slowly to 30. Then turn it back on at the wall.",
        "The TV starts up again. This can take up to a minute.",
      ),
      step(
        "If you have a separate TV box (for example a Sky, Freeview or cable box), switch that off at the wall too. Wait 30 seconds and switch it back on.",
        "Lights on the box come on. Give it two minutes to start fully.",
      ),
      step(
        "Turn the TV on with the remote and wait two minutes.",
        "Your normal picture is back.",
      ),
    ],
    whenToGetHelp:
      "If there is still no picture, call your TV or TV box provider. Their number is usually on your bill.",
  },
  {
    id: "remote",
    emoji: "🎛️",
    shortLabel: "Remote not working",
    keywords: [
      "remote",
      "clicker",
      "zapper",
      "buttons not working",
      "remote control",
      "batteries",
    ],
    understood: true,
    title: "TV remote isn't working",
    reassurance:
      "Remotes stop working all the time. It's nearly always the batteries.",
    device: "TV remote",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Turn the remote over. Slide or press off the little cover on the back.",
        "You can see two batteries.",
      ),
      step(
        "Take out the old batteries. Put in two new ones. Match the + on each battery to the + drawn inside the remote.",
        "",
      ),
      step("Put the cover back on.", "It clicks into place."),
      step(
        "Point the remote straight at the TV, from a few steps away, and press the power button.",
        "The TV turns on or off.",
      ),
      step(
        "If nothing happens, check nothing is blocking the front of the TV, like a vase or a photo frame. Then try again.",
        "",
      ),
    ],
    whenToGetHelp:
      "If new batteries don't help, the remote may be broken. A shop can sell you a replacement made for your TV make.",
  },
  {
    id: "wifi",
    emoji: "📶",
    shortLabel: "Internet / Wi-Fi",
    keywords: [
      "wifi",
      "wi-fi",
      "wi fi",
      "internet",
      "router",
      "broadband",
      "online",
      "connection",
      "connect",
      "website",
      "web",
      "hub",
      "no internet",
    ],
    understood: true,
    title: "The internet or Wi-Fi isn't working",
    reassurance:
      "Internet hiccups happen in every home. Restarting the box fixes it most of the time.",
    device: "Internet box (router)",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Find your internet box. It is a small box with blinking lights, often near the phone socket or by the TV. It is called a router.",
        "You can see little lights on the front.",
      ),
      step(
        "Turn it off at the wall socket, or pull out its power plug.",
        "All the lights go off.",
      ),
      step("Wait one full minute. You could count slowly to 60.", ""),
      step(
        "Turn it back on at the wall, or plug it back in.",
        "The lights come back on. Some will blink.",
      ),
      step(
        "Wait five minutes. Make a cup of tea. The box needs time to wake up.",
        "Most of the lights stop blinking and stay on.",
      ),
      step(
        "Now try your phone, tablet or computer again.",
        "The internet is working.",
      ),
    ],
    whenToGetHelp:
      "If it still doesn't work, call your internet company. Their number is usually on a sticker on the box or on your bill.",
  },
  {
    id: "frozen",
    emoji: "📱",
    shortLabel: "Phone/tablet frozen",
    keywords: [
      "frozen",
      "stuck",
      "freeze",
      "not responding",
      "won't respond",
      "touch screen",
      "screen not working",
      "ipad",
      "tablet",
      "iphone",
      "phone stuck",
      "crashed",
    ],
    understood: true,
    title: "Phone or tablet is frozen",
    reassurance:
      "Phones and tablets get stuck now and then. Turning it off and on again almost always helps.",
    device: "Phone or tablet",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Find the button on the side or top edge of your phone or tablet. This is the power button.",
        "",
      ),
      step(
        "Press and hold the power button down. Keep holding it for 10 seconds. On some phones you also need to hold a volume button at the same time.",
        "The screen goes black, or you see a slider that says “Power off” or “slide to power off”.",
      ),
      step(
        "If you see a slider or “Power off”, touch it, or slide it across with your finger.",
        "The screen goes completely black.",
      ),
      step("Wait 30 seconds.", ""),
      step(
        "Press and hold the power button again for 3 seconds, then let go.",
        "A logo appears. Wait a minute while it starts up.",
      ),
    ],
    whenToGetHelp:
      "If it freezes again and again, the shop where you bought it, or your mobile phone company, can help.",
  },
  {
    id: "charging",
    emoji: "🔋",
    shortLabel: "Won't charge",
    keywords: [
      "charge",
      "charging",
      "battery",
      "dead",
      "won't turn on",
      "flat",
      "charger",
      "power",
      "plug",
    ],
    understood: true,
    title: "Device won't charge or turn on",
    reassurance:
      "Charging problems are very common and usually down to the plug or the cable.",
    device: "Phone or tablet",
    clarifyingQuestion: "",
    safetyWarning:
      "If the device or charger is very hot, swollen, or smells of burning, unplug it straight away and don't use it.",
    steps: [
      step(
        "Check the charger is pushed firmly into the wall socket, and that the socket is switched on.",
        "",
      ),
      step(
        "Check the cable is pushed all the way into the phone or tablet.",
        "It goes in fully, with no gap.",
      ),
      step(
        "Look into the hole where the cable goes. If you see fluff, gently tap the phone upside down. Do not poke anything metal inside.",
        "",
      ),
      step(
        "Leave it charging for 30 minutes without touching it. A very flat battery shows nothing at first.",
        "A battery picture or a light appears on the screen.",
      ),
      step(
        "If nothing, try a different socket, or a different charger cable if you have one.",
        "",
      ),
    ],
    whenToGetHelp:
      "If it still won't charge, take it to a phone shop. It may need a new cable or battery.",
  },
  {
    id: "tv-sound",
    emoji: "🔈",
    shortLabel: "No sound",
    keywords: [
      "sound",
      "volume",
      "quiet",
      "mute",
      "can't hear",
      "cant hear",
      "loud",
      "audio",
      "speaker",
    ],
    understood: true,
    title: "No sound or sound too quiet",
    reassurance:
      "This happens to everyone. Often a mute button has been pressed by accident.",
    device: "TV or device",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Look at the screen for a small picture of a speaker with a line through it. That means sound is switched off (muted).",
        "",
      ),
      step(
        "On the remote, find the button with a speaker and a cross or line on it. It may say “Mute”. Press it once.",
        "The sound comes back.",
      ),
      step(
        "Press the volume up button (often marked + or “Vol +”) a few times.",
        "A volume bar on the screen goes up and you hear sound.",
      ),
      step(
        "If you have a separate TV box, its remote may control the volume too. Try its mute and volume buttons.",
        "",
      ),
    ],
    whenToGetHelp:
      "If there is still no sound, turn the TV off at the wall for 30 seconds and back on. If that doesn't help, call the TV maker or the shop.",
  },
  {
    id: "scam",
    emoji: "⚠️",
    shortLabel: "Suspicious call/message",
    keywords: [
      "scam",
      "virus",
      "hacked",
      "pop up",
      "popup",
      "microsoft called",
      "bank called",
      "gift card",
      "suspicious",
      "password asked",
      "someone called",
      "infected",
      "warning message",
      "fraud",
    ],
    understood: true,
    title: "Suspicious call, message or pop-up",
    reassurance:
      "You were right to stop and check. Scammers try this on everyone, and checking first is exactly the right thing to do.",
    device: "Phone or computer",
    clarifyingQuestion: "",
    safetyWarning:
      "Do not call any number shown on a pop-up. Do not give passwords, bank details, codes or gift card numbers to anyone who contacted you.",
    steps: [
      step(
        "If you are on a phone call with them, hang up now. It is fine to be rude to a scammer.",
        "",
      ),
      step(
        "If a scary message fills your computer screen, don't click on it. Switch the computer off with its power button. Hold the button down if you need to.",
        "The screen goes off.",
      ),
      step("Do not call any number in the message or pop-up.", ""),
      step(
        "If you gave out bank details, call your bank using the number on the back of your bank card. Use a different phone if you can, or wait 10 minutes first.",
        "",
      ),
      step(
        "Tell a family member or friend what happened when you feel ready. It happens to lots of people.",
        "",
      ),
    ],
    whenToGetHelp:
      "If you lost money, call your bank straight away, then report it to the police fraud line.",
  },
  {
    id: "printer",
    emoji: "🖨️",
    shortLabel: "Printer",
    keywords: [
      "printer",
      "print",
      "printing",
      "paper jam",
      "ink",
      "won't print",
    ],
    understood: true,
    title: "Printer won't print",
    reassurance: "Printers are famously fussy. You're in good company.",
    device: "Printer",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Check the printer is switched on. There should be a light on the front.",
        "A light is on.",
      ),
      step(
        "Look at the printer's little screen or lights. A flashing orange or red light often means out of paper, out of ink, or stuck paper.",
        "",
      ),
      step("Check there is paper in the paper tray.", ""),
      step(
        "Turn the printer off with its power button. Wait 30 seconds. Turn it back on.",
        "It makes some whirring noises as it starts.",
      ),
      step("Wait one minute, then try printing again.", "The page comes out."),
    ],
    whenToGetHelp:
      "If it still won't print, the printer maker has a helpline. The number is in the printer's booklet or on their website.",
  },
  {
    id: "password",
    emoji: "🔑",
    shortLabel: "Forgot password",
    keywords: [
      "password",
      "forgot",
      "forgotten",
      "login",
      "log in",
      "sign in",
      "locked out",
      "pin",
      "passcode",
    ],
    understood: true,
    title: "Forgotten password",
    reassurance:
      "Everyone forgets passwords. Every website and app has a way to get back in.",
    device: "Website or app",
    clarifyingQuestion: "",
    safetyWarning:
      "Only reset passwords on the real website or app. Never give a password to someone who phones or messages you.",
    steps: [
      step("Go to the page where it asks for your password.", ""),
      step(
        "Look just under the password box for words like “Forgot password?” or “Can't sign in?”. Tap or click on those words.",
        "A new page opens.",
      ),
      step("Type in your email address or phone number when it asks.", ""),
      step(
        "Check your email or text messages. You will get a message with a link or a code. This can take a few minutes.",
        "A new message arrives.",
      ),
      step(
        "Follow the link or type in the code. Then choose a new password and write it down somewhere safe at home.",
        "You are signed in.",
      ),
    ],
    whenToGetHelp:
      "If you can't get the message, the company's help line can check it is really you and help you back in.",
  },
  {
    id: "video-call",
    emoji: "🎥",
    shortLabel: "Video calls",
    keywords: [
      "video call",
      "facetime",
      "zoom",
      "whatsapp",
      "skype",
      "camera",
      "can't see me",
      "can't hear me",
      "microphone",
      "teams",
    ],
    understood: true,
    title: "Video call problems",
    reassurance:
      "Video calls confuse everyone at first. These buttons are tiny and easy to press by mistake.",
    device: "Phone, tablet or computer",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Tap the middle of the screen once during the call.",
        "A row of round buttons appears, usually at the bottom.",
      ),
      step(
        "Look for a microphone picture. If it has a line through it, they can't hear you. Tap it once.",
        "The line disappears.",
      ),
      step(
        "Look for a camera picture. If it has a line through it, they can't see you. Tap it once.",
        "The line disappears and they can see you.",
      ),
      step(
        "Check nothing is covering the little camera dot at the top of your screen, like a finger or a case.",
        "",
      ),
      step(
        "If you still can't hear them, press the volume up button on the side of your device.",
        "",
      ),
    ],
    whenToGetHelp:
      "If it still doesn't work, hang up and call them back. Starting fresh fixes a lot.",
  },
  {
    id: "text-size",
    emoji: "🔍",
    shortLabel: "Text too small",
    keywords: [
      "small",
      "too small",
      "can't read",
      "bigger",
      "text size",
      "font",
      "zoom in",
      "eyes",
      "tiny",
    ],
    understood: true,
    title: "Writing on the screen is too small",
    reassurance:
      "Lots of people make their writing bigger. It's a very good idea.",
    device: "Phone or tablet",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Find the “Settings” app. Its picture looks like a grey gear wheel.",
        "",
      ),
      step("Tap Settings once to open it.", "A long list appears."),
      step(
        "Look for “Display” or “Display & Brightness”. Tap it. You may need to slide the list up with your finger to find it.",
        "",
      ),
      step("Tap “Text Size” or “Font size”.", "A slider appears."),
      step(
        "Slide the dot to the right with your finger.",
        "The writing gets bigger as you slide.",
      ),
    ],
    whenToGetHelp:
      "If you can't find it, a family member or the phone shop can do it in a minute.",
  },
  {
    id: "smart-speaker",
    emoji: "🔊",
    shortLabel: "Smart speaker",
    keywords: [
      "alexa",
      "echo",
      "google home",
      "smart speaker",
      "nest",
      "assistant",
      "speaker not listening",
      "hey google",
    ],
    understood: true,
    title: "Smart speaker isn't answering",
    reassurance:
      "These speakers stop listening now and then. A restart usually sorts it.",
    device: "Smart speaker",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Look at the lights on the speaker. Red lights usually mean the microphone is switched off.",
        "",
      ),
      step(
        "If the lights are red, press the button with a microphone picture on it (often with a line through it).",
        "The red light goes away.",
      ),
      step(
        "If it still doesn't answer, pull its power plug out of the wall.",
        "",
      ),
      step(
        "Wait 30 seconds, then plug it back in.",
        "The lights come on. Wait two minutes for it to start.",
      ),
      step("Say its wake word clearly, then your question.", "It answers you."),
    ],
    whenToGetHelp:
      "If it still won't work, check the internet is working (try another device). If the internet is fine, contact the speaker's maker.",
  },
];

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ");

/** Pick the best built-in guide for what the person said, or null if nothing fits. */
export function findOfflineGuide(problem: string): OfflineGuide | null {
  const text = ` ${normalise(problem)} `;
  let best: OfflineGuide | null = null;
  let bestScore = 0;
  for (const guide of OFFLINE_GUIDES) {
    let score = 0;
    for (const kw of guide.keywords) {
      // Longer, more specific phrases count for more.
      if (
        text.includes(` ${normalise(kw)} `) ||
        text.includes(` ${normalise(kw)}`)
      ) {
        score += kw.split(" ").length + 1;
      }
    }
    // Scams always win if mentioned; safety first.
    if (guide.id === "scam" && score > 0) score += 3;
    if (score > bestScore) {
      best = guide;
      bestScore = score;
    }
  }
  return best;
}
