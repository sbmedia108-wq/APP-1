# Ask Mavis short videos (9:16)

Seven vertical videos, 1080 × 1920, 30 frames a second, for Instagram and Facebook Reels, TikTok, Stories and YouTube Shorts.

| File | What it sells | Length |
|---|---|---|
| ask-mavis-reel-1-is-this-a-scam.mp4 | "Is this a scam?" checker and the 159 button | 27 s |
| ask-mavis-reel-2-practise-ordering-screens.mp4 | Practice mode: the pretend takeaway ordering screen | 29 s |
| ask-mavis-reel-3-daily-brain-teaser.mp4 | Today's brain teaser: stars, streaks and badges | 29 s |
| ask-mavis-reel-4-everyday-life.mp4 | Booking the doctor, prescriptions, parking | 25 s |
| ask-mavis-reel-5-what-is.mp4 | "What is…?" plain-English explanations of tech words | 24 s |
| ask-mavis-reel-6-hi-mum-scam.mp4 | A tip video: the "Hi Mum, new number" scam and what to do | 25 s |
| ask-mavis-reel-7-showcase.mp4 | A fast app showcase: tilted wall of phones, one phone with changing keywords (Simple, Calm, Safe, Friendly), a fan and a sliding row of screens, bold word captions and a backing track | 34 s |

Each scene has a big headline, so the videos still make sense with the sound off. The phone screens are drawn to match the app, and their wording is copied from the app's own screens. The voice is "Emma" (Kokoro-82M, Apache-2.0), and the chimes are the app's own sounds from `app/assets/sounds/`.

The texts in videos 1 and 6 are made up. The phone numbers (07700 900123 and 07700 900456) are from the range Ofcom keeps for TV and film, and the link uses `.example`, so they can't reach a real person or website.

## Making them again

Everything is in `source/`:

- `scripts.json`: the voiceover lines.
- `tts.py`: records each line with the Kokoro voice (needs `pip install kokoro-onnx soundfile`, the `kokoro-v1_0_fp16.onnx` model and the `bf_emma` voice file next to it). It expects the voice at `pack/kokoro-voices/bf_emma.pt`, trims the silence from each line, and re-tries a line at a slightly different speed if the model returns broken audio. Run it as `python3 tts.py scripts.json wav`.
- `videos.mjs`: the scenes, headlines and phone screens for each video.
- `common.css`: the look (colours, phone frame, animations).
- `build.mjs`: draws every frame with Playwright and joins the frames, voice and sounds with ffmpeg. It needs `npm i @fontsource/merriweather` in the same folder, and the voice files in `wav/`.

```bash
node build.mjs /path/to/APP-1            # all of them
node build.mjs /path/to/APP-1 reel_scam  # just one
node build.mjs /path/to/APP-1 --still    # one picture per scene, to check the layout
```

`ask-mavis-reel-7-showcase-lily-voice.mp4` is the same showcase video read by "Lily" (bf_lily), another British voice from the same Kokoro-82M model (Apache-2.0). To record any script with her, add the voice name: `python3 tts.py scripts.json wav bf_lily`, with `bf_lily.pt` in `pack/kokoro-voices/`.

The showcase video (`promo_showcase` in `videos.mjs`) also uses `music.wav`, a simple backing track made by `source/make_music.py`. It is generated from scratch, so there is no licence to worry about.
