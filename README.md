# Jarvis — a voice assistant that controls your Android phone

Talk to your phone and it does things: opens apps, makes calls, sends texts, sets alarms and
timers, toggles the flashlight, changes volume and brightness, goes home or back, scrolls,
taps buttons by name, types for you, takes screenshots, locks the screen, plays music,
navigates and searches the web.

Unlike apps that only work while they're open, Jarvis runs as a **foreground service**. It
keeps going with the app closed and the screen off, and shows a small notification while it does.

> **Android only.** iPhones don't let any third-party app open other apps, tap on screen,
> or listen in the background, so an app like this can't be built for iOS. On iPhone the
> nearest thing is Siri and Shortcuts.

## Ways to talk to it

| How | What happens |
|---|---|
| Big mic button in the app | Listens for one command |
| **"Ask Jarvis" Quick Settings tile** | Swipe down, tap the tile, speak. Works from any app |
| "Talk" button on the notification | Same, from the notification shade |
| **Always listening** switch | Say *"Jarvis, open Spotify"* at any time, hands-free |
| Headset button / assist gesture | Starts listening if your phone sends these to Jarvis |

## What you can say

- **Apps:** "open WhatsApp", "launch YouTube", "go to bbc.co.uk"
- **Phone control:** "go home", "go back", "recent apps", "notifications", "quick settings",
  "take a screenshot", "lock the phone", "power menu"
- **On screen:** "scroll down", "tap Subscribe", "click Next", "type hello there"
- **Calls & texts:** "call Mum", "text Sam saying I'm on my way"
- **Time:** "set an alarm for 6:45 am", "set a timer for 10 minutes", "what time is it"
- **Settings:** "flashlight on", "volume up", "volume 40 percent", "mute", "brightness 70",
  "turn on Wi-Fi" (opens the Wi-Fi panel; Android doesn't let apps flip it directly)
- **Media:** "play Drake on Spotify", "play lo-fi on YouTube", "pause", "next song"
- **Maps & web:** "navigate to the airport", "search for pizza near me"
- **Chains:** "open WhatsApp then tap Chats"
- "battery level", "help", "stop listening"

All of these work **offline, with no account**.

### Smart mode (optional)

Paste a Claude API key (from [console.anthropic.com](https://console.anthropic.com)) into the
app. Then anything the built-in commands don't recognise goes to Claude, which can understand
any wording, answer questions, and plan multi-step tasks ("open Gmail and search for my flight
confirmation"). To do that, the app sends Claude your request, your list of installed app
names, and the text labels on your current screen. API usage is billed to your key. The key
is stored in the app's private storage on your phone.

## Install it

### 1. Get the APK
Every push to this repo builds the app on GitHub Actions:

1. Open the repo on GitHub → **Actions** → the latest **Build Jarvis APK** run.
2. Download the **jarvis-apk** artifact (a zip) and unzip it to get `app-debug.apk`.
3. Send it to your phone (Google Drive, email, or USB) and open it. Allow "install unknown apps"
   when Android asks.

Or build it yourself with Android Studio: open this folder and press Run, or run
`./gradlew assembleDebug`.

### 2. Set it up (one time, in the app)
1. **Grant permissions:** microphone, contacts, calls, SMS, notifications.
2. **Turn on phone control:** this opens Accessibility settings. Find **Jarvis** and switch it on.
   Jarvis needs this to go home or back, tap, scroll, type, lock the screen, take screenshots,
   and open apps while it's in the background.
   - *Android 13+ shows "Restricted setting"?* That happens to apps installed outside the Play
     Store. Go to **Settings → Apps → Jarvis → ⋮ (top right) → Allow restricted settings**,
     then try again.
3. **Allow brightness control** (optional).
4. **Battery:** let Jarvis run unrestricted so Android doesn't kill it. On Samsung, Xiaomi
   and similar phones, also turn off battery optimisation for Jarvis in that phone's own
   battery settings.
5. Add the **Ask Jarvis** tile: swipe down twice → pencil/edit → drag the tile in.

## Things to know

- **Always-listening mode** uses Android's built-in speech recogniser in a loop. It works on
  any phone but uses noticeably more battery than one-shot mode. Turn on "Silence the
  listening beep" to stop the mic chime. This also mutes notification sounds while Jarvis
  is waiting for its name.
- After a reboot, open Jarvis once to start always-listening again. Android doesn't allow
  apps to switch the microphone on by themselves at boot.
- Texts are **sent straight away** when SMS permission is granted, and Jarvis reads back
  who it sent to. Without the permission it fills in the message for you to tap Send.
- Some phones need the Google app installed and enabled for speech recognition.

## Project layout

```
app/src/main/java/com/jarvis/assistant/
  AssistantService.kt          foreground service: mic, wake word, speech-to-text, text-to-speech
  CommandParser.kt             offline command understanding (unit-tested)
  PhoneActions.kt              performs each action (calls, alarms, torch, volume, intents…)
  JarvisAccessibilityService.kt  home/back/recents/lock/screenshot, tap by text, scroll, type
  ClaudeBrain.kt               optional smart mode via the Claude API (Anthropic Java SDK)
  AppIndex.kt                  fuzzy "open <app name>" matching, background-safe launching
  MainActivity.kt              setup screen
  ListenActivity.kt / ListenTileService.kt   tile, notification and assist entry points
app/src/test/…/CommandParserTest.kt
.github/workflows/android.yml  builds the APK on every push
```
