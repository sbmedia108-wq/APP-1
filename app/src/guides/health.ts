import { g } from "../guideKit";

export const HEALTH_GUIDES = [
  g({
    id: "health-nhs-app-login",
    cat: "health",
    emoji: "🩺",
    label: "Get into the NHS App",
    title: "Set up or sign in to the NHS App",
    words: ["nhsapp", "nhs app login", "set up nhs app", "nhs login", "can't get into nhs app", "nhs app code", "prove who i am nhs"],
    steps: [
      ["Get the NHS App from the Play Store (blue square with white NHS letters).", ""],
      ["Open it and touch “Continue”, then “Sign in or create an NHS login”.", ""],
      ["Type your email and make a password. It sends a code by email and text: type them in.", ""],
      ["To see your GP records it asks you to prove who you are: you take a photo of your passport or driving licence and a short video of your face.", ""],
      ["No ID? Ask your GP surgery reception: they can link your account for you.", ""],
    ],
    help: "The NHS App helpline: search “NHS App help”, or ask your GP surgery or local library, which often runs help sessions.",
  }),
  g({
    id: "health-test-results",
    cat: "health",
    emoji: "📋",
    label: "See test results",
    title: "See your test results or GP record in the NHS App",
    words: ["test results", "blood test results", "see my records", "gp record", "medical records", "letters from hospital", "hospital appointment app"],
    steps: [
      ["Open the NHS App and sign in.", ""],
      ["Touch “Your health”, then “GP health record”.", ""],
      ["Touch “Test results”.", "Your recent results."],
      ["Hospital letters and appointments may be under “Messages” or “Hospital and other appointments”.", ""],
    ],
    help: "If you can't see results, your surgery may need to switch that on. Ask reception. If a result worries you, ring the surgery.",
  }),
  g({
    id: "health-111-online",
    cat: "health",
    emoji: "☎️",
    label: "NHS 111 online",
    title: "Get medical advice from NHS 111",
    words: ["111", "nhs 111", "need advice not emergency", "out of hours doctor", "medical advice", "feel unwell at night", "which pharmacy is open"],
    steps: [
      ["For urgent advice that isn't an emergency, ring 111 (free), any time.", ""],
      ["Or go to 111.nhs.uk on your phone and answer the questions.", ""],
      ["They'll tell you what to do, and can book you a call back or an appointment.", ""],
    ],
    warn: "For chest pain, a stroke (face drooping, arm weak, speech slurred), serious bleeding or difficulty breathing, ring 999.",
  }),
  g({
    id: "health-video-gp",
    cat: "health",
    emoji: "👩‍⚕️",
    label: "Video appointment with doctor",
    title: "Get ready for a video or phone appointment with the GP",
    words: ["video appointment", "online consultation", "video gp", "doctor video call", "phone appointment", "accurx", "gp sent a link"],
    steps: [
      ["The surgery usually sends a text with a link a few minutes before. You don't need to install anything.", ""],
      ["Charge your phone, sit somewhere quiet and bright, and have your glasses and a list of questions ready.", ""],
      ["When the text arrives, touch the link, then “Allow” for camera and microphone.", "You see yourself, then the doctor joins."],
      ["Hold the phone at face height, or prop it up.", ""],
    ],
  }),
];
