// Everyday things that have moved online and leave older people stuck:
// GP appointments, prescriptions, banking, codes sent by text, WhatsApp,
// photos, email, calls, parking apps, QR codes and cash machines.
//
// Most are reached through the "What's happening?" pickers (hidden: true).
// Out-and-about ones also appear as picture buttons on the home screen.

import type { OfflineGuide } from "./offlineGuides";

const step = (instruction: string, lookFor = "") => ({ instruction, lookFor });

const blank = { understood: true, clarifyingQuestion: "", safetyWarning: "" };

export const EVERYDAY_GUIDES: OfflineGuide[] = [
  /* ---------- Doctor and prescriptions ---------- */
  {
    ...blank,
    id: "gp-appointment",
    hidden: true,
    emoji: "🩺",
    shortLabel: "GP appointment",
    keywords: [
      "gp",
      "doctor",
      "doctors",
      "appointment",
      "surgery",
      "book an appointment",
      "see the doctor",
      "nhs app",
      "nhs",
      "practice",
    ],
    boost: ["gp", "doctor", "surgery", "appointment"],
    title: "Booking a GP appointment",
    reassurance:
      "Lots of people find booking the doctor online hard. You can always phone or go in. The NHS says online booking must not replace those.",
    device: "Phone",
    safetyWarning:
      "If someone is seriously ill or injured, call 999. For urgent help that isn't an emergency, call 111. It's free.",
    steps: [
      step(
        "The easy way: ring your GP surgery. Most phone lines open at 8 in the morning, and that's when they're busiest. If you're in a queue, it's fine to wait.",
        "Someone answers and asks what the problem is.",
      ),
      step(
        "Tell them, in your own words, what's wrong and how long it's been going on. Ask them to book you in.",
        "They give you a day and time. Write it down.",
      ),
      step(
        "If you'd rather use the NHS App: find it on your phone. It's a blue square with the white letters NHS. Touch it once.",
        "It asks you to log in.",
      ),
      step(
        "Log in with your face, fingerprint or the code you chose. If it sends a code to your phone, type that in.",
        "The NHS App home page.",
      ),
      step(
        "Look for the words “Appointments” or “GP appointments”, and touch them.",
        "Your appointments, and an option to book or request one.",
      ),
      step(
        "Touch “Book an appointment” or “Request an appointment” and follow the questions. Answer in your own words.",
        "A message saying it's booked, or that the surgery will contact you.",
      ),
    ],
    whenToGetHelp:
      "If you can't get through, you can go to the surgery's front desk in person and ask for an appointment.",
  },
  {
    ...blank,
    id: "repeat-prescription",
    hidden: true,
    emoji: "💊",
    shortLabel: "Repeat prescription",
    keywords: [
      "prescription",
      "prescriptions",
      "repeat prescription",
      "tablets",
      "medication",
      "medicine",
      "pills",
      "chemist",
      "pharmacy",
      "inhaler",
    ],
    boost: [
      "tablets",
      "pills",
      "prescription",
      "repeat",
      "medication",
      "pharmacy",
      "chemist",
    ],
    title: "Ordering a repeat prescription",
    reassurance:
      "There are a few ways to do this, and the paper way still works. Pick whichever feels easiest.",
    device: "Phone",
    steps: [
      step(
        "The easy way: find the paper slip from your last prescription. Tick the medicines you need on the right-hand side.",
        "",
      ),
      step(
        "Hand the slip in at your GP surgery or your usual chemist. They will sort it out.",
        "They tell you when it will be ready to collect, usually in a few days.",
      ),
      step(
        "If you'd rather use the NHS App: open it (the blue square with NHS on it) and log in.",
        "The NHS App home page.",
      ),
      step(
        "Look for the word “Prescriptions” and touch it. Then touch “Order a repeat prescription”.",
        "A list of your regular medicines.",
      ),
      step(
        "Touch the box next to each medicine you need, so a tick appears. Then touch “Continue”.",
        "",
      ),
      step(
        "Check which chemist it will go to, then touch “Confirm and order”.",
        "A message saying your order has been sent.",
      ),
    ],
    whenToGetHelp:
      "Your chemist is very happy to help with repeat prescriptions. Just ask at the counter.",
  },
  {
    ...blank,
    id: "urgent-help",
    hidden: true,
    emoji: "🚑",
    shortLabel: "Urgent help",
    keywords: [
      "urgent",
      "emergency",
      "ambulance",
      "111",
      "999",
      "out of hours",
      "need a doctor now",
      "unwell",
      "feel ill",
    ],
    boost: ["urgent", "emergency", "ambulance", "999", "111"],
    title: "Getting medical help quickly",
    reassurance:
      "You don't need an app or the internet for this. Just your phone.",
    device: "Phone",
    safetyWarning:
      "If someone has chest pain, can't breathe, has collapsed, or might be having a stroke, call 999 straight away.",
    steps: [
      step(
        "For a real emergency, ring 999. Say “Ambulance” and tell them where you are.",
        "Someone answers straight away and tells you what to do.",
      ),
      step(
        "For urgent help that isn't an emergency, ring 111. It's free, day and night.",
        "A friendly person asks you some questions.",
      ),
      step(
        "Answer the questions in your own words. Have your glasses and a pen nearby if you can.",
        "They tell you what to do next, or where to go.",
      ),
    ],
    whenToGetHelp:
      "If you are on your own and worried, ring 111 or a family member. You are not wasting anyone's time.",
  },

  /* ---------- Money and banking ---------- */
  {
    ...blank,
    id: "banking-app",
    hidden: true,
    emoji: "🏦",
    shortLabel: "Banking app",
    keywords: [
      "bank",
      "banking",
      "balance",
      "bank app",
      "banking app",
      "online banking",
      "how much money",
      "statement",
      "barclays",
      "lloyds",
      "natwest",
      "halifax",
      "santander",
      "hsbc",
      "nationwide",
      "monzo",
      "starling",
    ],
    boost: ["bank", "banking", "balance", "statement"],
    title: "Checking your money in a banking app",
    reassurance:
      "Banking apps look busy, but checking your money only takes a couple of touches.",
    device: "Phone",
    safetyWarning:
      "Your bank will never ask for your PIN or full password, and never asks you to move money to a “safe account”. If anyone does, hang up. It's a scam.",
    steps: [
      step(
        "Find your bank's app on your phone. It has your bank's logo on it. Touch it once.",
        "It asks you to log in.",
      ),
      step(
        "Log in with your face, your fingerprint, or the passcode you chose. Make sure nobody is watching you type it.",
        "Your accounts appear.",
      ),
      step(
        "Your money is shown as a number next to your account name. That's your balance.",
        "A number with a £ sign.",
      ),
      step(
        "To see what you've spent, touch the account name once.",
        "A list of payments, newest at the top.",
      ),
      step("When you've finished, close the app.", ""),
    ],
    whenToGetHelp:
      "If something looks wrong, ring the number on the back of your bank card. You can also do your banking at a branch or at the Post Office counter.",
  },
  {
    ...blank,
    id: "verification-code",
    hidden: true,
    emoji: "🔢",
    shortLabel: "A code by text",
    keywords: [
      "code",
      "codes",
      "verification",
      "verification code",
      "one time",
      "passcode",
      "security code",
      "sent me a code",
      "text me a code",
      "6 digit",
      "six digit",
      "otp",
    ],
    boost: ["code", "verification", "sent me a code", "otp"],
    title: "It says it has sent you a code",
    reassurance:
      "Websites and apps often text you a code to check it's really you. It's normal and easy once you've done it once.",
    device: "Phone",
    safetyWarning:
      "Never read a code out to anyone, even if they say they are from your bank, the police or a family member. Only type it into the screen you were using.",
    steps: [
      step(
        "Stay on the screen that is asking for the code. Don't close it.",
        "A box asking for a code, often 6 numbers.",
      ),
      step(
        "Look at the top of your phone's screen. A text message with the code may pop up for a moment.",
        "A short message with a number in it.",
      ),
      step(
        "If it went away: open your Messages app (the green speech bubble) and touch the newest message.",
        "The message with the code.",
      ),
      step(
        "Remember or write down the numbers. Then go back to the screen that asked for it and type them into the box.",
        "It lets you in.",
      ),
      step(
        "No code after 2 minutes? Look for the words “Send again” or “Resend code” and touch them.",
        "A new code arrives. Use the newest one.",
      ),
    ],
    whenToGetHelp:
      "If you got a code you didn't ask for, someone may be trying to get into your account. Don't share it. Tell a family member or ring your bank.",
  },

  /* ---------- Messages, photos and email ---------- */
  {
    ...blank,
    id: "whatsapp-message",
    hidden: true,
    emoji: "💬",
    shortLabel: "WhatsApp messages",
    keywords: [
      "whatsapp",
      "whats app",
      "message",
      "messages",
      "reply",
      "voice message",
      "voice note",
      "group chat",
      "text back",
    ],
    boost: ["whatsapp", "whats app", "voice message", "voice note"],
    title: "Reading and replying on WhatsApp",
    reassurance:
      "WhatsApp is how lots of families keep in touch. Once you've replied once, you'll be fine.",
    device: "Phone",
    steps: [
      step(
        "Find the WhatsApp app. It's a green square with a white phone inside a speech bubble. Touch it once.",
        "A list of names. These are your chats.",
      ),
      step(
        "Touch the name of the person or group you want.",
        "Their messages. The newest are at the bottom.",
      ),
      step(
        "To reply, touch the long white box at the bottom of the screen.",
        "A keyboard appears.",
      ),
      step(
        "Type your message. Then touch the green circle with an arrow to send it.",
        "Your message appears on the right-hand side.",
      ),
      step(
        "Prefer to talk? Press and hold the microphone button at the bottom right. Keep holding while you speak, then let go.",
        "Your voice message is sent, as a little line with a play button.",
      ),
    ],
    whenToGetHelp:
      "If you can't find WhatsApp, it may not be on your phone yet. A family member can set it up in a few minutes.",
  },
  {
    ...blank,
    id: "send-photo",
    hidden: true,
    emoji: "📷",
    shortLabel: "Send a photo",
    keywords: ["send a photo", "send a picture", "share a photo", "send pictures", "send photos", "send photo whatsapp", "send picture to"],
    title: "Taking a photo and sending it to family",
    reassurance:
      "Sending photos is easier than it looks. Two or three touches and it's done.",
    device: "Phone",
    steps: [
      step(
        "To take a photo: open the Camera app. It looks like a little camera.",
        "The screen shows what the camera sees.",
      ),
      step(
        "Point your phone at what you want, hold it still, and touch the big round white button.",
        "A little copy of your photo appears in the corner.",
      ),
      step(
        "To send it: open WhatsApp (the green square) and touch the name of the person.",
        "Their messages.",
      ),
      step(
        "At the bottom, touch the little camera button, or the + or paperclip button, then “Photos” or “Gallery”.",
        "Your photos, newest first.",
      ),
      step(
        "Touch the photo you want, then touch the green circle with an arrow.",
        "Your photo appears in the chat. Sent!",
      ),
    ],
    whenToGetHelp:
      "If you can't find a photo, open the Photos or Gallery app. Your newest photos are at the bottom or the top.",
  },
  {
    ...blank,
    id: "email-send",
    hidden: true,
    emoji: "✉️",
    shortLabel: "Send an email",
    keywords: ["send an email", "send email", "write an email", "new email", "compose email", "email someone", "how do i email", "write email"],
    title: "Sending an email",
    reassurance:
      "Email has a few boxes to fill in, but there's no rush. Nothing is sent until you press Send.",
    device: "Phone or computer",
    steps: [
      step(
        "Open your email app. It often looks like an envelope.",
        "A list of your emails. These are your inbox.",
      ),
      step(
        "Look for a button with a pencil, or the words “Compose” or “New”. Touch it.",
        "A blank email with boxes to fill in.",
      ),
      step(
        "In the “To” box, type the person's email address. It always has an @ in it.",
        "",
      ),
      step(
        "In the “Subject” box, type a few words about what it's about, like “Photos from Sunday”.",
        "",
      ),
      step("Touch the big empty space underneath and type your message.", ""),
      step(
        "To add a photo, touch the paperclip button and choose the photo.",
        "A small copy of the photo appears in your email.",
      ),
      step(
        "Touch “Send”. It may look like a paper aeroplane.",
        "The email disappears. It has been sent.",
      ),
    ],
    whenToGetHelp:
      "If it bounces back, the email address may be spelled wrong. Check it letter by letter.",
  },

  /* ---------- Calls and the phone itself ---------- */
  {
    ...blank,
    id: "answer-call",
    hidden: true,
    emoji: "📞",
    shortLabel: "Answering calls",
    keywords: [
      "answer",
      "answering",
      "answer the phone",
      "pick up",
      "swipe to answer",
      "slide to answer",
      "hang up",
      "end the call",
      "missed call",
      "ring back",
      "call back",
    ],
    boost: ["answer", "missed call", "hang up", "ring back"],
    title: "Answering and making calls",
    reassurance:
      "Phones all answer a bit differently, which catches everyone out. Here's what to look for.",
    device: "Phone",
    steps: [
      step(
        "When it rings, look for a green button with a phone picture. Touch it.",
        "You can hear the person.",
      ),
      step(
        "If instead it says “slide to answer”, put your finger on the green circle and slide it across to the right.",
        "The call starts.",
      ),
      step(
        "To end the call, touch the red button with a phone picture.",
        "The call ends.",
      ),
      step(
        "Missed a call? Open the Phone app (a green square with a white phone) and touch “Recents”.",
        "A list of recent calls. Missed ones are in red.",
      ),
      step(
        "Touch a name or number in the list to ring them back.",
        "Your phone rings them.",
      ),
    ],
    whenToGetHelp:
      "If you don't recognise a missed number, it's fine not to ring back. If it's important, they'll leave a message.",
  },
  {
    ...blank,
    id: "add-contact",
    hidden: true,
    emoji: "📇",
    shortLabel: "Save a number",
    keywords: [
      "contact",
      "contacts",
      "add a contact",
      "save a number",
      "save number",
      "new number",
      "address book",
      "phone book",
    ],
    boost: [
      "contact",
      "contacts",
      "save a number",
      "address book",
      "phone book",
    ],
    title: "Saving someone's phone number",
    reassurance:
      "Saving numbers means their name shows up when they ring. It only takes a minute.",
    device: "Phone",
    steps: [
      step("Open the Phone app (a green square with a white phone).", ""),
      step("Touch “Contacts” at the bottom.", "A list of names."),
      step(
        "Touch the + sign. It's usually at the top or bottom of the screen.",
        "A new, empty contact.",
      ),
      step("Touch “First name” and type their name.", ""),
      step("Touch “Phone” or “Add phone” and type their number.", ""),
      step("Touch “Done” or “Save”.", "Their name is now in your list."),
    ],
    whenToGetHelp:
      "If you can't find the + sign, a family member can show you once, and then you'll know.",
  },
  {
    ...blank,
    id: "phone-silent",
    hidden: true,
    emoji: "🔕",
    shortLabel: "Phone not ringing",
    keywords: ["ringing", "isn t ringing", "not ringing", "doesn t ring", "didn t ring", "silent", "on silent", "no ringtone", "can t hear it ring", "do not disturb", "moon", "phone won't ring"],
    boost: ["ringing", "silent", "do not disturb", "won't ring"],
    title: "Phone isn't ringing",
    reassurance:
      "Phones get put on silent by accident all the time, often in a pocket or bag.",
    device: "Phone",
    steps: [
      step(
        "Press the volume up button on the side of the phone a few times. It's usually the top button of two.",
        "A volume bar on the screen goes up.",
      ),
      step(
        "iPhone: look for a small switch on the left side, above the volume buttons. If you can see orange, push it the other way.",
        "The orange goes away and it says “Ring” or “Silent mode off”.",
      ),
      step(
        "Now swipe down from the very top of the screen with one finger.",
        "A panel of round buttons appears.",
      ),
      step(
        "If a button with a moon picture is lit up, touch it to turn it off. That's “Do Not Disturb”.",
        "The moon button goes dark.",
      ),
      step(
        "If a button with an aeroplane picture is lit up, touch it to turn it off.",
        "The aeroplane goes dark. Calls can come through again.",
      ),
      step(
        "Swipe up, or press the button on the side, to close the panel.",
        "",
      ),
    ],
    whenToGetHelp:
      "To test it, ask someone to ring you. If it still doesn't ring, your phone shop or network can check it.",
  },
  {
    ...blank,
    id: "phone-popups",
    hidden: true,
    emoji: "🪧",
    shortLabel: "Pop-up messages",
    keywords: ["pop up", "popup", "message keeps popping up", "keeps asking", "keeps popping up", "notification keeps appearing", "storage almost full"],
    boost: ["pop up", "popup", "popping up"],
    title: "Messages that pop up on your phone",
    reassurance:
      "Phones nag a lot. Most of these messages are harmless, and you can choose “Later”.",
    device: "Phone",
    safetyWarning:
      "A web page saying your phone has a virus, or that you've won a prize, is a scam. Don't touch anything on it. Close it.",
    steps: [
      step(
        "“Software update”: this is safe and keeps your phone secure. Touch “Later” or “Tonight”, and leave your phone on charge overnight.",
        "It updates while you sleep.",
      ),
      step(
        "“Storage almost full”: your phone is running out of room for photos and videos. You can touch “Close” or “Not now” for today.",
        "",
      ),
      step(
        "To make room, ask a family member to help you save your photos somewhere else. Don't delete things in a hurry.",
        "",
      ),
      step(
        "A web page warning you about viruses or prizes: don't touch the message. Close the web browser app instead, by swiping it away.",
        "The message is gone.",
      ),
    ],
    whenToGetHelp:
      "If you're not sure whether a message is real, take a photo of it and send it to a family member to check.",
  },

  /* ---------- Out and about ---------- */
  {
    ...blank,
    id: "parking-app",
    place: "out",
    emoji: "📲",
    shortLabel: "Parking by app",
    keywords: [
      "pay by phone",
      "no machine",
      "no ticket machine",
      "ringgo app",
      "pay by phone app",
      "parking with",
      "parking app",
      "pay by phone",
      "paybyphone",
      "ringgo",
      "ring go",
      "cashless",
      "no machine",
      "pay for parking with my phone",
      "parking by phone",
      "location code",
      "justpark",
    ],
    boost: ["pay by phone", "broken machine", 
      "parking app",
      "pay by phone",
      "paybyphone",
      "ringgo",
      "ring go",
      "cashless",
      "location code",
      "justpark",
    ],
    title: "Paying for parking with your phone",
    reassurance:
      "More car parks want you to pay by phone now, and many people find it hard. Often you can just ring a number instead of using an app.",
    device: "Phone",
    safetyWarning:
      "Only use the app or phone number printed on the official sign. Be careful with QR code stickers on parking signs. Scammers put fake ones there.",
    steps: [
      step(
        "Find the parking sign. Look for a “location code” or “location number”, and write it down.",
        "A number, often 4 to 6 digits.",
      ),
      step(
        "The easy way: the sign usually has a phone number to pay by calling. Ring it and follow what the voice says.",
        "It asks for the location code, your number plate and your card.",
      ),
      step(
        "Or open the parking app named on the sign, like RingGo or PayByPhone.",
        "",
      ),
      step(
        "Type in the location code from the sign.",
        "The car park's name appears. Check it's the right one.",
      ),
      step(
        "Check your number plate is right, then choose how long you want to stay.",
        "The price appears.",
      ),
      step(
        "Touch “Pay” or “Confirm”.",
        "A message or text saying you've paid. You don't need a paper ticket.",
      ),
    ],
    whenToGetHelp:
      "If you can't pay, take a photo of the sign and your car, so you can show you tried. Some car parks still take cash at a nearby shop.",
  },
  {
    ...blank,
    id: "qr-code",
    place: "out",
    emoji: "🔳",
    shortLabel: "QR codes",
    keywords: [
      "qr",
      "qr code",
      "scan the code",
      "square code",
      "barcode menu",
      "menu on my phone",
      "scan the menu",
      "black and white square",
    ],
    boost: [
      "scan the menu",
      "menu",
      "qr",
      "qr code",
      "square code",
      "scan the code",
    ],
    title: "Using a QR code (the black and white square)",
    reassurance:
      "Those squares just open a web page, like a menu. Your phone's camera can read them.",
    device: "Phone",
    safetyWarning:
      "Only scan codes from places you trust, like a menu on your table. Never type bank details into a page from a code on a sticker.",
    steps: [
      step("Open the Camera app, as if you were taking a photo.", ""),
      step(
        "Point the camera at the black and white square. Hold the phone still so the whole square fits on the screen.",
        "A small yellow or white box with a web address appears.",
      ),
      step("Touch that small box.", "A web page opens, like the menu."),
      step(
        "If nothing happens, move a little closer or further away, and hold still for a few seconds.",
        "",
      ),
    ],
    whenToGetHelp:
      "If it doesn't work, just ask a member of staff for a paper menu or to take your order. They're used to it.",
  },
  {
    ...blank,
    id: "cash-machine",
    place: "out",
    emoji: "🏧",
    shortLabel: "Cash machine",
    keywords: [
      "cash machine",
      "cashpoint",
      "atm",
      "hole in the wall",
      "get money out",
      "withdraw cash",
      "take money out",
    ],
    boost: ["cash machine", "cashpoint", "atm", "hole in the wall"],
    title: "Getting money from a cash machine",
    reassurance: "Take your time. The machine waits for you, and nobody minds.",
    device: "Cash machine",
    safetyWarning:
      "Cover the keypad with your other hand when you type your PIN. If anyone stands too close or offers help, cancel and walk away.",
    steps: [
      step(
        "Put your card in the slot, with the chip going in first.",
        "The screen asks for your PIN.",
      ),
      step(
        "Cover the keypad with your other hand and type your 4-number PIN. Press the green “Enter” button.",
        "A list of choices.",
      ),
      step(
        "Press the button next to “Withdraw cash” or “Cash”.",
        "A list of amounts.",
      ),
      step(
        "Press the button next to the amount you want.",
        "It may ask if you want a receipt. Choose yes or no.",
      ),
      step("Take your card first when it comes out.", ""),
      step("Then take your money, and put it away before you walk off.", ""),
    ],
    whenToGetHelp:
      "If the machine keeps your card, ring your bank straight away. Their number is on your bank statements. The Post Office counter can also give you cash.",
  },
];
