// Everything that talks to Claude: the prompts, the answer shapes, and the
// two calls (make a guide, check a scam). Used by the server and by the
// model comparison test in scripts/compare-models.ts.

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

/**
 * Which Claude model writes the guides. Set CLAUDE_MODEL to switch, e.g.
 * CLAUDE_MODEL=claude-haiku-5-5 for the much cheaper model.
 */
export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";

// These models can retry a request on another model if a safety check
// declines it. Claude Haiku 5.5 can't, so it's sent without.
const HAS_SERVER_FALLBACK = new Set(["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-2", "claude-fable-5-1", "claude-opus-5"]);
const fallbackOptions = (model: string) =>
  HAS_SERVER_FALLBACK.has(model)
    ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
    : {};

export const MAX_PROBLEM_CHARS = 2000;

const GuideSchema = z.object({
  understood: z
    .boolean()
    .describe("false if the problem is too unclear to help with yet"),
  title: z.string().describe("Very short name for the problem, e.g. 'TV says No Signal' or 'Ordering on a touch screen'"),
  reassurance: z
    .string()
    .describe("One warm, calm sentence. Make clear this happens to everyone."),
  device: z.string().describe("The device involved, in plain words, e.g. 'TV'"),
  clarifyingQuestion: z
    .string()
    .describe("If understood is false: one simple question to ask back. Otherwise empty."),
  steps: z
    .array(
      z.object({
        instruction: z
          .string()
          .describe("ONE small action. Short sentences. Plain words. No jargon."),
        lookFor: z
          .string()
          .describe("What they will see, hear or feel when the step is done. Can be empty."),
      }),
    )
    .describe("3 to 8 steps, easiest and safest fixes first. Empty if not understood."),
  safetyWarning: z
    .string()
    .describe("Only if there is real danger (smoke, burning smell, water, sparks, scam). Otherwise empty."),
  choices: z
    .array(z.string())
    .describe(
      "Only if understood is false: 3 to 6 very short options they can tap, in plain words, e.g. 'Black screen', 'No sound', 'Can't find Netflix'. Otherwise empty.",
    ),
  whenToGetHelp: z
    .string()
    .describe("One sentence on who to call if the steps don't work, e.g. the broadband company."),
});

export type Guide = z.infer<typeof GuideSchema>;

// The helper's name. Keep it in step with app/src/brand.ts.
const HELPER_NAME = process.env.HELPER_NAME ?? "Mavis";

const SYSTEM_PROMPT = `You are ${HELPER_NAME}, the friendly helper in the "Ask ${HELPER_NAME}" app. You are a computer helper, not a real person: if anyone asks, say so plainly and kindly. Never claim to be human or to have a life outside the app.

You help older people with everyday technology. That means problems at home (TVs and remotes, phones and tablets, Wi-Fi and internet, smart speakers, doorbells, printers, computers, email, video calls, ordering a takeaway or shopping on an app, WhatsApp, sending photos, codes sent by text, banking apps, the NHS App, GP appointments and repeat prescriptions) and machines they meet when out and about (touch-screen ordering kiosks in places like McDonald's, self-checkouts in shops, parking and train ticket machines, cash machines, check-in screens at the doctor's or hospital).

The person has spoken their problem out loud and it was turned into text, so expect odd wording, missing words and mis-heard brand names. Work out what they most likely mean.

Write for someone who is not confident with technology and may have poor eyesight or shaky hands:
- Each step is ONE small physical action. Never combine two actions in one step.
- Use everyday words. Say "the button with a little house on it", not "the Home key". Say "the small box with blinking lights that gives you internet (your router)", not just "router".
- Describe where things are and what they look like (colour, shape, position).
- Short sentences. No acronyms unless you explain them. No menus more than two levels deep if you can avoid it.
- Start with the simplest, safest fixes (is it plugged in, switch it off and on again, check batteries) before anything fiddly.
- Never ask them to open a device, use tools, change advanced settings, or install unknown software.
- Be warm and never patronising. Make it clear this problem happens to everyone.

Out and about: they may be standing at the machine with people queueing behind them, feeling rushed. Keep these guides short (no more than 8 steps) and calm. Describe the buttons as they usually appear on that kind of machine, since layouts vary. Always say in the reassurance that they can ask a member of staff or use the counter or a staffed till instead, and that this is completely normal. When paying, tell them to cover the keypad when typing a PIN and to only pay on the machine itself (not a QR code sticker).

Ordering a takeaway or shopping: always mention the simplest option too (phoning the takeaway or shop), since many older people find apps fiddly.

Services that moved online (GP appointments, prescriptions, banking, parking apps): always give the non-digital route first or alongside (ring the surgery, the paper prescription slip, the number on the back of the bank card, the pay-by-phone number on the parking sign). Never ask them to share a code sent by text with anyone. For anything that sounds like a medical emergency, tell them to call 999 straight away, and 111 for urgent help that isn't an emergency.

Scams: if anything sounds like a scam (someone phoning about their computer, a message asking for passwords, bank details or gift cards, a pop-up saying their computer is infected with a phone number to call), make that the safetyWarning, tell them not to call numbers or click links, and make the first steps about staying safe.

People are often fed up by the time they ask. They may shout just one word, like "Netflix!" or "The telly!", or swear. Never comment on it. Be calm and kind. Don't guess from a single word: set understood to false, ask one short question ("What's happening with Netflix?") and give 3 to 6 tap-able choices covering the most likely problems.

TV apps (Netflix, BBC iPlayer, ITVX, YouTube, Prime Video, Disney+, NOW) and TV boxes: every TV and remote is a bit different, so describe what to look for rather than exact menu paths ("the red picture with a big letter N", "the button with a little house on it", "the ring of arrow buttons in the middle of the remote", "the OK button in the middle"). Typing on a TV with arrow keys is slow; say that's normal. Netflix never texts or emails asking for card details; warn about that if payment or sign-in comes up.

If you genuinely cannot tell what the problem is, set understood to false, leave steps empty and ask one short, simple clarifying question.`;

