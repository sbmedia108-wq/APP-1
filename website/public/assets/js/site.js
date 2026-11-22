/* Eklipse Construction Group — site behaviour. No dependencies. */
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav: hairline on scroll, mobile menu ------------------------------------ */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const onScrollNav = () => nav && nav.classList.toggle('is-scrolled', scrollY > 4);
  addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
  if (toggle) {
    const setOpen = (open) => {
      doc.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!doc.classList.contains('nav-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    matchMedia('(min-width: 861px)').addEventListener('change', (m) => m.matches && setOpen(false));
  }

  /* Hero eclipse: scroll progress drives --p (0 = partial, 1 = totality) ----- */
  const hero = document.querySelector('.hero');
  if (hero && !reduce) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = hero.getBoundingClientRect();
      const span = Math.max(1, r.height * 0.55);
      const p = Math.min(1, Math.max(0, -r.top / span));
      // ease the progress so totality "lands" softly
      const eased = 1 - Math.pow(1 - p, 2.2);
      hero.style.setProperty('--p', (0.08 + eased * 0.92).toFixed(4));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* Reveal on enter --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal, .figure');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => {
      // anything already on screen at load is shown immediately
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.95) el.classList.add('in'); else io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* Statement: words light up as it crosses the viewport ---------------------- */
  document.querySelectorAll('.statement').forEach((st) => {
    const words = st.textContent.trim().split(/\s+/);
    st.setAttribute('aria-label', st.textContent.trim());
    st.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    if (reduce) return;
    const spans = [...st.querySelectorAll('.w')];
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = st.getBoundingClientRect();
      const start = innerHeight * 0.85, end = innerHeight * 0.35;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.5)));
      const n = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('lit', i < n));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  });

  /* Carousel arrows -------------------------------------------------------- */
  document.querySelectorAll('[data-rail]').forEach((wrap) => {
    const rail = wrap.querySelector('.rail');
    const prev = wrap.querySelector('[data-prev]');
    const next = wrap.querySelector('[data-next]');
    if (!rail || !prev || !next) return;
    const step = () => (rail.firstElementChild?.getBoundingClientRect().width || 300) + 20;
    const sync = () => {
      prev.disabled = rail.scrollLeft < 8;
      next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
    };
    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync);
    sync();
  });

  /* Segmented control (tabs) with sliding thumb --------------------------- */
  document.querySelectorAll('[data-seg]').forEach((root) => {
    const seg = root.querySelector('.seg');
    const tabs = [...seg.querySelectorAll('[role="tab"]')];
    const thumb = seg.querySelector('.thumb');
    const place = (tab) => {
      thumb.style.width = tab.offsetWidth + 'px';
      thumb.style.transform = `translateX(${tab.offsetLeft}px)`;
    };
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      place(tab);
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    thumb.style.transition = 'none';
    select(current);
    requestAnimationFrame(() => (thumb.style.transition = ''));
    addEventListener('resize', () => place(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
    if (document.fonts) document.fonts.ready.then(() => place(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
  });

  /* Forms: inline validation, then send ----------------------------------- */
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const status = form.querySelector('.form-status');
    const fileInput = form.querySelector('input[type="file"]');
    const fileName = form.querySelector('[data-file-name]');
    if (fileInput && fileName) fileInput.addEventListener('change', () => { fileName.textContent = fileInput.files[0]?.name || 'No file chosen'; });

    const check = (input) => {
      const field = input.closest('.field');
      if (!field) return true;
      const ok = input.checkValidity();
      field.classList.toggle('invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    };
    form.querySelectorAll('input, textarea').forEach((i) => {
      i.addEventListener('blur', () => { if (i.value) check(i); });
      i.addEventListener('input', () => { if (i.closest('.field')?.classList.contains('invalid')) check(i); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = [...form.querySelectorAll('input, textarea')].filter((i) => i.type !== 'file');
      const allOk = inputs.map(check).every(Boolean);
      if (!allOk) { form.querySelector('.invalid input, .invalid textarea')?.focus(); return; }

      const endpoint = form.dataset.endpoint;
      const btn = form.querySelector('button[type="submit"]');
      const show = (msg, ok) => { status.textContent = msg; status.className = 'form-status show ' + (ok ? 'ok' : 'bad'); };

      if (!endpoint) {
        // No form service configured yet: hand over to the visitor's email app.
        const data = new FormData(form);
        const lines = [...data.entries()].filter(([, v]) => typeof v === 'string' && v).map(([k, v]) => `${k}: ${v}`);
        const subject = form.dataset.subject || 'Website enquiry';
        location.href = `mailto:contact@eklipseconstructiongroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
        const hasFile = fileInput && fileInput.files.length;
        show('Your email app should open with your message ready to send.' + (hasFile ? ' Please attach your CV to the email before sending.' : '') + ' If it doesn’t open, email contact@eklipseconstructiongroup.com.', true);
        return;
      }
      btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending…';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        if (fileName) fileName.textContent = 'No file chosen';
        show('Thank you. We’ve received your message and will be in touch soon.', true);
      } catch {
        show('Your message didn’t send. Please try again, or email contact@eklipseconstructiongroup.com.', false);
      } finally { btn.disabled = false; btn.textContent = label; }
    });
  });

  /* Cookie notice ------------------------------------------------------------ */
  const cookie = document.querySelector('.cookie');
  if (cookie) {
    let choice = null;
    try { choice = localStorage.getItem('ek-cookies'); } catch {}
    if (!choice) cookie.hidden = false;
    cookie.querySelectorAll('[data-cookie]').forEach((b) => b.addEventListener('click', () => {
      try { localStorage.setItem('ek-cookies', b.dataset.cookie); } catch {}
      document.dispatchEvent(new CustomEvent('ek:cookies', { detail: b.dataset.cookie }));
      cookie.classList.add('leaving');
      setTimeout(() => (cookie.hidden = true), reduce ? 0 : 500);
    }));
  }
})();
