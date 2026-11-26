// Deterministic timeline: every frame is rendered by seek(t).
// Elements with data-show="a-b" are displayed only while a <= t < b.
// All CSS animations use absolute delays (seconds from video start), so
// setting each animation's currentTime to t reproduces the exact frame.
window.seek = function (t) {
  document.querySelectorAll('[data-show]').forEach(el => {
    const [a, b] = el.dataset.show.split('-').map(Number);
    const on = t >= a && t < b;
    el.style.display = on ? '' : 'none';
  });
  document.getAnimations().forEach(an => { an.pause(); an.currentTime = t * 1000; });
};

// Tap ripple on an element (positioned relative to `host`, which must be position:relative/absolute).
function tapAt(host, target, time) {
  const h = host.getBoundingClientRect(), r = target.getBoundingClientRect();
  const sx = h.width / host.offsetWidth || 1; // account for transforms
  const x = (r.left + r.width / 2 - h.left) / sx, y = (r.top + r.height / 2 - h.top) / sx;
  const ring = document.createElement('div');
  ring.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:90px;height:90px;border-radius:50%;border:4px solid rgba(255,255,255,.95);box-shadow:0 0 0 3px rgba(21,21,28,.35);z-index:50;pointer-events:none;animation:vtap .5s var(--out) ${time}s both`;
  const dot = document.createElement('div');
  dot.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:54px;height:54px;border-radius:50%;background:rgba(21,21,28,.28);border:3px solid rgba(255,255,255,.9);z-index:51;pointer-events:none;animation:vtapdot .45s ease-out ${time - 0.12}s both`;
  host.appendChild(ring); host.appendChild(dot);
}

// Confetti burst (deterministic pseudo-random)
function burst(host, x, y, time, n = 26, spread = 260, colors = ['#C8F23A', '#F2547D', '#3D7CFF', '#FF7A45', '#8B6CFF', '#FFD84A']) {
  let s = Math.floor(time * 1000) + n;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:60';
  wrap.dataset.show = `${time}-${time + 1.4}`;
  host.appendChild(wrap);
  host = wrap;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.5;
    const d = spread * (0.45 + rnd() * 0.65);
    const p = document.createElement('div');
    const w = 8 + rnd() * 10, hgt = rnd() > 0.5 ? w : w * 0.45;
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${hgt}px;border-radius:${rnd() > 0.6 ? '50%' : '3px'};background:${colors[i % colors.length]};z-index:60;pointer-events:none;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + 60}px;--rr:${(rnd() - 0.5) * 720}deg;animation:vburst ${0.9 + rnd() * 0.4}s cubic-bezier(.15,.7,.3,1) ${time}s both`;
    host.appendChild(p);
  }
}

function flashes(times) {
  const st = document.getElementById('stage');
  times.forEach(t => {
    const f = document.createElement('div');
    f.className = 'vflash';
    f.style.animation = `vflash .32s ease-out ${t}s both`;
    f.dataset.show = `${t}-${t + 0.4}`;
    st.appendChild(f);
  });
}
