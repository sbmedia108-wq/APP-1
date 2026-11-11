// Works out which built-in guide fits what someone said.
//
// How it works, in plain words:
// 1. Tidy up the words: lower case, fix common mishearings from the phone's
//    speech recogniser ("whats app" -> whatsapp, "net flicks" -> netflix),
//    and treat words that mean the same thing as one word (picture, photo,
//    pic and image are all "photo").
// 2. Score every guide. A word that appears in only a few guides (like
//    "attachment") counts for much more than a word in lots of them (like
//    "email"), so "open a picture on an email" finds the attachment guide,
//    not "send an email". Whole phrases that match count extra.
// 3. Be honest about doubt. If one guide is a clear winner, use it. If two or
//    three are close, show "Is it one of these?" instead of guessing.

export type Matchable = {
  id: string;
  title: string;
  shortLabel: string;
  keywords: string[];
  boost?: string[];
  /** Words that mean it's NOT this guide (e.g. "no machine" for the ticket machine guide). */
  unless?: string[];
};

// Mishearings and spellings, fixed before anything else. Keys are matched as
// whole words on the tidied text.
const FIXES: [RegExp, string][] = [
  [/\bwhat s app\b|\bwhats app\b|\bwhat sap\b|\bwhatsapp s\b|\bwatts app\b|\bwhat's up\b/g, "whatsapp"],
  [/\bnet flicks?\b|\bnetflicks\b/g, "netflix"],
  [/\bi player\b|\beye player\b|\bbbc player\b/g, "iplayer"],
  [/\bitv x\b|\bitv hub\b/g, "itvx"],
  [/\bwi fi\b|\bwhy fi\b|\bwifey\b|\bwi-fi\b|\bwireless\b/g, "wifi"],
  [/\bblue tooth\b/g, "bluetooth"],
  [/\byou tube\b/g, "youtube"],
  [/\bface time\b/g, "facetime"],
  [/\bface book\b/g, "facebook"],
  [/\bemailed\b|\bemailing\b/g, "email"],
  [/\be mail\b|\be mails\b|\bemails\b|\bg mail\b|\bgmail\b|\bhotmail\b|\boutlook\b|\byahoo mail\b|\binbox\b/g, "email"],
  [/\bpass word\b|\bpass code\b|\bpasscode\b/g, "password"],
  [/\bq r\b|\bqr code\b|\bq are code\b/g, "qr"],
  [/\bsim card\b/g, "sim"],
  [/\bscreen shot\b/g, "screenshot"],
  [/\bplay store\b|\bgoogle play\b|\bapp store\b/g, "playstore"],
  [/\bfree view\b/g, "freeview"],
  [/\bsky q\b|\bsky box\b/g, "sky"],
  [/\bnhs app\b/g, "nhsapp"],
  [/\bone one one\b|\b1 1 1\b/g, "111"],
  [/\bnine nine nine\b|\b9 9 9\b/g, "999"],
  [/\bhole in the wall\b|\bcash point\b|\bcashpoint\b|\bcash machine\b|\batm\b/g, "cashmachine"],
  [/\btext message\b|\btexts\b|\bsms\b/g, "text"],
  [/\bvoice notes?\b|\bvoice messages?\b|\baudio messages?\b/g, "voicenote"],
  [/\bvoice mail\b|\bvoicemail\b|\banswer phone\b|\banswerphone\b|\banswer machine\b/g, "voicemail"],
  [/\bvideo call\b|\bvideo chat\b|\bfacetime\b|\bzoom call\b/g, "videocall"],
  [/\bsmart speaker\b|\balexa\b|\becho dot\b|\bgoogle home\b/g, "smartspeaker"],
  [/\bsign in\b|\bsign into\b|\blog in\b|\blog into\b|\blog on\b|\blogin\b/g, "signin"],
  [/\bat sign\b|\bat symbol\b/g, "atsign"],
  // "won't", "can't", "not working" and friends all mean "something's wrong",
  // which tells a problem ("my email won't send") from a how-to ("send an email").
  [/\bnot working\b|\bstopped working\b/g, "broken"],
  [/\b(won t|wont|will not|doesn t|doesnt|does not|isn t|isnt|is not|can t|cant|cannot|can not|couldn t|didn t|didnt|aren t|hasn t|haven t|failed|fails|broken|not|no)\b/g, "broken"],
  [/\bhearing aids?\b/g, "hearingaid"],
  [/\btwo step\b|\b2 step\b|\btwo factor\b|\bone time code\b|\bsecurity code\b|\bverification code\b/g, "code"],
];

// Words that mean the same thing for our purposes. Left side -> one word.
const SAME: Record<string, string> = {
  picture: "photo", pictures: "photo", pic: "photo", pics: "photo", image: "photo", images: "photo",
  photos: "photo", photograph: "photo", photographs: "photo", snap: "photo", selfie: "selfie",
  attachment: "attachment", attachments: "attachment", attached: "attachment", paperclip: "attachment",
  open: "open", opening: "open", view: "open", see: "open", look: "open", read: "open", show: "open",
  download: "save", downloading: "save", downloaded: "save", downloads: "save", save: "save", keep: "save", store: "save", saving: "save",
  send: "send", sending: "send", sent: "send", post: "send",
  reply: "reply", answer: "answer", answering: "answer", pick: "answer",
  forward: "forward", pass: "forward",
  delete: "delete", deleting: "delete", remove: "delete", get: "get", rid: "delete", bin: "delete", erase: "delete", clear: "delete",
  telly: "tv", television: "tv", tele: "tv", telle: "tv",
  mobile: "phone", smartphone: "phone", handset: "phone", phones: "phone",
  ipad: "tablet", tab: "tablet", tablets: "tablet",
  ring: "call", ringing: "call", rings: "call", rang: "call", phoning: "call", calls: "call", calling: "call", called: "call",
  message: "message", messages: "message", msg: "message",
  contact: "contact", contacts: "contact", numbers: "number",
  louder: "volume", quieter: "volume", loud: "volume", quiet: "volume", volume: "volume",
  bigger: "bigger", larger: "bigger", enlarge: "bigger", magnify: "bigger", zoom: "zoom",
  tiny: "small", smaller: "small",
  stuck: "frozen", freezing: "frozen", frozen: "frozen", hung: "frozen",
  website: "website", site: "website", webpage: "website", page: "website", internet: "internet", online: "internet", web: "internet", google: "google", browser: "browser", chrome: "browser",
  app: "app", apps: "app", application: "app", applications: "app", icon: "app", icons: "app",
  charger: "charge", charging: "charge", charge: "charge", battery: "battery", batteries: "battery",
  pin: "pin", pincode: "pin",
  doctor: "gp", doctors: "gp", surgery: "gp", gp: "gp",
  prescriptions: "prescription", medicine: "prescription", meds: "prescription",
  programme: "programme", programmes: "programme", program: "programme", episode: "programme",
  record: "record", recording: "record", recorded: "record",
  subtitle: "subtitles", captions: "subtitles", caption: "subtitles",
  printing: "print", printer: "printer", printed: "print",
  bank: "bank", banking: "bank", account: "account", accounts: "account",
  signin: "signin",
  scammer: "scam", scammers: "scam", fraud: "scam", fraudster: "scam", con: "scam", dodgy: "scam", suspicious: "scam", scams: "scam",
  update: "update", updates: "update", updating: "update", upgrade: "update",
  install: "install", installing: "install",
  wallpaper: "wallpaper", background: "wallpaper",
  torch: "torch", flashlight: "torch",
  alarm: "alarm", alarms: "alarm", wake: "alarm",
  keyboard: "keyboard", typing: "type", type: "type",
  lost: "lost", find: "find", where: "find", loads: "lots", lot: "lots", finding: "find", missing: "missing", disappeared: "missing", vanished: "missing", gone: "missing",
  block: "block", blocking: "block", blocked: "block",
  group: "group", groups: "group",
  video: "video", videos: "video", film: "video", filming: "video",
  slow: "slow", slowly: "slow",
  speak: "speaker", speakerphone: "speaker", loudspeaker: "speaker",
};

// Words that make a scam more likely, so the scam guide goes first.
const SCAMMY = new Set(
  "scam bank money code pay paid payment prize won winner link hmrc microsoft amazon police tax refund account details pin safe parcel urgent virus hacked".split(" "),
);

// Small words that carry no meaning here.
const STOP = new Set(
  (
    "a an the my me i im i m you your to of on in into at for from with and or but is are was were be been " +
    "it its it s this that these those there here do does did doing how what whats what s why when which " +
    "t s ll ve d re m won isn doesn didn don wasn aren " +
    "can cant can t could couldnt would wont won t will should please help want wanna need trying try tried " +
    "just keep keeps keeps still again now some any all up out off over about one thing things way " +
    "dont don t have has had got getting know tell bit " +
    "so very really then than also too as by if am he she they them their we us our him her his hers " +
    "mum dad nan grandson granddaughter daughter son husband wife friend someone somebody"
  ).split(" "),
);

export function tidy(s: string): string {
  let t = ` ${s.replace(/@/g, " at sign ").toLowerCase().replace(/[’']/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()} `;
  for (const [re, to] of FIXES) t = t.replace(re, to);
  return t.replace(/\s+/g, " ");
}

function stem(w: string): string {
  if (SAME[w]) return SAME[w];
  // Light plural handling: "emails" -> "email", but leave short words alone.
  if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss")) {
    const single = w.slice(0, -1);
    return SAME[single] ?? single;
  }
  return w;
}

