# Ask Mavis: a week of posts

Seven picture posts (4:5, 1080 × 1350, for Facebook and Instagram feeds) and two short videos (9:16, in `demo/reels/`). They are tips people can use straight away, not adverts, so they are worth sharing. Copy the words under each one into the post.

Suggested hashtags for all of them: `#AskMavis #TechHelp #SilverSurfers #ScamAware #OlderAndOnline`

## Monday: Scam watch, "Hi Mum"
**Picture:** `ask-mavis-post-1-scam-watch-hi-mum.png`

> Had a text like this? 🛑
>
> "Hi Mum, I've broken my phone, this is my new number" is one of the most common scams going. It isn't your son or daughter.
>
> Don't send money. Ring them on their old number first. If they answer, you'll know.
>
> Please share this with someone who'd want to know.

*Describe the picture (alt text):* A text message reading "Hi Mum, I've broken my phone. This is my new number. Can you send £200?" with a red warning: Stop. Ring them on their old number first.

## Tuesday: Word of the week, "the cloud"
**Picture:** `ask-mavis-post-2-word-of-the-week-the-cloud.png`

> People keep saying your photos are "in the cloud". But what is it? ☁️
>
> It just means your photos and files are stored on the internet, not only on your phone. So if you lose your phone, your photos are still safe.
>
> Which tech word would you like explained next? Tell us below.

*Alt text:* Word of the week: "The cloud". It just means storing your photos and files on the internet, instead of only on your phone.

## Wednesday: Brain teaser
**Picture:** `ask-mavis-post-3-brain-teaser-aeroplane.png`

> Brain teaser time 🧠 What does the little aeroplane at the top of a phone mean?
>
> A, B or C? Pop your answer in the comments. We'll give the answer tomorrow.

Reply the next day with: *"It's B. Aeroplane mode switches off calls, texts and internet. If your phone suddenly won't ring, check for the little plane and turn it off."*

*Alt text:* Brain teaser. What does the little aeroplane at the top of a phone mean? A: You're on a plane. B: No calls or internet. C: The battery is full.

## Thursday: Worth knowing, 159
**Picture:** `ask-mavis-post-4-worth-knowing-159.png`

> Someone rings saying they're from your bank? ☎️
>
> Hang up. Then ring 159. It puts you through to your bank safely, so you know who you're really talking to.
>
> A real bank will never mind you hanging up to check.

*Alt text:* Worth knowing: 159. A call about your bank? Hang up. Ring 159. It puts you through to your bank safely.

## Friday: Telly tip
**Picture:** `ask-mavis-post-5-telly-tip-home-button.png`

> Lost on the telly and can't get back to Netflix? 📺
>
> Look for the button with a little house on the remote. That's the Home button. Press it once, and your apps appear.
>
> What's the one button on your remote you'd never dare press?

*Alt text:* Telly tip. Lost on the telly? Press the little house. It's the Home button. It shows your apps, like Netflix and BBC iPlayer.

## Saturday: Scam watch, 7726
**Picture:** `ask-mavis-post-6-scam-watch-7726.png`

> Got a dodgy text? Don't just delete it. 📲
>
> Forward it to 7726. It's free, and it helps your phone company block the scammers. On a keypad, 7726 spells SPAM.

*Alt text:* Scam watch: 7726. Forward scam texts to 7726. It's free. Easy to remember: on a keypad, it spells SPAM.

## Sunday: A kind reminder
**Picture:** `ask-mavis-post-7-no-silly-questions.png`

> Nobody is born knowing how a smart TV works. 💙
>
> If the phone, the telly or the internet has you stumped, you're not silly, and you're not alone. There are no silly questions. Just ask.

*Alt text:* A kind reminder: Nobody is born knowing how a smart TV works. There are no silly questions. Just ask.

## The two videos

**`demo/reels/ask-mavis-reel-5-what-is.mp4`** ("What is…?" explanations)

> "The cloud." "Wi-Fi." "An app." Everyone says them, nobody explains them. Ask Mavis does, in plain English, out loud. No silly questions.

**`demo/reels/ask-mavis-reel-6-hi-mum-scam.mp4`** (the "Hi Mum" scam, a tip video)

> "Hi Mum, this is my new number." Stop. Ring their old number first, then forward the text to 7726. Share this with your mum and dad.

## Before you post

- **159:** it reaches most big UK banks, but not every bank or building society has joined. If someone asks, the list is on the Stop Scams UK website.
- **"Free to download"** is on every picture and video. Change it in `source/make.mjs` (or `demo/reels/source/videos.mjs`) if that isn't right when you post.

## Making the pictures again

In `source/`: run `npm i @fontsource/merriweather`, put `ask-mavis-logo.png` there as `logo.png`, make an `out` folder, then `node make.mjs`. The words are in `make.mjs` and the look is in `posts.css`.
