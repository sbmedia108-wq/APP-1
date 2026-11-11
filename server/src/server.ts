// Tiny HTTP server for the "Ask Mavis" app.
//
// The phone app sends what the person said ("my telly has gone all blue and
// says no signal") and gets back a short, very simple step-by-step guide.
// The Anthropic API key lives here on the server, never inside the phone app.

import http from "node:http";
import Anthropic from "@anthropic-ai/sdk";
import {
  checkScam,
  makeGuide,
  MAX_PHOTO_BASE64,
  MAX_PROBLEM_CHARS,
  MODEL,
  type Photo,
} from "./claude.js";

const PORT = Number(process.env.PORT ?? 8787);
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
  console.log(`Ask Mavis server listening on http://localhost:${PORT} (model: ${MODEL})`);
});
