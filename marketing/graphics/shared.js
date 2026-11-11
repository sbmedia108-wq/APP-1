// Used by all.html (built by build.py).
// 1. Redraws every .fence as a detailed timber fence (new and solid, or weathered and broken).
// 2. Fits headlines so they clear the photo.
// 3. Drops the cut-out photo into each poster, feet tucked behind the yellow tape.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  function drawFence(el, idx) {
    const W = el.offsetWidth, H = el.offsetHeight;
    const kids = [...el.children];
    const n = kids.length;
    const picket = el.classList.contains('picket');
    const bad = /rotate/.test(el.style.transform) || kids.some(k => k.classList.contains('x') || k.classList.contains('gap'));
    const r = rng(idx * 97 + 13);
    const bw = W / n;
    let defs = '', body = '';
    const top = bad || picket ? 0 : 14, base = bad || picket ? 0 : 38;

    if (picket) body += `<rect x="0" y="${H * .3}" width="${W}" height="20" fill="#6f4a22"/><rect x="0" y="${H * .72}" width="${W}" height="20" fill="#6f4a22"/>`;

    kids.forEach((k, i) => {
      const x = i * bw;
      if (k.classList.contains('x')) return;
      if (k.classList.contains('gap')) {            // a missing board with someone looking through
        body += `<rect x="${x}" y="0" width="${bw}" height="${H}" fill="#050505"/>
          <ellipse cx="${x + bw / 2}" cy="${H * .3}" rx="${bw * .34}" ry="${bw * .2}" fill="#fff"/>
          <circle cx="${x + bw * .6}" cy="${H * .3}" r="${bw * .13}" fill="#111"/>`;
        return;
      }
      const hue = bad ? 28 + r() * 12 : 30 + r() * 7, sat = bad ? 8 + r() * 10 : 52 + r() * 12, lit = bad ? 27 + r() * 12 : 46 + r() * 10;
      const id = `g${idx}_${i}`;
      defs += `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="hsl(${hue},${sat}%,${lit + 9}%)"/><stop offset=".72" stop-color="hsl(${hue},${sat}%,${lit}%)"/>
        <stop offset="1" stop-color="hsl(${hue},${sat}%,${lit - 17}%)"/></linearGradient>`;
      const w = picket ? bw * .8 : bw + 1;
      let y0 = top, pts;
      if (picket) pts = `${x},${H * .1} ${x + w / 2},0 ${x + w},${H * .1} ${x + w},${H} ${x},${H}`;
      else if (bad && r() < .45) {                  // snapped-off top
        const d = H * (.05 + r() * .22);
        pts = `${x},${d} ${x + w * .3},${d - 14} ${x + w * .55},${d + 10} ${x + w * .8},${d - 8} ${x + w},${d + 6} ${x + w},${H} ${x},${H}`;
        y0 = d;
      } else pts = `${x},${y0} ${x + w},${y0} ${x + w},${H - base} ${x},${H - base}`;
      const tilt = bad ? (r() - .5) * 4 : 0;
      let g = `<polygon points="${pts}" fill="url(#${id})"/>`;
      for (let j = 0; j < 4; j++) {                  // grain
        const gx = x + w * (.15 + .22 * j + r() * .08), a = (r() - .5) * 10, b = (r() - .5) * 10;
        g += `<path d="M${gx} ${y0 + 8} C${gx + a} ${H * .35} ${gx + b} ${H * .65} ${gx + a / 2} ${H - base - 6}" stroke="rgba(40,20,5,${bad ? .3 : .17})" stroke-width="1.6" fill="none"/>`;
      }
      if (r() < .4) { const ky = H * (.2 + r() * .6); g += `<ellipse cx="${x + w * (.3 + r() * .4)}" cy="${ky}" rx="5" ry="9" fill="rgba(45,22,6,.5)"/>`; }
      if (!picket) g += `<rect x="${x + w - 3}" y="${y0}" width="3" height="${H - base - y0}" fill="rgba(0,0,0,.28)"/>`;
      body += `<g transform="rotate(${tilt} ${x + w / 2} ${H})">${g}</g>`;
    });

    if (bad) {
      defs += `<linearGradient id="alg${idx}" x1="0" x2="0" y1="0" y2="1"><stop offset=".55" stop-color="rgba(70,110,40,0)"/><stop offset="1" stop-color="rgba(70,110,40,.55)"/></linearGradient>`;
      body = `<g>${body}</g><rect x="0" y="0" width="${W}" height="${H}" fill="url(#alg${idx})" style="mix-blend-mode:multiply"/>`;
    } else if (!picket) {
      // gravel board, capping rail and posts
      body += `<rect x="0" y="${H - base}" width="${W}" height="${base}" fill="#a9a9a4"/><rect x="0" y="${H - base}" width="${W}" height="5" fill="#c9c9c4"/>`;
      body += `<rect x="-6" y="0" width="${W + 12}" height="${top + 4}" rx="3" fill="#7a5226"/><rect x="-6" y="0" width="${W + 12}" height="5" rx="2" fill="#a87a45"/>`;
      const posts = n > 8 ? [0, .25, .5, .75, 1] : [0, 1];
      posts.forEach(f => {
        const px = f * W - 15;
        body += `<rect x="${px}" y="-16" width="30" height="${H + 16}" fill="#8f8f8a"/><rect x="${px}" y="-16" width="9" height="${H + 16}" fill="#b4b4ae"/>
                 <rect x="${px - 4}" y="-26" width="38" height="12" rx="2" fill="#9c9c96"/>`;
      });
    }
    el.style.display = 'block'; el.style.width = W + 'px'; el.style.height = H + 'px';
    el.innerHTML = `<svg xmlns="${NS}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;display:block;filter:drop-shadow(0 12px 18px rgba(0,0,0,.55))"><defs>${defs}</defs>${body}</svg>`;
  }

  const POSE = {
    level:   { src: 'assets/me-level.png',   ratio: 0, headX: .49, headY: .012 },
    nailgun: { src: 'assets/me-nailgun.png', ratio: 0, headX: .63, headY: .012 },
  };
  const HAT = `<svg viewBox="0 0 120 100"><path d="M12 78 C20 30 60 6 96 30 C80 34 96 60 104 78 Z" fill="#d81f2a"/><rect x="4" y="72" width="108" height="22" rx="11" fill="#fff"/><circle cx="100" cy="30" r="13" fill="#fff"/></svg>`;

  function placePerson(p, i) {
    const zone = p.querySelector('.zone') || p.querySelector('img.lads') || p.querySelector('[data-person]');
    if (!zone) return;
    const pose = POSE[p.dataset.pose || (/nail|furious/.test(p.id) ? 'nailgun' : /level/.test(p.id) ? 'level' : i % 2 ? 'nailgun' : 'level')];
    const PH = p.offsetHeight, PW = p.offsetWidth;
    const wide = p.classList.contains('wide');
    const head = p.querySelector('.head');
    const headBottom = head ? head.offsetTop + head.offsetHeight : 0;
    const feet = wide ? 0 : 105;
    const centred = zone.offsetLeft + zone.offsetWidth / 2 < PW * .6 && zone.offsetLeft > PW * .12;
    let H = wide ? 420 : Math.max(600, Math.min(centred ? 780 : 860, PH - feet - headBottom - (centred ? 15 : -10)));
    if (p.dataset.personHeight) H = +p.dataset.personHeight;
    const Wd = H * pose.ratio;
    let left = centred ? (PW - Wd) / 2 : PW - Wd - 10;
    const img = document.createElement('img');
    img.src = pose.src;
    img.style.cssText = `position:absolute;left:${left}px;bottom:${feet}px;height:${H}px;z-index:3;filter:drop-shadow(0 10px 24px rgba(0,0,0,.6))`;
    p.appendChild(img);
    if (p.dataset.hat !== undefined) {
      const hw = H * .2, hat = document.createElement('div');
      hat.innerHTML = HAT;
      hat.style.cssText = `position:absolute;z-index:4;width:${hw}px;left:${left + Wd * pose.headX - hw * .5}px;bottom:${feet + H * (1 - pose.headY) - hw * .28}px;transform:rotate(-8deg)`;
      p.appendChild(hat);
    }
    zone.remove();
  }

  async function run() {
    await document.fonts.ready;
    for (const k in POSE) await new Promise(res => { const im = new Image(); im.onload = () => { POSE[k].ratio = im.naturalWidth / im.naturalHeight; res(); }; im.src = POSE[k].src; });
    document.querySelectorAll('.fence').forEach(drawFence);
    document.querySelectorAll('.p').forEach((p, i) => {
      const head = p.querySelector('.head');
      if (head && !p.classList.contains('yel') && !p.classList.contains('wide')) {
        const hs = [...head.querySelectorAll('h1')], size = h => parseFloat(getComputedStyle(h).fontSize);
        hs.forEach(h => { while (h.scrollWidth > head.clientWidth + 1 && size(h) > 40) h.style.fontSize = (size(h) - 2) + 'px'; });
        const limit = +(p.dataset.headLimit || 560);
        let guard = 0;
        while (head.offsetHeight > limit && guard++ < 60) hs.forEach(h => h.style.fontSize = (size(h) * .97) + 'px');
      } else if (head) {
        [...head.querySelectorAll('h1')].forEach(h => { let s = parseFloat(getComputedStyle(h).fontSize); while (h.scrollWidth > head.clientWidth + 1 && s > 40) h.style.fontSize = (s -= 2) + 'px'; });
      }
      placePerson(p, i);
    });
    document.body.dataset.ready = '1';
  }
  run();
})();
