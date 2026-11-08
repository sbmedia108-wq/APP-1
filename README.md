# Easy Tech Help

A phone app for older people who get stuck with technology, at home and when out and about: the TV, the remote, Wi-Fi, phones and tablets, printers, smart speakers, video calls, scams, and the touch-screen machines in restaurants, shops and car parks.

They tap one big button and **say what's wrong in their own words**. The app works out the problem and walks them through the fix **one small step at a time**, in plain language, with large text, and reads every step out loud. Nobody has to phone a grandchild and feel silly.

## How it works

1. **Tap and tell me.** A big microphone button turns speech into text, using the phone's own speech recogniser. There's also a box to type in, and picture buttons for common problems.
2. **"Is this right?"** The app shows what it heard, so they can check it or change it.
3. **Working it out.** The text goes to a small server, which asks Claude to turn it into a very simple guide: short steps, one action each, what you should see after each one, and a warning if something looks dangerous or like a scam.
4. **One step at a time.** Big text, a progress bar, a "Done – next step" button that stays at the bottom of the screen, "Read it to me again", and "Go back a step".
5. **Did that fix it?** If yes, they get a "Well done!". If no, the app says who to contact, for example the broadband company, and shows a **Call [name]** button for a family member they've saved in Settings.

**"What's happening?" picker:** people often just shout one word when they're fed up, like "Netflix!" or "The telly!". The app doesn't guess. It says *"No problem, let's sort it out. What's happening with Netflix?"* and shows a few huge picture buttons, like "I can't find it on the TV", "It's stuck or keeps loading" or "Words at the bottom of the screen". One tap opens the right guide. There are pickers for the TV, Netflix and other TV apps (BBC iPlayer, ITVX, YouTube, Prime Video...), and phones and tablets. The Claude helper does the same: for vague messages it asks one question with tap-able choices.

**Built-in guides:** 21 common problems are built into the app. *At home*: TV no picture, no sound, remote, Netflix and TV apps (getting to them, stuck or loading, passwords and payments, finding a programme, subtitles), Wi-Fi, frozen phone, charging, scams, printer, passwords, video calls, small text, smart speakers, and ordering a takeaway to your home. *Out and about*: ordering screens (like the ones in McDonald's), self-checkouts, and parking and ticket machines. If the phone is offline or the server isn't set up, the app matches what they said against these guides, so it always has something to offer.

**Practice mode:** a pretend takeaway ordering screen ("Corner Grill", a made-up takeaway) with a coach at the top that says what to touch next and highlights it. People can practise ordering a cheeseburger and a cup of tea, paying by card, and getting an order number, at home with no queue and no pressure. See `demo/practice-mode.png`.

**Settings:** text size (Big, Bigger, Biggest), reading aloud on or off, and a helper's name and phone number.

## Project layout

```
app/      Expo (React Native) phone app – iOS, Android and web
  App.tsx              All screens (home, confirm, guide, settings…)
  src/useVoice.ts      Speech-to-text (expo-speech-recognition)
  src/api.ts           Calls the server, falls back to built-in guides
  src/offlineGuides.ts Hand-written guides + keyword matching
  src/tvAppGuides.ts   Netflix and TV app guides
  src/triage.ts        "What's happening?" picker for one-word problems
  src/PracticeKiosk.tsx Pretend takeaway ordering screen with a coach
  src/ui.tsx           Big buttons, high-contrast colours, scalable text
server/   Small Node server that calls the Claude API
  src/server.ts        POST /api/help  { problem } -> { guide }
```

The Anthropic API key stays on the server and is never put inside the phone app.

## Running it

### 1. Start the server

```bash
cd server
npm install
export ANTHROPIC_API_KEY=sk-ant-...      # from console.anthropic.com
npm start                                # listens on http://localhost:8787
```

### 2. Start the app

```bash
cd app
npm install
# Use your computer's local IP address so a real phone can reach the server:
EXPO_PUBLIC_API_URL=http://192.168.1.20:8787 npx expo start
```

**Voice input needs a development build.** Expo Go doesn't include the speech recognition module. Build one with:

```bash
npx expo run:ios        # or: npx expo run:android
# or with EAS: npx eas build --profile development
```

In Expo Go the app still works: the big button shows a message, and people can type, or use the microphone key on the phone's keyboard.

You can also try it in a web browser with `npx expo start --web`. Voice works in Chrome.

## Ideas for next steps

- Let them **take a photo** of the screen or error message and send it with their question.
- Allow **follow-up questions** at any step ("I can't find that button").
- **Remember their devices** (for example "Samsung TV, BT broadband") so the steps are more specific.
- Send a **"Mum needed help with the TV"** text to a family member, if they turn that on.
- Deploy the server (Render, Fly.io, Railway, etc.), add rate limiting, and publish with EAS.