export function terms(s: string): string[] {
  return tidy(s)
    .trim()
    .split(" ")
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

type Indexed<G> = {
  guide: G;
  terms: Set<string>;
  titleTerms: Set<string>;
  phrases: string[][];
  exact: Set<string>;
  boost: string[];
  unless: string[];
};

export type Ranked<G> = { guide: G; score: number };

export function buildMatcher<G extends Matchable>(guides: G[]) {
  const index: Indexed<G>[] = guides.map((g) => {
    const all = [g.title, g.shortLabel, ...g.keywords];
    return {
      guide: g,
      terms: new Set(all.flatMap(terms)),
      titleTerms: new Set([g.title, g.shortLabel].flatMap(terms)),
      phrases: g.keywords.map(terms).filter((p) => p.length > 1),
      exact: new Set(g.keywords.map((k) => [...new Set(terms(k))].sort().join(" ")).filter(Boolean)),
      boost: (g.boost ?? []).map((k) => tidy(k).trim()),
      unless: (g.unless ?? []).map((k) => tidy(k).trim()),
    };
  });
  const titleTerms = new Map(index.map((it) => [it.guide.id, it.titleTerms]));
  // How rare each word is across all guides (rarer = more telling).
  const df = new Map<string, number>();
  for (const it of index) for (const t of it.terms) df.set(t, (df.get(t) ?? 0) + 1);
  const n = index.length;
  const idf = (t: string) => Math.log(1 + n / (df.get(t) ?? n));

  function rank(problem: string): Ranked<G>[] {
    const text = tidy(problem);
    const q = [...new Set(terms(problem))];
    const out: Ranked<G>[] = [];
    for (const it of index) {
      let score = 0;
      for (const t of q) {
        if (!it.terms.has(t)) continue;
        score += idf(t) * (it.titleTerms.has(t) ? 1.25 : 1);
      }
      if (score === 0) continue;
      // A phrase counts when all its words were said, in any order
      // ("the screen is too dark" matches "screen too dark").
      const qs = new Set(q);
      let best = 0;
      for (const p of it.phrases) if (p.every((w) => qs.has(w))) best = Math.max(best, p.length);
      score += 1.2 * best;
      // Said exactly one of the guide's phrases ("who rang me", "ring someone").
      if (it.exact.has([...qs].sort().join(" "))) score += 2;
      if (it.boost.some((b) => text.includes(` ${b}`))) score += 3;
      if (it.unless.some((b) => text.includes(` ${b}`))) score *= 0.5;
      // Safety first: anything that sounds like a scam puts the scam guide up front.
      if (it.guide.id === "scam" && q.some((t) => SCAMMY.has(t))) score += 1.5;
      out.push({ guide: it.guide, score });
    }
    return out.sort((a, b) => b.score - a.score);
  }

  /**
   * The answer to "what should we show?":
   *  - `guide`: a clear winner, open it straight away.
   *  - `choices`: a few close ones, ask "Is it one of these?".
   *  - neither: nothing fits.
   */
  function decide(problem: string, alternatives: string[] = []) {
    // Try what the phone heard first, then its other guesses, and keep the best.
    let ranked = rank(problem);
    for (const alt of alternatives) {
      const r = rank(alt);
      if ((r[0]?.score ?? 0) > (ranked[0]?.score ?? 0) * 1.15) ranked = r;
    }
    const [first, second] = ranked;
    if (!first || first.score < 1.6) return { guide: null, choices: [] as G[] };
    // A clear winner: well ahead, or a little ahead and its title says more
    // of what the person said ("take a photo" beats "send a photo").
    const titleHits = (r: Ranked<G>) => {
      const q = new Set(terms(problem));
      return [...(titleTerms.get(r.guide.id) ?? [])].filter((t) => q.has(t)).length;
    };
    const clear =
      !second ||
      first.score >= second.score * 1.3 ||
      first.score - second.score >= 2.5 ||
      (first.score >= second.score * 1.05 && titleHits(first) > titleHits(second));
    if (clear && first.score >= 3) return { guide: first.guide, choices: [] as G[] };
    const choices = ranked
      .filter((r) => r.score >= first.score * 0.55)
      .slice(0, 4)
      .map((r) => r.guide);
    return { guide: choices.length === 1 ? choices[0] : null, choices: choices.length > 1 ? choices : [] };
  }

  return { rank, decide };
}
