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

async function makeGuide(problem: string): Promise<Guide> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    // Simple, everyday questions: keep it quick for a person waiting on the screen.
    output_config: { effort: "low", format: betaZodOutputFormat(GuideSchema) },
    // If a request is ever declined by a safety check, retry on a suitable fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Here is what they said:\n\n"${problem}"` }],
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

async function readBody(req: http.IncomingMessage): Promise<string> {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 20_000) throw new Error("Body too large");
  }
  return data;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });

  if (req.method === "POST" && req.url === "/api/help") {
    try {
      const { problem } = JSON.parse(await readBody(req)) as { problem?: unknown };
      if (typeof problem !== "string" || !problem.trim()) {
        return send(res, 400, { error: "Please describe the problem." });
      }
      const guide = await makeGuide(problem.trim().slice(0, MAX_PROBLEM_CHARS));
      return send(res, 200, { guide });
    } catch (err) {
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
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Ask Mavis server listening on http://localhost:${PORT}`);
});
