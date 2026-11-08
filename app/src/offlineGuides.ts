// Built-in guides for the most common problems.
// Used when there is no internet, the helper server isn't set up yet,
// or the person taps one of the picture buttons on the home screen.

import type { Guide } from "./types";
import { EVERYDAY_GUIDES } from "./everydayGuides";
import { TV_APP_GUIDES } from "./tvAppGuides";

export type OfflineGuide = Guide & {
  id: string;
  emoji: string;
  shortLabel: string;
  keywords: string[];
  /** "out" = machines in shops, restaurants and car parks. Default is at home. */
  place?: "home" | "out";
  /** Words that strongly point to this guide (a shop name, "delivered"...). */
  boost?: string[];
  /** Reached through the "What's happening?" picker, not a home screen button. */
  hidden?: boolean;
};

const step = (instruction: string, lookFor = "") => ({ instruction, lookFor });

const BASE_GUIDES: OfflineGuide[] = [
  {
    id: "tv-no-signal",
    emoji: "📺",
    shortLabel: "No picture",
    keywords: [
      "no signal",
      "black",
      "gone black",
      "nothing on the screen",
      "no picture",
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
      "click the link",
      "click on the link",
      "press the link",
      "account is locked",
      "account locked",
      "account suspended",
      "account has been suspended",
      "scam",
      "virus",
      "hacked",
      "pop up",
      "popup",
      "microsoft called",
      "microsoft",
      "someone rang",
      "someone called",
      "man rang",
      "man called",
      "woman rang",
      "woman called",
      "rang saying",
      "called saying",
      "cold call",
      "bank details",
      "remote access",
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
      "can't hear her",
      "can't hear him",
      "can't see her",
      "can't see him",
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
  {
    id: "takeaway-delivery",
    emoji: "🥡",
    shortLabel: "Order a takeaway",
    keywords: [
      "takeaway",
      "take away",
      "take out",
      "deliveroo",
      "just eat",
      "uber eats",
      "delivery",
      "deliver",
      "delivered",
      "order food",
      "food app",
      "order a takeaway",
      "chinese",
      "indian",
      "pizza",
      "fish and chips",
      "curry",
    ],
    boost: [
      "deliver",
      "delivery",
      "delivered",
      "deliveroo",
      "just eat",
      "uber eats",
      "to my house",
      "at home",
      "app",
    ],
    understood: true,
    title: "Ordering a takeaway to your home",
    reassurance:
      "Lots of people find takeaway apps fiddly. The simplest way is still to phone the takeaway. They are always happy to take orders over the phone.",
    device: "Phone",
    clarifyingQuestion: "",
    safetyWarning:
      "Only pay inside the app, or to the takeaway itself. Never give your card details to someone who texts or rings you about a delivery.",
    steps: [
      step(
        "The easy way: find the takeaway's phone number on a menu leaflet, or ask someone to write it down for you. Ring them and say what you'd like, and your address.",
        "They tell you the price and how long it will be. You can pay the driver when the food comes.",
      ),
      step(
        "If you'd like to use an app instead: find the takeaway app on your phone and touch it once to open it.",
        "Pictures of food and restaurants.",
      ),
      step(
        "Check the address at the top of the screen is your home. If it isn't, touch it and choose your address.",
        "Your street is shown at the top.",
      ),
      step(
        "Touch the search box near the top. It has a little magnifying glass. Type the food you fancy, like “fish and chips” or “Chinese”.",
        "A list of places near you.",
      ),
      step(
        "Touch a place to see its menu. Next to the food you want, touch “Add” or the + sign.",
        "A bar at the bottom shows your basket and the price.",
      ),
      step(
        "Touch the button at the bottom that says “View basket” or “Checkout”.",
        "Your food and the total price, including delivery.",
      ),
      step(
        "Check your food and your address are right. Then touch “Place order” or “Pay”.",
        "A message saying your order is on its way.",
      ),
      step(
        "The app shows when your food will arrive. Keep your phone close by, as the driver may ring you.",
        "",
      ),
    ],
    whenToGetHelp:
      "If the app gets confusing, close it and phone the takeaway instead. That always works.",
  },
  {
    id: "order-kiosk",
    place: "out",
    boost: [
      "kiosk",
      "mcdonald",
      "maccies",
      "burger king",
      "kfc",
      "restaurant",
      "cafe",
      "screen",
      "in the shop",
    ],
    emoji: "🍔",
    shortLabel: "Ordering screen",
    keywords: [
      "kiosk",
      "kiosks",
      "order",
      "ordering",
      "mcdonald",
      "mcdonalds",
      "maccies",
      "burger king",
      "kfc",
      "restaurant",
      "fast food",
      "cafe",
      "big screen",
      "screen to order",
      "touch screen to order",
      "order screen",
      "ordering screen",
      "food",
    ],
    understood: true,
    title: "Ordering food on a big touch screen",
    reassurance:
      "These screens confuse lots of people, and you never have to use them. You can always order at the counter instead. Just say: “Can I order with you, please?”",
    device: "Ordering screen",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Stand in front of the big screen. Touch it anywhere with one finger.",
        "A start page with big buttons like “Eat in” and “Take away”.",
      ),
      step(
        "Touch “Eat in” if you will eat there. Touch “Take away” if you are taking it with you.",
        "Pictures of food appear.",
      ),
      step(
        "Down the side or along the top are groups, like “Burgers”, “Drinks” and “Desserts”. Touch a group to see what's in it.",
        "Pictures of the food in that group.",
      ),
      step(
        "Touch the picture of what you want. If it asks about making it a meal or adding extras, you can touch “No thanks”.",
        "Your choice is added. A small total appears at the bottom.",
      ),
      step(
        "When you have everything, touch the button at the bottom that says “Checkout”, “Review order” or “Pay”.",
        "A list of your food, with the price.",
      ),
      step(
        "Check the list. If something is wrong, touch the bin picture or the minus sign next to it to remove it.",
        "",
      ),
      step(
        "Touch “Pay”. If you see “Pay at counter”, you can choose that and pay a person instead.",
        "",
      ),
      step(
        "To pay by card, hold your bank card flat against the card reader under the screen, where you see four curved lines. Keep it there until it beeps.",
        "A beep, then a tick or “Approved”.",
      ),
      step(
        "Take your receipt. It has your order number on it. Watch the screen above the counter until your number appears.",
        "Your number shows on the screen. Go to the counter to collect your food.",
      ),
    ],
    whenToGetHelp:
      "If you get stuck, wave to a member of staff, or go to the counter. Helping people is part of their job. If the screen goes back to the start, that's fine: it does that if you wait. Just start again.",
  },
  {
    id: "self-checkout",
    place: "out",
    boost: [
      "self checkout",
      "self service",
      "bagging",
      "supermarket",
      "tesco",
      "sainsbury",
      "asda",
      "aldi",
      "lidl",
      "morrisons",
      "waitrose",
    ],
    emoji: "🛒",
    shortLabel: "Self-checkout",
    keywords: [
      "self checkout",
      "self service",
      "self scan",
      "checkout",
      "till",
      "tills",
      "supermarket",
      "unexpected item",
      "bagging area",
      "scan",
      "scanner",
      "tesco",
      "sainsbury",
      "asda",
      "aldi",
      "lidl",
      "morrisons",
      "waitrose",
      "boots",
    ],
    understood: true,
    title: "Using a self-checkout in a shop",
    reassurance:
      "Self-checkouts catch everyone out, especially the “unexpected item” message. You can always use a till with a person instead.",
    device: "Self-checkout",
    clarifyingQuestion: "",
    safetyWarning: "",
    steps: [
      step(
        "Touch “Start” on the screen. If it asks if you brought your own bags, touch “Yes” or “No”.",
        "It asks you to scan your first item.",
      ),
      step(
        "Find the stripy barcode on your item. Hold it flat, a hand's width above the glass, with the stripes facing down. Move it slowly until it beeps.",
        "A beep. The item and price appear on the screen.",
      ),
      step(
        "Put the item in the bagging area straight away, then scan the next one.",
        "",
      ),
      step(
        "For fruit and veg without a barcode, touch “Look up item” on the screen, then touch the picture of what you have.",
        "It is added to your list.",
      ),
      step(
        "If it says “Unexpected item in the bagging area”, don't worry. Don't move anything. A member of staff will come over, or you can wave to them.",
        "A light flashes above the till. Staff are on their way.",
      ),
      step("When everything is scanned, touch “Finish and pay” or “Pay”.", ""),
      step(
        "Touch “Card”. Hold your bank card flat against the card reader until it beeps, or put it in and type your PIN. Cover the keypad with your other hand.",
        "“Payment approved”.",
      ),
      step("Take your receipt and your bags.", ""),
    ],
    whenToGetHelp:
      "If anything goes wrong, a member of staff watches the self-checkouts and is there to help. Just wave or call out “Excuse me”.",
  },
  {
    id: "ticket-machine",
    place: "out",
    boost: ["car park", "parking", "station", "ticket machine"],
    emoji: "🅿️",
    shortLabel: "Parking/ticket machine",
    keywords: [
      "car park",
      "parking",
      "pay and display",
      "parking machine",
      "ticket machine",
      "train ticket",
      "train",
      "station",
      "parking ticket",
      "pay machine",
      "barrier",
    ],
    understood: true,
    title: "Paying at a parking or ticket machine",
    reassurance:
      "These machines are all different, and lots of people find them confusing. Take your time. Nobody minds waiting.",
    device: "Ticket machine",
    clarifyingQuestion: "",
    safetyWarning:
      "Only pay at the machine itself. Be careful with QR code stickers on parking machines. Some are fake and are put there by scammers.",
    steps: [
      step(
        "Read the big sign on or above the machine. It shows the prices and how long you can stay.",
        "",
      ),
      step(
        "If it asks for your car's number plate, type it in using the letter buttons, then press “OK” or the green button.",
        "Your number plate shows on the screen.",
      ),
      step(
        "Choose how long you want to stay, or where you want to go, by pressing the buttons next to the choices.",
        "The price shows on the screen.",
      ),
      step(
        "Pay. For card, hold it flat on the card reader where you see four curved lines until it beeps. For coins, put them in the coin slot.",
        "A beep, or “Payment accepted”.",
      ),
      step(
        "Take your ticket from the slot at the bottom.",
        "A ticket comes out.",
      ),
      step(
        "For a car park: put the ticket on your dashboard, face up, where it can be seen through the windscreen. For a train: keep it safe for the journey.",
        "",
      ),
    ],
    whenToGetHelp:
      "Most machines have a “Help” button or a phone number on them. At a station, staff at the ticket office can help.",
  },
];

export const OFFLINE_GUIDES: OfflineGuide[] = [
  ...BASE_GUIDES,
  ...TV_APP_GUIDES,
  ...EVERYDAY_GUIDES,
];

export const guideById = (id: string) =>
  OFFLINE_GUIDES.find((g) => g.id === id) ?? null;

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
    // Strong clues, like naming a shop, a car park or "delivered", win ties.
    if (
      score > 0 &&
      guide.boost?.some((kw) => text.includes(` ${normalise(kw)}`))
    )
      score += 3;
    if (score > bestScore) {
      best = guide;
      bestScore = score;
    }
  }
  return best;
}
