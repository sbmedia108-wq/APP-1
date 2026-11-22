#!/usr/bin/env node
/*
 * Static site builder for eklipseconstructiongroup.com
 * - Pages live in src/pages/*.html. Each starts with a JSON front-matter comment:
 *     <!--{"path":"/cost/","title":"…","description":"…","nav":"cost","dark":false}-->
 * - Sector pages are generated from src/sectors.json.
 * - {{icon:name}} inserts an inline SVG icon. {{mark}} inserts the Eklipse mark.
 * Output goes to public/ with clean URLs (public/cost/index.html → /cost).
 * Run: node build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'public');
const SITE = 'https://eklipseconstructiongroup.com';

const company = {
  name: 'Eklipse Construction Group',
  legal: 'Eklipse Construction Group Limited',
  phone: '023 8155 0430',
  phoneHref: '+442381550430',
  freephone: '0800 689 7877',
  freephoneHref: '+448006897877',
  email: 'contact@eklipseconstructiongroup.com',
  // TODO(client): add before launch — required on UK company websites.
  companyNo: '',
  registeredOffice: '',
  facebook: 'https://www.facebook.com/profile.php?id=61586177330328',
  linkedin: 'https://www.linkedin.com/company/eklipseconconsult',
};

/* Icons: 24px line icons, stroke = currentColor --------------------------- */
const I = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
const icons = {
  ruler: I('<path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>'),
  chart: I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  doc: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
  sign: I('<path d="M4 19h16"/><path d="M6 15c3-6 5-9 7-9s-1 6 1 6 2-3 4-3"/>'),
  crane: I('<path d="M6 21V5l12 0M6 5l4-2M18 5v4M6 9h6M4 21h6"/><path d="M18 9v2"/><rect x="16" y="11" width="4" height="3" rx=".5"/>'),
  key: I('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>'),
  table: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>'),
  scale: I('<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>'),
  shield: I('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  house: I('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>'),
  building: I('<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>'),
  school: I('<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>'),
  glass: I('<path d="M8 3h8l-1 7a3 3 0 0 1-6 0zM12 13v8M8 21h8"/>'),
  phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  pin: I('<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  left: I('<path d="m15 18-6-6 6-6"/>', ' style="stroke-width:2"'),
  right: I('<path d="m9 18 6-6-6-6"/>', ' style="stroke-width:2"'),
  plus: I('<path d="M12 5v14M5 12h14"/>', ' style="stroke-width:2.2"'),
  wrench: I('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
  people: I('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.4.3 4.2 2 4.8 4.5"/>'),
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5H16l.4-3H13.5V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4A21 21 0 0 0 14.3 4C12 4 10.5 5.4 10.5 8v2.5H8v3h2.5V21z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3.5A1.75 1.75 0 1 1 5 7a1.75 1.75 0 0 1 0-3.5zM3.5 8.5h3V20h-3zM9 8.5h2.9v1.6h.04c.4-.76 1.38-1.6 2.86-1.6 3.06 0 3.6 2 3.6 4.6V20h-3v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.56-2.3 3.2V20H9z"/></svg>',
};

/* The mark: a disc slipping across a ring — an eclipse in two shapes. */
const mark = `<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="ekg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a63e0"/><stop offset="1" stop-color="#3b1a78"/></linearGradient></defs><circle cx="16" cy="16" r="13" fill="none" stroke="url(#ekg)" stroke-width="2.4"/><circle cx="19.5" cy="13" r="8.2" fill="currentColor"/></svg>`;

const expand = (html) => html
  .replace(/\{\{icon:([a-z]+)\}\}/g, (_, n) => { if (!icons[n]) throw new Error('Unknown icon ' + n); return icons[n]; })
  .replace(/\{\{mark\}\}/g, mark)
  .replace(/\{\{phone\}\}/g, company.phone)
  .replace(/\{\{phoneHref\}\}/g, company.phoneHref)
  .replace(/\{\{freephone\}\}/g, company.freephone)
  .replace(/\{\{freephoneHref\}\}/g, company.freephoneHref)
  .replace(/\{\{email\}\}/g, company.email);

/* Navigation ------------------------------------------------------------- */
const navItems = [
  ['cost', '/cost', 'Cost Consultancy'],
  ['developers', '/developers', 'Development'],
  ['projects', '/projects', 'Contracting'],
  ['sectors', '/sectors/commercial', 'Sectors'],
  ['careers', '/careers', 'Careers'],
];

const header = (page) => `
<a class="skip" href="#main">Skip to content</a>
<header class="nav${page.dark ? ' nav-dark' : ''}">
  <div class="wrap-wide nav-inner">
    <a class="brand" href="/" aria-label="Eklipse Construction Group, home">${mark}<span>Eklipse</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu"><span></span><span></span></button>
    <nav class="nav-links" id="nav-links" aria-label="Main">
      ${navItems.map(([k, href, label]) => `<a href="${href}"${page.nav === k ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
      <a class="nav-cta" href="/contact"${page.nav === 'contact' ? ' aria-current="page"' : ''}>Contact</a>
    </nav>
  </div>
</header>`;

const legalLine = () => {
  const bits = [`© ${new Date().getFullYear()} ${company.legal}.`];
  if (company.companyNo) bits.push(`Registered in England &amp; Wales, company no. ${company.companyNo}.`);
  if (company.registeredOffice) bits.push(`Registered office: ${company.registeredOffice}.`);
  return bits.join(' ');
};

const footer = () => `
<footer class="footer">
  <div class="wrap-wide">
    <div class="footer-cols">
      <div>
        <a class="brand" href="/">${mark}<span>Eklipse Construction Group</span></a>
        <p class="mt-s" style="max-width:32ch">Quantity surveyors and construction consultants, based in Southampton and working across Hampshire, the South Coast and the UK.</p>
        <div class="social">
          <a href="${company.linkedin}" aria-label="Eklipse on LinkedIn" rel="noopener">${icons.linkedin}</a>
          <a href="${company.facebook}" aria-label="Eklipse on Facebook" rel="noopener">${icons.facebook}</a>
        </div>
      </div>
      <div>
        <h2>Services</h2>
        <ul>
          <li><a href="/cost">Cost consultancy</a></li>
          <li><a href="/cost#boq">Bills of quantities</a></li>
          <li><a href="/developers">Development management</a></li>
          <li><a href="/projects">Contracting</a></li>
          <li><a href="/projects#defects">Defect resolution</a></li>
        </ul>
      </div>
      <div>
        <h2>Sectors</h2>
        <ul>
          <li><a href="/sectors/residential">Residential</a></li>
          <li><a href="/sectors/commercial">Commercial</a></li>
          <li><a href="/sectors/education">Education</a></li>
          <li><a href="/sectors/leisure-hospitality">Leisure &amp; hospitality</a></li>
        </ul>
      </div>
      <div>
        <h2>Company</h2>
        <ul>
          <li><a href="/#group">Our group</a></li>
          <li><a href="/careers">Careers</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="tel:${company.phoneHref}">${company.phone}</a></li>
          <li><a href="mailto:${company.email}">Email us</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <p>${legalLine()}</p>
      <nav aria-label="Legal">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms of use</a>
        <a href="/cookies">Cookies</a>
      </nav>
    </div>
  </div>
</footer>
<div class="cookie" role="region" aria-label="Cookie preferences" hidden>
  <p>We use essential cookies to run this site. With your permission we'd also use analytics cookies to see which pages help people most. <a href="/cookies">Cookie policy</a></p>
  <div class="btn-row">
    <button class="btn" type="button" data-cookie="all">Allow analytics</button>
    <button class="btn btn-ghost" type="button" data-cookie="essential">Essential only</button>
  </div>
</div>`;

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': ['ProfessionalService', 'LocalBusiness'],
  '@id': SITE + '/#organization',
  name: company.name,
  legalName: company.legal,
  url: SITE + '/',
  logo: SITE + '/assets/img/mark.svg',
  telephone: company.phoneHref,
  email: company.email,
  description: 'Quantity surveyors and construction consultants based in Southampton: cost planning, bills of quantities, contract administration, project and development management.',
  areaServed: ['Southampton', 'Hampshire', 'Dorset', 'West Sussex', 'United Kingdom'],
  address: { '@type': 'PostalAddress', addressLocality: 'Southampton', addressRegion: 'Hampshire', addressCountry: 'GB' },
  sameAs: [company.linkedin, company.facebook],
};

const layout = (page, body) => `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<link rel="canonical" href="${SITE}${page.path === '/' ? '/' : page.path.replace(/\/$/, '')}">
<meta name="theme-color" content="${page.dark ? '#000000' : '#fbfbfd'}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${company.name}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:image" content="${SITE}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/mark.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<link rel="stylesheet" href="/assets/css/site.css">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify(orgSchema)}</script>
</head>
<body>
${header(page)}
<main id="main">
${expand(body)}
</main>
${footer()}
<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;

/* Build -------------------------------------------------------------------- */
const write = (urlPath, html) => {
  const dir = path.join(OUT, urlPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  return urlPath;
};

const built = [];
for (const file of fs.readdirSync(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
  const raw = fs.readFileSync(path.join(SRC, 'pages', file), 'utf8');
  const m = raw.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`${file}: missing front-matter`);
  const page = JSON.parse(m[1]);
  const html = layout(page, raw.slice(m[0].length));
  if (page.path === '/404/') { fs.writeFileSync(path.join(OUT, '404.html'), html); continue; }
  built.push(write(page.path, html));
}

/* Sector pages ------------------------------------------------------------- */
const sectors = JSON.parse(fs.readFileSync(path.join(SRC, 'sectors.json'), 'utf8'));
sectors.forEach((s, i) => {
  const others = sectors.filter((o) => o.slug !== s.slug);
  const body = `
<section class="page-hero bg-night">
  <div class="wrap">
    <span class="eyebrow">Sector · ${s.name}</span>
    <h1 class="h1 measure">${s.h1}</h1>
    <p class="lede measure-wide">${s.intro}</p>
    <div class="btn-row"><a class="btn" href="/contact">Discuss your project</a><a class="more" href="#services">What we do</a></div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="stack reveal">
      <span class="eyebrow">Why it matters</span>
      <h2 class="h2">${s.whyTitle}</h2>
    </div>
    <div class="stack reveal reveal-d1">
      ${s.why.map((p) => `<p class="lede" style="font-weight:400">${p}</p>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section bg-alt">
  <div class="wrap-wide">
    <div class="tiles">
      ${s.points.map((p, j) => `<div class="tile span-4 reveal reveal-d${j}"><div class="tile-icon">{{icon:${p.icon}}}</div><h3 class="h4">${p.title}</h3><p class="muted">${p.text}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="services">
  <div class="wrap">
    <div class="stack reveal">
      <span class="eyebrow">Services</span>
      <h2 class="h2 measure">${s.servicesTitle}</h2>
    </div>
    <ul class="ticks cols-2 mt reveal">
      ${s.services.map((x) => `<li>${x}</li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="section bg-night cta">
  <div class="wrap">
    <h2 class="h2">${s.ctaTitle}</h2>
    <p class="lede measure-wide" style="margin-inline:auto">Speak to our Southampton team. There's no obligation.</p>
    <div class="btn-row"><a class="btn" href="/contact">Get in touch</a></div>
    <div class="cta-meta"><a href="tel:{{phoneHref}}">{{phone}}</a><a href="mailto:{{email}}">{{email}}</a></div>
  </div>
</section>

<section class="section-tight bg-alt">
  <div class="wrap-wide">
    <h2 class="h4 muted" style="font-weight:600">Other sectors</h2>
    <div class="xlinks mt-s">
      ${others.map((o) => `<a class="tile" href="/sectors/${o.slug}"><div class="tile-icon" style="margin-bottom:18px">{{icon:${o.icon}}}</div><h3 class="h4">${o.name}</h3><span class="more">Explore</span></a>`).join('\n      ')}
    </div>
  </div>
</section>`;
  built.push(write(`/sectors/${s.slug}/`, layout({ path: `/sectors/${s.slug}/`, title: s.title, description: s.description, nav: 'sectors', dark: true }, body)));
});

/* Sitemap ------------------------------------------------------------------- */
const urls = built.filter((u) => !/^\/(privacy|terms|cookies|404)/.test(u));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u === '/' ? '/' : u.replace(/\/$/, '')}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'assets/img/mark.svg'), mark.replace('aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"').replace('fill="currentColor"', 'fill="#1d1d1f"'));

console.log(`Built ${built.length} pages:\n  ${built.join('\n  ')}`);
