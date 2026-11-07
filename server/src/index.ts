/**
 * Graft Quote API
 *
 * A tiny HTTP service that turns a tradesperson's spoken job description
 * into a structured, priced quote using Claude. The mobile app calls this
 * so the Anthropic API key never ships inside the app binary.
 *
 *   POST /v1/quote/parse   { transcript, profile, similarJobs }  ->  ParsedQuote
 *   POST /v1/receipt/parse { imageBase64, mediaType }       ->  ParsedReceipt
 *   GET  /health
 *
 * Run:  ANTHROPIC_API_KEY=... npm start   (listens on $PORT, default 8787)
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const MODEL = "claude-opus-5-5";
const PORT = Number(process.env.PORT ?? 8787);
const APP_TOKEN = process.env.GRAFT_APP_TOKEN; // optional shared secret checked on every request

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  transcript: z.string().min(3).max(20_000),
  profile: z
    .object({
      trade: z.string().optional(),
      dayRate: z.number().optional(),
      hourlyRate: z.number().optional(),
      markupPct: z.number().optional(),
      region: z.string().optional(),
    })
    .default({}),
  similarJobs: z
    .array(
      z.object({
        title: z.string(),
        total: z.number(),
        date: z.string(),
        items: z.array(z.object({ description: z.string(), qty: z.number(), unit: z.string(), unitPrice: z.number() })),
      }),
    )
    .max(5)
    .default([]),
});

const ParsedQuoteSchema = z.object({
  title: z.string(),
  trade: z.string(),
  client: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  items: z.array(
    z.object({
      kind: z.enum(["labour", "material", "other"]),
      description: z.string(),
      qty: z.number(),
      unit: z.string(),
      unitPrice: z.number(),
    }),
  ),
  estimatedDays: z.number(),
  notes: z.string(),
  assumptions: z.array(z.string()),
});
export type ParsedQuote = z.infer<typeof ParsedQuoteSchema>;

// JSON Schema handed to the API's structured-output mode (mirrors ParsedQuoteSchema).
const str = { type: "string" } as const;
const num = { type: "number" } as const;
const OUTPUT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "trade", "client", "items", "estimatedDays", "notes", "assumptions"],
  properties: {
    title: str,
    trade: str,
    client: {
      type: "object",
      additionalProperties: false,
      required: ["name", "phone", "address"],
      properties: { name: str, phone: str, address: str },
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "description", "qty", "unit", "unitPrice"],
        properties: {
          kind: { type: "string", enum: ["labour", "material", "other"] },
          description: str,
          qty: num,
          unit: str,
          unitPrice: num,
        },
      },
    },
    estimatedDays: num,
    notes: str,
    assumptions: { type: "array", items: str },
  },
} as const;

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the quoting assistant inside Graft, an app for UK self-employed tradespeople (fencers, landscapers, plasterers, plumbers, electricians, joiners, decorators, roofers, tilers, bricklayers) doing private domestic work.

The user has just walked a job and dictated a description, usually standing on the client's drive. Speech-to-text output is messy: expect filler words, mis-heard numbers ("for buy for" = "4x4"), and trade slang. Interpret it as an experienced UK tradesperson would.

Turn it into a clear, itemised quote:
- Split labour from materials. Labour is usually priced per day or per hour using the user's rates when given.
- Work out quantities a tradesperson would actually buy, including sensible waste (e.g. 10% on tiles, posts at 1.83m centres for 6ft panels, postcrete per post, screws/fixings as a sundries line).
- Use UK units and names (metres, m², bags, lengths, 4x4 / 100mm posts, 6ft panels, sheets of 12.5mm plasterboard, tonne bags).
- Prices are in GBP, ex-VAT, at typical UK trade-counter prices. Apply the user's materials markup if provided.
- If similar past jobs are supplied, use them as the strongest guide for rates and quantities — the user's own pricing beats your estimates.
- Leave client name/phone/address as "" unless the user actually said them.
- "notes" is a short friendly line the tradesperson would put to the client (scope, what's included, waste removal), not internal reasoning.
- "assumptions" lists anything you guessed that the user should double-check before sending (max 5, short).
Never invent extra work the user did not describe.`;

function buildUserMessage(req: z.infer<typeof RequestSchema>): string {
  const lines: string[] = [];
  const p = req.profile;
  lines.push("<profile>");
  if (p.trade) lines.push(`Trade: ${p.trade}`);
  if (p.dayRate) lines.push(`Day rate: £${p.dayRate}`);
  if (p.hourlyRate) lines.push(`Hourly rate: £${p.hourlyRate}`);
  if (p.markupPct != null) lines.push(`Materials markup: ${p.markupPct}%`);
  if (p.region) lines.push(`Area: ${p.region}`);
  lines.push("</profile>");
  if (req.similarJobs.length) {
    lines.push("<similar_past_jobs>");
    for (const j of req.similarJobs) {
      lines.push(`- ${j.title} (${j.date}) total £${j.total.toFixed(2)}`);
      for (const i of j.items) lines.push(`    ${i.qty} ${i.unit} ${i.description} @ £${i.unitPrice}`);
    }
    lines.push("</similar_past_jobs>");
  }
  lines.push("<dictation>", req.transcript, "</dictation>");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Claude call
// ---------------------------------------------------------------------------

async function parseQuote(input: z.infer<typeof RequestSchema>): Promise<ParsedQuote> {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    // Server-side fallback: if a request is declined, the API re-runs it on a suitable model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low", // short, well-specified extraction — keep it fast for a user stood on a driveway
      format: { type: "json_schema", schema: OUTPUT_JSON_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  if (response.stop_reason === "refusal") throw new HttpError(422, "The request could not be processed.");
  if (response.stop_reason === "max_tokens") throw new HttpError(502, "Quote was too long to generate.");

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return ParsedQuoteSchema.parse(JSON.parse(text));
}

// ---------------------------------------------------------------------------
// Receipts: read a photo of a merchant receipt / invoice into structured data
// ---------------------------------------------------------------------------

const ReceiptRequestSchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
});

const ReceiptSchema = z.object({
  isReceipt: z.boolean(),
  supplier: z.string(),
  supplierBranch: z.string(),
  supplierVatNumber: z.string(),
  date: z.string(),
  reference: z.string(),
  items: z.array(z.object({ description: z.string(), qty: z.number(), unit: z.string(), unitPrice: z.number(), total: z.number() })),
  subtotal: z.number(),
  vat: z.number(),
  total: z.number(),
  pricesIncludeVat: z.boolean(),
  paymentMethod: z.string(),
  unreadable: z.array(z.string()),
});
export type ParsedReceipt = z.infer<typeof ReceiptSchema>;

const RECEIPT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["isReceipt", "supplier", "supplierBranch", "supplierVatNumber", "date", "reference", "items", "subtotal", "vat", "total", "pricesIncludeVat", "paymentMethod", "unreadable"],
  properties: {
    isReceipt: { type: "boolean" },
    supplier: str, supplierBranch: str, supplierVatNumber: str,
    date: { type: "string", description: "ISO date YYYY-MM-DD, or empty if not shown" },
    reference: { type: "string", description: "Receipt, invoice or transaction number" },
    items: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["description", "qty", "unit", "unitPrice", "total"],
        properties: { description: str, qty: num, unit: str, unitPrice: num, total: num },
      },
    },
    subtotal: num, vat: num, total: num,
    pricesIncludeVat: { type: "boolean", description: "True if item prices on the receipt already include VAT (typical for retail till receipts)" },
    paymentMethod: str,
    unreadable: { type: "array", items: str, description: "Anything that couldn't be read clearly, for the user to check" },
  },
} as const;

const RECEIPT_PROMPT = `You read photos of UK builders' merchant and DIY store receipts, invoices and delivery notes (Screwfix, Toolstation, Travis Perkins, Jewson, Selco, Wickes, B&Q, local merchants, fuel and tool hire) for a self-employed tradesperson's records.

Transcribe exactly what is printed. Never invent or estimate a value: if something isn't visible, use "" or 0 and list it in "unreadable".
- items: one entry per product line. Expand abbreviated product names into readable ones only when the meaning is certain (e.g. "PSTCRT 20KG" -> "Postcrete 20kg"); otherwise keep the printed text. qty defaults to 1 if not shown. unit is "each" unless the receipt says otherwise (bag, m, pack, length).
- unitPrice/total: as printed. Set pricesIncludeVat accordingly.
- subtotal (ex VAT), vat and total: as printed. If only a total and a VAT amount are shown, subtotal = total - vat.
- If the photo is not a receipt or invoice, set isReceipt false and leave the rest empty.`;

async function parseReceipt(input: z.infer<typeof ReceiptRequestSchema>): Promise<ParsedReceipt> {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: { type: "json_schema", schema: RECEIPT_JSON_SCHEMA } },
    system: RECEIPT_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: input.mediaType, data: input.imageBase64 } },
          { type: "text", text: "Read this receipt." },
        ],
      },
    ],
  });
  if (response.stop_reason === "refusal") throw new HttpError(422, "The receipt could not be processed.");
  if (response.stop_reason === "max_tokens") throw new HttpError(502, "Receipt was too long to read.");
  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return ReceiptSchema.parse(JSON.parse(text));
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, authorization",
  });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 9_000_000) throw new HttpError(413, "Body too large");
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return send(res, 204, {});
    if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true, model: MODEL });

    if (req.method === "POST" && req.url === "/v1/quote/parse") {
      if (APP_TOKEN && req.headers.authorization !== `Bearer ${APP_TOKEN}`) throw new HttpError(401, "Unauthorised");
      const parsed = RequestSchema.safeParse(await readJson(req));
      if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Bad request");
      return send(res, 200, await parseQuote(parsed.data));
    }
    if (req.method === "POST" && req.url === "/v1/receipt/parse") {
      if (APP_TOKEN && req.headers.authorization !== `Bearer ${APP_TOKEN}`) throw new HttpError(401, "Unauthorised");
      const parsed = ReceiptRequestSchema.safeParse(await readJson(req));
      if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Bad request");
      return send(res, 200, await parseReceipt(parsed.data));
    }
    throw new HttpError(404, "Not found");
  } catch (err) {
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    if (err instanceof Anthropic.RateLimitError) return send(res, 429, { error: "Busy — try again in a moment." });
    if (err instanceof Anthropic.APIConnectionError) return send(res, 503, { error: "AI service unreachable." });
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return send(res, 502, { error: "AI service error." });
    }
    if (err instanceof z.ZodError || err instanceof SyntaxError) {
      console.error("Bad model output", err);
      return send(res, 502, { error: "Could not read the AI response." });
    }
    console.error(err);
    return send(res, 500, { error: "Internal error" });
  }
});

server.listen(PORT, () => console.log(`Graft quote API listening on :${PORT}`));