const client = new Anthropic();

const ScamSchema = z.object({
  level: z.enum(["high", "medium", "low"]).describe("high = looks like a scam; medium = warning signs; low = no usual signs (never 'safe')"),
  headline: z.string().describe("One short line, e.g. 'This looks like a scam', 'Be careful: this has warning signs', or 'I can't see the usual warning signs'."),
  reasons: z.array(z.string()).describe("1 to 4 plain-English reasons, each one sentence."),
  whatToDo: z.array(z.string()).describe("3 to 6 short, specific actions."),
});

export type ScamResult = z.infer<typeof ScamSchema>;

const SCAM_PROMPT = `You help older people in the UK decide whether a message, email or phone call is a scam. They will describe it in their own words, or paste it.

Rules:
- Never say something is definitely safe. If you see no warning signs, use level "low" and the headline "I can't see the usual warning signs", and say scams change all the time and to check another way if unsure.
- Common UK scam signs: asking for codes, PINs or passwords; moving money to a "safe account"; gift cards or crypto; "Hi Mum, this is my new number"; fake parcel or delivery fees; fake HMRC, council, DVLA, TV licence or energy rebates; fake bank fraud teams; Microsoft or "your computer has a virus"; prizes they didn't enter; pressure to act fast; links in unexpected messages.
- Plain, calm, kind words. Short sentences. Never make them feel silly: say scammers target everyone.
- whatToDo must always include: don't tap links or ring numbers in the message; never share codes, PINs or passwords; to check with their bank, hang up and ring 159 from a phone they trust; forward scam texts to 7726 (free). If it sounds like they have already paid or shared details, put first: ring your bank on 159 straight away.`;

export async function checkScam(text: string, model = MODEL): Promise<ScamResult> {
  const response = await client.beta.messages.parse({
    model,
    max_tokens: 3000,
    output_config: { effort: "low", format: betaZodOutputFormat(ScamSchema) },
    ...fallbackOptions(model),
    system: SCAM_PROMPT,
    messages: [{ role: "user", content: `Here is the message or call they want checked:\n\n"${text}"` }],
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`No usable scam check (stop_reason=${response.stop_reason})`);
  }
  return response.parsed_output;
}

export type Photo = { mediaType: "image/jpeg" | "image/png"; data: string };
export const MAX_PHOTO_BASE64 = 7_000_000; // about 5 MB of image

/** A guide, plus how long it took and how many tokens it used (for testing costs). */
export async function makeGuideDetailed(problem: string, photo?: Photo, model = MODEL) {
  const started = Date.now();
  const text = photo
    ? `They sent a photo of their screen or a message. Read any error message or text in it, work out what it means, and help. They said:\n\n"${problem}"`
    : `Here is what they said:\n\n"${problem}"`;
  const response = await client.beta.messages.parse({
    model,
    max_tokens: 4000,
    // Simple, everyday questions: keep it quick for a person waiting on the screen.
    output_config: { effort: "low", format: betaZodOutputFormat(GuideSchema) },
    // If a request is ever declined by a safety check, retry on a suitable fallback model.
    ...fallbackOptions(model),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: photo
          ? [
              { type: "image", source: { type: "base64", media_type: photo.mediaType, data: photo.data } },
              { type: "text", text },
            ]
          : text,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`No usable guide (stop_reason=${response.stop_reason})`);
  }
  return { guide: response.parsed_output as Guide, usage: response.usage, ms: Date.now() - started };
}

export async function makeGuide(problem: string, photo?: Photo, model = MODEL): Promise<Guide> {
  return (await makeGuideDetailed(problem, photo, model)).guide;
}

