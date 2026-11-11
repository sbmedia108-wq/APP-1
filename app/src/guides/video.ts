import { g } from "../guideKit";

export const VIDEO_GUIDES = [
  g({
    id: "video-zoom-join",
    cat: "calls",
    emoji: "🎦",
    label: "Join a Zoom or Teams call",
    title: "Join a Zoom, Teams or Google Meet call from a link",
    words: ["zoom", "join zoom", "teams meeting", "microsoft teams", "google meet", "meeting link", "join a meeting", "online meeting", "church on zoom", "club meeting online"],
    steps: [
      ["Find the email or message with the link. Touch the link.", ""],
      ["If it asks, install the app (Zoom or Teams) from the Play Store, then touch the link again.", ""],
      ["Type your name when asked, and touch “Join”.", ""],
      ["Touch “Allow” for the camera and microphone.", "You see the others, or a waiting room message."],
      ["If people can't hear you, touch the microphone 🎤 at the bottom so it doesn't have a line through it.", ""],
    ],
  }),
  g({
    id: "video-no-sound-picture",
    cat: "calls",
    emoji: "🔇",
    label: "Can't be seen or heard on a call",
    title: "On a video call, they can't hear you or see you",
    words: ["they can't hear me", "they can't see me", "camera not working on call", "microphone muted", "black screen on video call", "my camera is off", "can't hear them on video call"],
    steps: [
      ["Tap the screen once so the buttons appear.", ""],
      ["If the microphone 🎤 has a line through it, touch it to unmute.", ""],
      ["If the camera 📹 has a line through it, touch it to turn the camera on.", ""],
      ["Can't hear them? Press the volume up button on the side.", ""],
      ["Still not working: end the call and call back.", ""],
    ],
  }),
];
