// Tiny HTTP server for the "Ask Mavis" app.
//
// The phone app sends what the person said ("my telly has gone all blue and
// says no signal") and gets back a short, very simple step-by-step guide.
// The Anthropic API key lives here on the server, never inside the phone app.

import http from "node:http";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = "claude-opus-5-5";
const MAX_PROBLEM_CHARS = 2000;

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

async function checkScam(text: string): Promise<ScamResult> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 3000,
    output_config: { effort: "low", format: betaZodOutputFormat(ScamSchema) },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SCAM_PROMPT,
    messages: [{ role: "user", content: `Here is the message or call they want checked:\n\n"${text}"` }],
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`No usable scam check (stop_reason=${response.stop_reason})`);
  }
  return response.parsed_output;
}

const AnswerSchema = z.object({
  term: z.string().describe("The thing being explained, e.g. 'Bluetooth'"),
  emoji: z.string().describe("One fitting emoji"),
  short: z.string().describe("1-2 short sentences: what it is, in everyday words, no jargon"),
  more: z.string().describe("1-2 short sentences: what people use it for, or an everyday comparison"),
  tip: z.string().describe("An optional safety tip if relevant (scams, privacy), otherwise empty"),
});

const EXPLAIN_PROMPT = `You are ${HELPER_NAME}, explaining technology words to older people in the UK who are new to it. They may ask "what is AI?", "what's the cloud?", "what does streaming mean?".

Explain like a kind, patient grandchild: plain words, short sentences, an everyday comparison where it helps, never condescending. British spelling and examples (BBC iPlayer, NHS, Royal Mail). Be accurate and brief. Add a safety tip only if it genuinely helps (for example about scams or sharing details). If the question isn't about technology, still answer briefly and kindly.`;

async function explainTerm(question: string) {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: "low", format: betaZodOutputFormat(AnswerSchema) },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: EXPLAIN_PROMPT,
    messages: [{ role: "user", content: question }],
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`No usable explanation (stop_reason=${response.stop_reason})`);
  }
  const a = response.parsed_output;
  return { ...a, tip: a.tip || undefined };
}

type Photo = { mediaType: "image/jpeg" | "image/png"; data: string };
const MAX_PHOTO_BASE64 = 7_000_000; // about 5 MB of image

async function makeGuide(problem: string, photo?: Photo): Promise<Guide> {
  const text = photo
    ? `They sent a photo of their screen or a message. Read any error message or text in it, work out what it means, and help. They said:\n\n"${problem}"`
    : `Here is what they said:\n\n"${problem}"`;
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    // Simple, everyday questions: keep it quick for a person waiting on the screen.
    output_config: { effort: "low", format: betaZodOutputFormat(GuideSchema) },
    // If a request is ever declined by a safety check, retry on a suitable fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
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
  return response.parsed_output;
}

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

async function readBody(req: http.IncomingMessage, limit = 20_000): Promise<string> {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > limit) throw new Error("Body too large");
  }
  return data;
}

function sendError(res: http.ServerResponse, err: unknown) {
  if (err instanceof Anthropic.RateLimitError) {
    return send(res, 429, { error: "Busy right now, please try again in a minute." });
  }
  if (err instanceof Anthropic.APIError) {
    console.error("Anthropic API error", err.status, err.message);
    return send(res, 502, { error: "Could not reach the helper service." });
  }
  console.error(err);
  return send(res, 500, { error: "Something went wrong." });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });

  if (req.method === "POST" && req.url === "/api/help") {
    try {
      const { problem, photo } = JSON.parse(await readBody(req, MAX_PHOTO_BASE64 + 20_000)) as {
        problem?: unknown;
        photo?: Partial<Photo>;
      };
      if (typeof problem !== "string" || !problem.trim()) {
        return send(res, 400, { error: "Please describe the problem." });
      }
      let image: Photo | undefined;
      if (photo) {
        const okType = photo.mediaType === "image/jpeg" || photo.mediaType === "image/png";
        if (!okType || typeof photo.data !== "string" || !photo.data || photo.data.length > MAX_PHOTO_BASE64) {
          return send(res, 400, { error: "That photo couldn't be used. Please try a smaller one." });
        }
        image = { mediaType: photo.mediaType as Photo["mediaType"], data: photo.data };
      }
      const guide = await makeGuide(problem.trim().slice(0, MAX_PROBLEM_CHARS), image);
      return send(res, 200, { guide });
    } catch (err) {
      return sendError(res, err);
    }
  }

  if (req.method === "POST" && req.url === "/api/explain") {
    try {
      const { question } = JSON.parse(await readBody(req)) as { question?: unknown };
      if (typeof question !== "string" || !question.trim()) {
        return send(res, 400, { error: "Please ask a question." });
      }
      const answer = await explainTerm(question.trim().slice(0, 500));
      return send(res, 200, { answer });
    } catch (err) {
      return sendError(res, err);
    }
  }

  if (req.method === "POST" && req.url === "/api/scam-check") {
    try {
      const { text } = JSON.parse(await readBody(req)) as { text?: unknown };
      if (typeof text !== "string" || !text.trim()) {
        return send(res, 400, { error: "Please say what the message or call said." });
      }
      const result = await checkScam(text.trim().slice(0, MAX_PROBLEM_CHARS));
      return send(res, 200, { result });
    } catch (err) {
      return sendError(res, err);
    }
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Ask Mavis server listening on http://localhost:${PORT}`);
});
