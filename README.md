# Ask Mavis

A phone app for older people who get stuck with technology, at home and when out and about: the TV, the remote, Wi-Fi, phones and tablets, printers, smart speakers, video calls, scams, and the touch-screen machines in restaurants, shops and car parks.

The app is called **Ask Mavis**: a friendly computer helper with a warm, familiar name. (It is upfront that Mavis is not a real person.) The name lives in one place, `app/src/brand.ts`, plus `app/app.json` and `HELPER_NAME` on the server, so it is easy to change.

They tap one big button and **say what's wrong in their own words**. The app works out the problem and walks them through the fix **one small step at a time**, in plain language, with large text, and reads every step out loud. Nobody has to phone a grandchild and feel silly.

## How it works

1. **Tap and tell me.** A big microphone button turns speech into text, using the phone's own speech recogniser. There's also a box to type in, and picture buttons for common problems.
2. **"Is this right?"** The app shows what it heard, so they can check it or change it.
3. **Working it out.** The text goes to a small server, which asks Claude to turn it into a very simple guide: short steps, one action each, what you should see after each one, and a warning if something looks dangerous or like a scam.
4. **One step at a time.** Big text, a progress bar, a "Done – next step" button that stays at the bottom of the screen, "Read it to me again", and "Go back a step".
5. **Did that fix it?** If yes, they get a "Well done!". If no, the app says who to contact, for example the broadband company, and shows a **Call [name]** button for a family member they've saved in Settings.

**"What's happening?" picker:** people often just shout one word when they're fed up, like "Netflix!" or "The telly!". The app doesn't guess. It says *"No problem, let's sort it out. What's happening with Netflix?"* and shows a few huge picture buttons, like "I can't find it on the TV", "It's stuck or keeps loading" or "Words at the bottom of the screen". One tap opens the right guide. There are pickers for the TV, Netflix and other TV apps (BBC iPlayer, ITVX, YouTube, Prime Video...), and phones and tablets. The Claude helper does the same: for vague messages it asks one question with tap-able choices.

**Built-in guides:** 156 step-by-step guides are built into the app, in 13 sections: the TV, phone and tablet basics, calls and contacts, texts and WhatsApp, email, photos and the camera, Wi-Fi and the internet, apps, passwords and accounts, scams and staying safe, banking and shopping, the GP and health, and out and about. Each one is specific: "open a picture someone emailed you" and "send a photo by email" are separate guides, and so are "my email won't send" and "an email hasn't arrived". Between them, the guides list about 1,400 ways people describe their problem. They work with no internet, and a "Browse all the help" button lists every guide by section.

**How it finds the right guide** (`app/src/matcher.ts`):

- It fixes common speech mix-ups ("what's app" becomes WhatsApp, "net flicks" becomes Netflix) and treats words that mean the same as one word (picture, photo, pic and image).
- Rare, telling words count for more than common ones, so "open a picture on an email" finds the attachment guide, not the general email guide.
- It tells a problem from a how-to: "my email won't send" and "send an email" go to different guides.
- When two or three guides fit about equally well, it doesn't guess. It asks "Is it one of these?" with big buttons.
- It's checked against about 240 test phrases. In a 187-phrase test, 177 go straight to the right guide, 10 offer it as one of a few choices, and none go to the wrong guide.

**Better listening:** British English speech recognition, a list of tech words for the phone to listen out for (WhatsApp, iPlayer, Freeview…), more time to pause mid-sentence, and the phone's second and third guesses at the words, used when the first guess doesn't match well.

Guides for services that have moved online always give the non-digital route as well: ring the surgery, use the paper prescription slip, ring the number on the parking sign. These topics come from Age UK research showing that older people are increasingly shut out of GP appointments, banking and paying for parking as these move online.

**Practice mode:** a pretend takeaway ordering screen ("Corner Grill", a made-up takeaway) with a coach at the top that says what to touch next and highlights it. People can practise ordering a cheeseburger and a cup of tea, paying by card, and getting an order number, at home with no queue and no pressure. See `demo/practice-mode.png`.

**New safety and help features:**
- **"Is this a scam?" checker.** Say, type or paste a suspicious message or call. Mavis shows a red, amber or grey result, explains the warning signs and what to do, and has a one-tap "Ring my bank safely (159)" button. It works offline with built-in checks, and the server gives a fuller answer when it's online. It never says a message is definitely safe.
- **"Show Mavis a photo".** Take or choose a photo of a confusing screen or error message. This needs the server, so the button only appears when `EXPO_PUBLIC_API_URL` is set.
- **Today's brain teaser.** Three questions a day: a tech tip, spot the scam, and a word puzzle. They're the same all day and new tomorrow. Right answers earn stars, and there's a day streak and six badges (First go, Three days running, Scam Spotter, Tech Whizz, Full week, Star collector). Every answer comes with a kind explanation, so it's about learning, not testing.
- **Cheerful sounds.** A rising chime for a right answer, a soft and kind "not quite", a happy "well done" for milestones (finishing the daily teaser, fixing a problem, ordering in practice mode), a gentle tick for each step, and a card-reader beep in practice mode. They're made for this app, so there's no licence, and kept below about 1 kHz, where older ears hear best (age-related hearing loss mostly affects sounds above 2 kHz). The voice waits for the chime to finish, the phone's silent switch is respected, and "Play cheerful sounds" in Settings turns them off. Listen in `demo/sound-samples/`.
- **Fireworks.** When someone fixes a problem, finishes the daily teaser or completes a practice order, gentle fireworks go off with the "well done" chime. A right answer in the teaser gets a small sparkle. They fade smoothly with no flashing, last about two and a half seconds, stay clear of the words on screen and never block a tap. They still show when sounds are off, and are skipped when the phone's "Remove animations" (reduce motion) setting is on.
- **Reading speed.** Normal or Slower, in Settings.
- **"Send Sarah a text".** Next to the Call button, a ready-written "I'm stuck" text to the family helper.

**Settings:** text size (Big, Bigger, Biggest), reading aloud on or off, and a helper's name and phone number.

## Project layout

```
app/      Expo (React Native) phone app – iOS, Android and web
  App.tsx              All screens (home, confirm, guide, settings…)
  src/useVoice.ts      Speech-to-text (expo-speech-recognition)
  src/api.ts           Calls the server, falls back to built-in guides
  src/offlineGuides.ts Hand-written guides + keyword matching
  src/tvAppGuides.ts   Netflix and TV app guides
  src/everydayGuides.ts GP, prescriptions, banking, WhatsApp, photos, calls, parking apps…
  src/guides/          The rest of the 156 guides, one file per section
  src/matcher.ts       Works out which guide fits what someone said
  src/BrowseHelp.tsx   "Browse all the help" screen
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

## Demo videos

In `demo/`:

- `ask-mavis-explainer.mp4`: a 70-second narrated explainer (widescreen).
- `ask-mavis-ad-older.mp4`: a 27-second Facebook ad for older people (4:5).
- `ask-mavis-ad-family.mp4`: a 28-second Facebook ad for their grown-up children (4:5).

The voiceover lines are in `demo/voiceover-scripts.json`. The voice is "Emma" (bf_emma), a British voice from the Kokoro-82M text-to-speech model (Apache-2.0, so commercial use is allowed). Samples of the other voices are in `demo/voice-samples/`.
