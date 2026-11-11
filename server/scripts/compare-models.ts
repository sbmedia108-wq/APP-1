// Ask two Claude models the same everyday questions and compare the guides.
//
// Run from the server folder:
//   npx tsx scripts/compare-models.ts
// It writes model-comparison.html (open it in a browser) and model-comparison.json.
// It costs real money: about £1 for the stronger model and a penny or two for Haiku.

import { writeFileSync } from "node:fs";
import { makeGuideDetailed } from "../src/claude.js";

const MODELS = [
  { id: "claude-opus-5-5", name: "Claude Opus 5.5 (now)", inPerM: 4, outPerM: 20 },
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5 (cheaper)", inPerM: 0.1, outPerM: 0.5 },
];
const USD_TO_GBP = 0.78; // approximate

// Real-sounding questions, including plenty the built-in guides don't cover,
// some vague ones, mis-heard words, scams and out-and-about machines.
const QUESTIONS = [
  "can you show me how to open an image or picture on an email",
  "my grandson wants roblox for christmas how do I buy it for him",
  "how do I put money on my grandson's xbox",
  "the telly's gone all green and purple",
  "netflix!",
  "my kindle won't turn on",
  "how do I video call my sister in australia on whats app",
  "the ring doorbell keeps saying offline",
  "how do I get my photos off my old phone onto my new one",
  "i keep getting texts saying my parcel couldn't be delivered pay one pound forty five",
  "a man rang saying he's from BT and my internet's been hacked he wants me to download something",
  "how do I use the self check in at the hospital",
  "how do I top up my oyster card on the machine",
  "my hearing aids keep disconnecting from my phone",
  "how do I turn off the thing that reads everything out loud on my phone, talkback",
  "my iPad keeps asking for an apple ID password",
  "I can't get the bbc eye player to work on the fire stick",
  "how do I book a train ticket online",
  "what should I do with the code the bank sent me",
  "my phone fell in the bath",
  "the printer says paper jam but there's no paper stuck",
  "how do I find my blue badge renewal online",
  "how do I order a taxi on the uber app",
  "my alexa keeps playing music I didn't ask for",
  "how do I see my grandchildren's photos on facebook",
  "I want to cancel my netflix",
  "my computer is really slow and full of pop ups",
  "how do I scan a document with my phone",
  "i've been locked out of my phone forgot the pattern",
  "the smart meter screen says something about credit",
];

const LIMIT = 4; // questions at a time

type Row = {
  q: string;
  results: Record<string, { ok: boolean; ms: number; pence: number; guide?: unknown; error?: string }>;
};

async function main() {
  const rows: Row[] = QUESTIONS.map((q) => ({ q, results: {} }));
  const jobs = rows.flatMap((row) => MODELS.map((m) => ({ row, m })));
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const { row, m } = jobs[next++];
      try {
        const { guide, usage, ms } = await makeGuideDetailed(row.q, undefined, m.id);
        const usd = (usage.input_tokens * m.inPerM + usage.output_tokens * m.outPerM) / 1e6;
        row.results[m.id] = { ok: true, ms, pence: usd * USD_TO_GBP * 100, guide };
        process.stdout.write(".");
      } catch (err) {
        row.results[m.id] = { ok: false, ms: 0, pence: 0, error: String(err) };
        process.stdout.write("x");
      }
    }
  }
  await Promise.all(Array.from({ length: LIMIT }, worker));
  console.log();

  const summary = MODELS.map((m) => {
    const rs = rows.map((r) => r.results[m.id]).filter((r) => r?.ok);
    const avg = (f: (r: (typeof rs)[number]) => number) => rs.reduce((n, r) => n + f(r), 0) / Math.max(rs.length, 1);
    return {
      model: m.name,
      answered: `${rs.length}/${rows.length}`,
      avgSeconds: (avg((r) => r.ms) / 1000).toFixed(1),
      avgPence: avg((r) => r.pence).toFixed(3),
      per1000: `£${((avg((r) => r.pence) * 1000) / 100).toFixed(2)}`,
    };
  });
  console.table(summary);
  writeFileSync("model-comparison.json", JSON.stringify({ summary, rows }, null, 2));
  writeFileSync("model-comparison.html", html(summary, rows));
  console.log("Wrote model-comparison.html and model-comparison.json");
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

function guideHtml(r: Row["results"][string] | undefined) {
  if (!r) return "<p>No answer</p>";
  if (!r.ok) return `<p class="err">Failed: ${esc(r.error)}</p>`;
  const g = r.guide as { title: string; understood: boolean; reassurance: string; clarifyingQuestion: string; choices: string[]; steps: { instruction: string; lookFor: string }[]; safetyWarning: string; whenToGetHelp: string };
  return `<p class="meta">${(r.ms / 1000).toFixed(1)} s · ${r.pence.toFixed(3)}p</p>
<h3>${esc(g.title)}</h3><p><i>${esc(g.reassurance)}</i></p>
${g.safetyWarning ? `<p class="warn">⚠️ ${esc(g.safetyWarning)}</p>` : ""}
${g.understood ? "" : `<p><b>Asks:</b> ${esc(g.clarifyingQuestion)}</p><p>${g.choices.map((c) => `<span class="chip">${esc(c)}</span>`).join(" ")}</p>`}
<ol>${g.steps.map((s) => `<li>${esc(s.instruction)}${s.lookFor ? `<br><span class="see">You'll see: ${esc(s.lookFor)}</span>` : ""}</li>`).join("")}</ol>
<p class="help">${esc(g.whenToGetHelp)}</p>`;
}

function html(summary: object[], rows: Row[]) {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ask Mavis model comparison</title>
<style>body{font-family:system-ui,sans-serif;margin:16px;background:#FDF6E8;color:#2A2522}table{border-collapse:collapse}td,th{border:1px solid #cdb487;padding:6px 10px}
.q{background:#fff;border:2px solid #E4D3B4;border-radius:12px;padding:12px;margin:16px 0}.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:700px){.cols{grid-template-columns:1fr}}.meta{color:#777;font-size:13px}.warn{background:#FDECEA;padding:6px;border-radius:6px}
.see{color:#555;font-size:14px}.chip{display:inline-block;border:1px solid #1F5FBF;border-radius:12px;padding:2px 8px;margin:2px}.err{color:#B3261E}.help{font-size:14px;color:#555}</style>
<h1>Which model writes better guides?</h1>
<table><tr>${Object.keys(summary[0]).map((k) => `<th>${k}</th>`).join("")}</tr>${summary.map((s) => `<tr>${Object.values(s).map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</table>
${rows.map((r) => `<div class="q"><h2>“${esc(r.q)}”</h2><div class="cols">${MODELS.map((m) => `<div><h4>${esc(m.name)}</h4>${guideHtml(r.results[m.id])}</div>`).join("")}</div></div>`).join("")}`;
}

main();
