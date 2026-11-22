# Eklipse Construction Group website

A static rebuild of eklipseconstructiongroup.com. There's no framework and no dependencies: plain HTML, one CSS file and one small JS file.

## Working on it

```bash
node build.js          # writes the finished site into public/
npm run serve          # build, then preview at http://localhost:8080
```

- **Pages** are in `src/pages/*.html`. Each file opens with a JSON comment holding its URL, title, meta description and nav state.
- **Sector pages** (`/sectors/...`) are generated from `src/sectors.json`.
- **Header, footer, company details, icons and SEO tags** are in `build.js`. Edit them once there and every page updates.
- **Styles** are in `public/assets/css/site.css` and **behaviour** is in `public/assets/js/site.js`. These are edited directly; the build doesn't touch them.

The old site's URLs are kept (`/cost`, `/developers`, `/projects`, `/contact`, `/sectors/*`, `/privacy`, `/terms`, `/cookies`), so search rankings carry over. `/careers` is new. The build also writes `sitemap.xml`, `robots.txt` and `404.html`.

## Deploying

Upload the contents of `public/` to any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages or plain hosting). Each page is a folder holding `index.html`, so clean URLs work without rewrite rules. Point the host's "not found" page at `404.html`.

## To do before launch

1. **Company number and registered office.** UK companies must show these on their website. Fill in `companyNo` and `registeredOffice` in `build.js` and they appear in every footer.
2. **Forms.** Until a form service is connected, the contact and careers forms open the visitor's email app with the message filled in. To send them directly instead, create a form endpoint (for example Formspree or Netlify Forms) and add `data-endpoint="https://…"` to each `<form data-form>` in `src/pages/contact.html` and `src/pages/careers.html`.
3. **Logo.** The circle-and-disc mark in `build.js` (`mark`) is a stand-in. Replace it with the real Eklipse logo, and regenerate `public/assets/img/apple-touch-icon.png` and `og.png` to match.
4. **Locations.** The old site gave London, Southampton and Birmingham in one place and Southampton only elsewhere. This version says Southampton-based. Add other offices if they're real.
5. **Proof.** The site has no project case studies, accreditations (for example RICS) or team profiles, because none were supplied. Adding them is the biggest remaining improvement.
6. **Photos.** Sector tiles accept a photo: add `data-photo` to the tile and set `style="background-image:url(...)"` on its `.art` element.
7. **Analytics.** The cookie banner stores the visitor's choice and fires an `ek:cookies` event. Load analytics only when `detail === 'all'`.
8. **Legal text.** The privacy, terms and cookie pages were copied from the live site. The live versions named `pbaconsultants.co.uk`; this copy names `eklipseconstructiongroup.com`. Have someone confirm the text is current.
