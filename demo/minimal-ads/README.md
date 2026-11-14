# Ask Mavis minimal ads

Ads in a clean, minimal style: black or pale grey backgrounds, one big headline, one phone, very few words. The style is borrowed from premium tech adverts; nothing here uses another company's logo, name or fonts (the typeface is Inter, which is free to use).

## Stills (4:5, 1080 × 1350)

| File | Headline | Line underneath |
|---|---|---|
| ask-mavis-minimal-ad-1-say-it-sorted.png | Say it. Sorted. | Tech help, in your own words. |
| ask-mavis-minimal-ad-2-one-step-then-the-next.png | One step. Then the next. | Big writing. Read out loud. |
| ask-mavis-minimal-ad-3-scams-spotted.png | Scams, spotted. | Check any message for warning signs. |
| ask-mavis-minimal-ad-4-just-say-netflix.png | Just say "Netflix." | One word is enough. |
| ask-mavis-minimal-ad-5-practice-makes-confident.png | Practice makes confident. | A pretend ordering screen. No queue. |
| ask-mavis-minimal-ad-6-no-silly-questions.png | No silly questions. | Plain-English answers to tech words. |

## Videos (9:16, 1080 × 1920)

- `ask-mavis-minimal-video-1-say-it-sorted.mp4` (20 s): "The telly's gone funny. Again. So just say it… Sorted."
- `ask-mavis-minimal-video-2-scams-spotted.mp4` (19 s): a parcel text, "Real?", "Ask.", "This looks like a scam.", "Scams, spotted."

The voice is the same "Emma" voice as the other videos, with the app's own chimes. There is no music.

## Making them again

- Stills: `source/make.mjs` and `source/ads.css`. They reuse the phone-screen styles in `demo/reels/source/common.css`, so run `make.mjs` from a folder that sits next to a `vid` folder holding that file and `node_modules/@fontsource/merriweather`, with `logo.png` beside it and an `out` folder.
- Videos: they are the `min_sorted` and `min_scam` entries in `demo/reels/source/videos.mjs`, built the same way as the other short videos (see `demo/reels/README.md`).
