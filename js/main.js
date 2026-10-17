(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const G = () => typeof window.gsap !== 'undefined';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };
  const toastEl = $('#toast'); let toastT;
  function toast(m, ms = 3000) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), ms); }
  const say = (m) => { $('#say').textContent = m; };
  const NS = 'http://www.w3.org/2000/svg';

  /* ===== SOUND ===== */
  const Sound = (() => {
    let ctx = null, master = null, muted = store.get('anew-muted') === '1';
    const live = new Set();
    function c() {
      if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : .8; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function track(n) { live.add(n); n.onended = () => live.delete(n); }
    function note(f, { when = 0, dur = .25, type = 'sine', vol = .15, to = null } = {}) {
      if (muted) return; const a = c(); if (!a) return;
      const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05); track(o);
    }
    function noise({ when = 0, dur = .5, from = 400, to = 4000, vol = .25 } = {}) {
      if (muted) return; const a = c(); if (!a) return;
      const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource(); s.buffer = buf;
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
      const t = a.currentTime + when; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
      const g = a.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); track(s);
    }
    const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
    return {
      midi, note,
      click() { note(950 + Math.random() * 200, { dur: .06, type: 'triangle', vol: .07 }); },
      chime(m, when = 0) { note(midi(m), { when, dur: .9, vol: .14 }); note(midi(m) * 2, { when, dur: .5, vol: .04, type: 'triangle' }); },
      engine() { note(70, { dur: 1.4, type: 'sawtooth', vol: .06, to: 220 }); noise({ dur: 1.2, from: 200, to: 3000, vol: .16 }); },
      blastoff() { note(55, { dur: 2.8, type: 'sawtooth', vol: .08, to: 260 }); noise({ dur: 2.8, from: 150, to: 4500, vol: .25 }); },
      beep() { note(880, { dur: .18, type: 'square', vol: .05 }); },
      pat(i) { note(i % 2 ? 330 : 392, { dur: .08, type: 'triangle', vol: .06 }); },
      giggle() { [84, 86, 84, 88].forEach((m, i) => note(midi(m), { when: i * .07, dur: .09, type: 'triangle', vol: .07 })); },
      whoosh() { noise({ dur: .45, from: 600, to: 5000, vol: .14 }); },
      honk() { note(392, { dur: .16, type: 'square', vol: .06 }); note(494, { dur: .16, type: 'square', vol: .05 }); },
      thud() { note(140, { dur: .35, type: 'sine', vol: .2, to: 50 }); },
      unlock() { c(); },
      setMuted(m) { muted = m; store.set('anew-muted', m ? '1' : '0'); if (master && ctx) master.gain.setTargetAtTime(m ? 0 : .8, ctx.currentTime, .02); if (m) { live.forEach((n) => { try { n.stop(); } catch { /* done */ } }); live.clear(); } },
      get muted() { return muted; },
    };
  })();
  function renderMute() {
    $$('#mute, #loaderMute').forEach((b) => {
      b.setAttribute('aria-pressed', String(Sound.muted)); b.setAttribute('aria-label', Sound.muted ? 'Unmute sounds' : 'Mute sounds');
      const w = $('.wave', b); if (w) w.style.display = Sound.muted ? 'none' : '';
    });
  }
  $$('#mute, #loaderMute').forEach((b) => b.addEventListener('click', () => { Sound.setMuted(!Sound.muted); renderMute(); if (!Sound.muted) Sound.click(); }));
  renderMute();
  document.addEventListener('click', (e) => { const el = e.target.closest('button, a'); if (el && !el.hasAttribute('data-nosfx')) Sound.click(); });

  /* ===== REALISTIC STARRY SKY ===== */
  function Sky(canvas, { density = 1 } = {}) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, stars = [], bg = null, meteors = [], visible = true, t = 0;
    const tints = ['255,255,255', '255,255,255', '255,255,255', '207,226,255', '255,236,210', '255,205,225'];
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    function build() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight; if (!w || !h) return;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bg = document.createElement('canvas'); bg.width = w * dpr; bg.height = h * dpr; const b = bg.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0);
      const base = b.createRadialGradient(w * .35, h * .25, 0, w * .5, h * .5, Math.max(w, h));
      base.addColorStop(0, '#221C4C'); base.addColorStop(.55, '#120F2E'); base.addColorStop(1, '#07061A');
      b.fillStyle = base; b.fillRect(0, 0, w, h);
      b.save(); b.translate(w / 2, h / 2); b.rotate(-.5);
      const L = Math.hypot(w, h);
      [['255,143,184', .08], ['170,150,255', .07], ['255,235,210', .05]].forEach(([col, a], k) => {
        for (let i = 0; i < 9; i++) {
          const x = (Math.random() - .5) * L, y = gauss() * h * .06 + (k - 1) * 18, r = 60 + Math.random() * 140;
          const gr = b.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
          b.fillStyle = gr; b.fillRect(x - r, y - r, r * 2, r * 2);
        }
      });
      const dust = Math.min(9000, Math.floor(w * h / 220));
      for (let i = 0; i < dust; i++) { b.fillStyle = `rgba(255,255,255,${Math.random() * .22})`; b.fillRect((Math.random() - .5) * L, gauss() * h * .09, Math.random() * 1.2, Math.random() * 1.2); }
      b.restore();
      const faint = Math.min(4000, w * h / 900);
      for (let i = 0; i < faint; i++) { b.fillStyle = `rgba(255,255,255,${.1 + Math.random() * .25})`; b.fillRect(Math.random() * w, Math.random() * h, .8, .8); }
      const n = Math.min(900, Math.floor(w * h / 1700 * density));
      stars = Array.from({ length: n }, () => {
        const big = Math.random() < .06;
        return { x: Math.random() * w, y: Math.random() * h, r: big ? 1.4 + Math.random() * 1.3 : .4 + Math.random() * .9, a: .45 + Math.random() * .55, s: .5 + Math.random() * 2.2, p: Math.random() * 6.3, c: tints[(Math.random() * tints.length) | 0], big };
      });
    }
    function frame() {
      requestAnimationFrame(frame);
      if (!visible || !bg || document.hidden) return;
      t += .016;
      ctx.clearRect(0, 0, w, h); ctx.drawImage(bg, 0, 0, w, h);
      for (const s of stars) {
        const a = s.a * (.65 + .35 * Math.sin(t * s.s + s.p));
        ctx.fillStyle = `rgba(${s.c},${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        if (s.big) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6); g.addColorStop(0, `rgba(${s.c},${a * .35})`); g.addColorStop(1, `rgba(${s.c},0)`);
          ctx.fillStyle = g; ctx.fillRect(s.x - s.r * 6, s.y - s.r * 6, s.r * 12, s.r * 12);
          ctx.strokeStyle = `rgba(${s.c},${a * .5})`; ctx.lineWidth = .6; ctx.beginPath();
          ctx.moveTo(s.x - s.r * 5, s.y); ctx.lineTo(s.x + s.r * 5, s.y); ctx.moveTo(s.x, s.y - s.r * 5); ctx.lineTo(s.x, s.y + s.r * 5); ctx.stroke();
        }
      }
      if (!reduce && Math.random() < .006) meteors.push({ x: Math.random() * w * .8 + w * .2, y: Math.random() * h * .4, v: 9 + Math.random() * 6, life: 1 });
      meteors = meteors.filter((m) => m.life > 0);
      for (const m of meteors) {
        m.x -= m.v; m.y += m.v * .45; m.life -= .02;
        const g = ctx.createLinearGradient(m.x, m.y, m.x + 90, m.y - 40); g.addColorStop(0, `rgba(255,255,255,${m.life})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + 90, m.y - 40); ctx.stroke();
      }
    }
    build(); window.addEventListener('resize', build); requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(canvas);
    return { rebuild: build };
  }
  Sky($('#sky'), { density: 1.2 });
  const spaceSky = Sky($('#spaceSky'), { density: .9 });
  Sky($('#storySky'), { density: 1 });

  /* ===== PINK CRAWL TRANSITION ===== */
  const crawl = $('#crawl'), crawler = $('#crawler');
  let crawling = false;
  async function crawlTo(label, midway) {
    if (crawling) return; crawling = true;
    if (reduce || !crawl.animate) { if (midway) midway(); crawling = false; return; }
    $('#crawlTo').textContent = label;
    crawl.hidden = false; crawl.classList.add('on'); Sound.giggle();
    crawl.animate([{ clipPath: 'circle(0% at 0% 50%)' }, { clipPath: 'circle(150% at 0% 50%)' }], { duration: 480, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' });
    const vw = window.innerWidth, cw = crawler.getBoundingClientRect().width || 220;
    crawler.animate([{ transform: `translateX(${-cw}px)` }, { transform: `translateX(${vw + 20}px)` }], { duration: 2100, easing: 'linear', fill: 'forwards' });
    let steps = 0;
    const patIv = setInterval(() => {
      Sound.pat(steps++);
      const r = crawler.getBoundingClientRect(); const hrt = document.createElement('span'); hrt.className = 'heart-step'; hrt.textContent = '♥';
      hrt.style.left = (r.left + r.width * .25) + 'px'; hrt.style.top = (r.bottom - 12) + 'px'; crawl.appendChild(hrt);
      hrt.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.4) translateY(-10px)' }], { duration: 900, fill: 'forwards' }).onfinish = () => hrt.remove();
    }, 190);
    await wait(1050); if (midway) midway();
    await wait(800);
    const out = crawl.animate([{ clipPath: 'circle(150% at 100% 50%)' }, { clipPath: 'circle(0% at 100% 50%)' }], { duration: 480, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' });
    await out.finished.catch(() => {});
    clearInterval(patIv); $$('.heart-step', crawl).forEach((h) => h.remove());
    crawl.classList.remove('on'); crawl.hidden = true; crawling = false;
  }
  function jump(target) { document.documentElement.style.scrollBehavior = 'auto'; target.scrollIntoView(); document.documentElement.style.scrollBehavior = ''; }
  $$('a[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href')); if (!target) return; e.preventDefault();
    crawlTo(a.dataset.go, () => jump(target));
  }));

  /* ===== PRELOADER ===== */
  const visits = (parseInt(store.get('anew-visits', '0'), 10) || 0) + 1;
  store.set('anew-visits', String(visits));
  $('#greet').textContent = visits > 1 ? `Welcome back, friend! Visit #${visits}. I kept your seat warm.` : 'Welcome to my garage in the sky. Buckle up!';
  const launchBtn = $('#launch'), fuelBar = $('#fuelBar'), fuelLabel = $('#fuelLabel');
  function setFuel(p) { fuelBar.style.width = p + '%'; fuelLabel.textContent = `Fueling up with starlight · ${Math.round(p)}%`; }
  function ready() { setFuel(100); launchBtn.disabled = false; launchBtn.classList.add('launch-ready'); fuelLabel.textContent = 'Tank full · ready for launch'; }
  if (G() && !reduce) {
    const tl = gsap.timeline();
    tl.from('#bigname span', { y: 80, opacity: 0, rotation: () => gsap.utils.random(-25, 25), duration: .7, stagger: .12, ease: 'back.out(2.2)' })
      .from('#car', { x: '-80vw', y: -40, rotation: -10, duration: 1.7, ease: 'power3.out' }, .2)
      .to('#car', { rotation: 5, duration: .22, yoyo: true, repeat: 1, ease: 'sine.inOut' })
      .from('#bubble', { scale: 0, opacity: 0, transformOrigin: '0% 80%', duration: .55, ease: 'back.out(2)' }, '-=.2')
      .to({ p: 0 }, { p: 100, duration: 2.1, ease: 'power1.inOut', onUpdate() { setFuel(this.targets()[0].p); }, onComplete: ready }, '-=.3');
    gsap.to('#bigname span', { y: -6, duration: 1.2, yoyo: true, repeat: -1, stagger: .15, ease: 'sine.inOut', delay: 1.4 });
  } else {
    let p = 0; const iv = setInterval(() => { p += 4; setFuel(Math.min(p, 100)); if (p >= 100) { clearInterval(iv); ready(); } }, 60);
  }
  document.body.classList.add('loading');
  function openSite() { $('#loader').hidden = true; document.body.classList.remove('loading'); window.scrollTo(0, 0); introHero(); }
  launchBtn.addEventListener('click', async () => {
    Sound.unlock(); Sound.engine();
    if (G() && !reduce) {
      gsap.to('#bubble', { scale: .6, opacity: 0, duration: .3 });
      gsap.to('#bigname span', { y: -200, opacity: 0, stagger: .05, duration: .5, ease: 'power2.in' });
      await gsap.to('#car', { x: '80vw', y: -140, rotation: -12, scale: .7, duration: .9, ease: 'power3.in' });
    }
    crawlTo('Anew\'s world', openSite);
  });
  $('#skip').addEventListener('click', () => { Sound.unlock(); openSite(); });

  function introHero() {
    say(visits > 1 ? 'Welcome back! I missed watching your cursor.' : 'Move your cursor. I\'m watching (nicely).');
    hero.classList.add('waving'); setTimeout(() => hero.classList.remove('waving'), 2400);
    if (!G() || reduce) return;
    gsap.from('.hero .reveal', { y: 40, opacity: 0, duration: .8, stagger: .12, ease: 'back.out(1.6)' });
    gsap.from('#babyHero', { scale: .4, opacity: 0, duration: .9, ease: 'back.out(1.8)' });
    gsap.from('.friend', { y: 70, opacity: 0, duration: .7, stagger: .07, ease: 'back.out(2)', delay: .3 });
    gsap.from('#parkedCar', { x: -500, duration: 1.1, ease: 'power3.out', delay: .4 });
  }

  if ('IntersectionObserver' in window && G() && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      gsap.from(en.target, { y: 36, opacity: 0, duration: .7, ease: 'back.out(1.4)' });
    }), { threshold: .15 });
    $$('main .reveal').forEach((el) => { if (!el.closest('.hero') && el.getBoundingClientRect().top > window.innerHeight) io.observe(el); });
  }

  /* ===== ANEW: eyes, blink, wave, space mode ===== */
  const hero = $('#babyHero'), eyes = $$('.eye', hero);
  let pointer = null, raf = 0;
  function look(x, y) {
    const r = hero.getBoundingClientRect(), s = r.width / 200;
    eyes.forEach((eye) => {
      const ex = r.left + (+eye.dataset.cx) * s, ey = r.top + (+eye.dataset.cy + 12) * s;
      const dx = x - ex, dy = y - ey, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      $$('.pupil', eye).forEach((p) => p.setAttribute('transform', `translate(${(dx / d * 5 * k).toFixed(1)} ${(dy / d * 5 * k).toFixed(1)})`));
    });
  }
  window.addEventListener('pointermove', (e) => { pointer = [e.clientX, e.clientY]; if (!raf) raf = requestAnimationFrame(() => { raf = 0; look(pointer[0], pointer[1]); }); }, { passive: true });
  window.addEventListener('pointerdown', (e) => look(e.clientX, e.clientY), { passive: true });
  let wander = 0;
  setInterval(() => { if (pointer) return; const r = hero.getBoundingClientRect(); wander += .9; look(r.left + r.width / 2 + Math.cos(wander) * 300, r.top + r.height / 2 + Math.sin(wander) * 140); }, 1300);
  (function blink() { setTimeout(() => { hero.classList.add('blink'); setTimeout(() => hero.classList.remove('blink'), 130); blink(); }, 2400 + Math.random() * 3200); })();
  hero.addEventListener('click', (e) => {
    if (e.target.id === 'antennaStar') { Sound.chime(91); say('Ding! My antenna picks up starlight.'); return; }
    Sound.giggle(); say('Hehe! That tickles.'); hero.classList.remove('waving'); void hero.getBoundingClientRect(); hero.classList.add('waving'); setTimeout(() => hero.classList.remove('waving'), 2000);
  });

  const spaceBtn = $('#spaceToggle');
  function setSpace(on) {
    document.body.classList.toggle('space', on); spaceBtn.setAttribute('aria-pressed', String(on));
    $('.lbl', spaceBtn).textContent = on ? 'Cloud mode' : 'Space mode'; store.set('anew-space', on ? '1' : '0');
    if (on) spaceSky.rebuild();
  }
  spaceBtn.addEventListener('click', () => {
    const on = !document.body.classList.contains('space'); setSpace(on);
    say(on ? 'Goggles down! Space mode engaged.' : 'Goggles up. Hello, sunshine!');
    if (on) { Sound.chime(79); Sound.chime(84, .12); } else Sound.chime(72);
  });
  setSpace(store.get('anew-space') === '1');

  /* ===== DREAM ORBITS (hero + section) ===== */
  function placeOnEllipse(p, a, box) {
    const k = box / 400, cr = Math.cos(p.rot * Math.PI / 180), sr = Math.sin(p.rot * Math.PI / 180);
    const x = Math.cos(a) * p.rx, y = Math.sin(a) * p.ry;
    return [(200 + x * cr - y * sr) * k, (200 + x * sr + y * cr) * k, Math.sin(a)];
  }
  const stage = $('#orbitStage');
  const heroPlanets = [
    { rx: 190, ry: 70, rot: -14, sp: .5, ph: 0, col: '#FF8FB8', t: '' },
    { rx: 150, ry: 54, rot: 18, sp: -.7, ph: 2, col: '#FFE38A', t: '★' },
    { rx: 176, ry: 132, rot: 0, sp: .35, ph: 4, col: '#CFE6FF', t: '' },
    { rx: 190, ry: 70, rot: -14, sp: .5, ph: 3.14, col: '#C8F0DE', t: 'z' },
  ].map((p) => { const el = document.createElement('span'); el.className = 'planet'; el.setAttribute('aria-hidden', 'true'); el.style.background = p.col; el.textContent = p.t; stage.appendChild(el); return { ...p, el }; });

  const system = $('#system');
  const DREAMS = [
    { r: 80, col: '#FF8FB8', title: 'A car that folds into a pillow', text: 'Fly to Grandma\'s, land, fold it up, take a nap on it. Perfect.', pct: 60 },
    { r: 122, col: '#FFE38A', title: 'Loop-the-Moon license', text: 'Pass my flying test so I can loop around the Moon without asking.', pct: 35 },
    { r: 162, col: '#CFE6FF', title: 'Seatbelts for ghosts', text: 'Ghosts keep floating out of their seats. I\'m designing very gentle straps.', pct: 20 },
    { r: 194, col: '#C8F0DE', title: 'A bridge between two stars', text: 'My biggest dream: a sparkly bridge so nobody ever flies home alone.', pct: 5 },
  ];
  const dreamPlanets = DREAMS.map((d, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dplanet'; b.style.background = d.col; b.textContent = String(i + 1);
    b.setAttribute('aria-label', `Dream ${i + 1}: ${d.title}`); b.setAttribute('aria-pressed', String(i === 0));
    system.appendChild(b);
    const p = { ...d, rx: d.r, ry: d.r, rot: 0, el: b, a: i * 1.7, sp: [1.6, 1.1, .8, .55][i], paused: false };
    b.addEventListener('mouseenter', () => { p.paused = true; }); b.addEventListener('mouseleave', () => { p.paused = false; });
    b.addEventListener('focus', () => { p.paused = true; }); b.addEventListener('blur', () => { p.paused = false; });
    b.addEventListener('click', () => showDream(p, i));
    return p;
  });
  function showDream(p, i) {
    dreamPlanets.forEach((q) => q.el.setAttribute('aria-pressed', String(q === p)));
    $('#dreamOrbit').textContent = `Orbit ${i + 1}`; $('#dreamTitle').textContent = p.title; $('#dreamText').textContent = p.text;
    $('#dreamMeter').style.width = p.pct + '%'; $('#dreamPct').textContent = `${p.pct}% built`;
    if (!reduce) $('#dreamCard').animate([{ transform: 'scale(.96)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
    Sound.chime(74 + i * 3);
  }
  let orbitT = 0;
  function placeAll() {
    const box = stage.clientWidth, box2 = system.clientWidth;
    heroPlanets.forEach((p) => { const [x, y, z] = placeOnEllipse(p, orbitT * p.sp + p.ph, box); p.el.style.left = x + 'px'; p.el.style.top = y + 'px'; p.el.classList.toggle('front', z > 0); p.el.style.scale = (0.75 + (z + 1) * .2).toFixed(2); });
    dreamPlanets.forEach((p) => { const [x, y] = placeOnEllipse(p, p.a, box2); p.el.style.left = x + 'px'; p.el.style.top = y + 'px'; });
  }
  placeAll();
  (function spin() {
    requestAnimationFrame(spin); if (reduce) return; orbitT += .016;
    dreamPlanets.forEach((p) => { if (!p.paused) p.a += .004 * p.sp; });
    placeAll();
  })();
  window.addEventListener('resize', placeAll);

  /* ===== SPARKLE TRAIL ===== */
  if (!reduce) {
    let last = 0; const cols = ['#FF8FB8', '#FFE38A', '#CFE6FF', '#E3D6FF', '#C93D78'];
    window.addEventListener('pointermove', (e) => {
      const now = performance.now(); if (now - last < 45 || document.body.classList.contains('loading') || crawling) return; last = now;
      const s = document.createElement('span'); s.className = 'spark'; s.setAttribute('aria-hidden', 'true');
      s.textContent = Math.random() < .5 ? '✦' : '♥'; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.color = cols[(Math.random() * cols.length) | 0]; s.style.fontSize = (10 + Math.random() * 10) + 'px';
      document.body.appendChild(s); s.addEventListener('animationend', () => s.remove()); setTimeout(() => s.remove(), 1400);
    }, { passive: true });
  }

  /* ===== EASTER EGG: honk 5x ===== */
  let honks = 0, honkT;
  function confettiBurst() {
    if (typeof window.confetti !== 'function') return;
    window.confetti({ particleCount: 120, spread: 85, origin: { y: .55 }, colors: ['#FF8FB8', '#C93D78', '#FFE38A', '#CFE6FF', '#E3D6FF'], shapes: ['star', 'circle'], disableForReducedMotion: true });
  }
  $('#parkedCar').addEventListener('click', () => {
    Sound.honk(); honks++; clearTimeout(honkT); honkT = setTimeout(() => { honks = 0; }, 2500);
    $('#parkedCar').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 200 });
    const lines = ['Beep!', 'Beep beep!', 'Hey, that tickles the horn!', 'One more and something happens…'];
    if (honks < 5) { say(lines[honks - 1]); return; }
    honks = 0; rainbowRocket();
  });
  function rainbowRocket() {
    say('RAINBOW ROCKET MODE! You found my secret.'); toast('🌈 Secret unlocked: Rainbow Rocket!', 3600);
    document.body.classList.add('rainbow'); setTimeout(() => document.body.classList.remove('rainbow'), 6000);
    confettiBurst(); [72, 76, 79, 84, 88].forEach((m, i) => Sound.chime(m, i * .1)); Sound.whoosh();
    const r = document.createElement('div'); r.className = 'rocket-fly'; r.setAttribute('aria-hidden', 'true');
    r.innerHTML = '<svg viewBox="0 0 260 120"><path d="M0 60 L90 40 L90 80 Z" fill="#FF8FB8"/><path d="M0 60 L90 48 L90 72 Z" fill="#FFE38A"/><path d="M0 60 L90 54 L90 66 Z" fill="#CFE6FF"/><path d="M90 30 C 170 30 230 40 255 60 C 230 80 170 90 90 90 Z" fill="#FF8FB8" stroke="#4A2C3A" stroke-width="5"/><circle cx="190" cy="60" r="18" fill="#CFE6FF" stroke="#4A2C3A" stroke-width="5"/><path d="M110 30 L90 6 L140 30 Z M110 90 L90 114 L140 90 Z" fill="#E3D6FF" stroke="#4A2C3A" stroke-width="4" stroke-linejoin="round"/></svg>';
    document.body.appendChild(r);
    r.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${window.innerWidth + 450}px, ${-window.innerHeight * .25}px) rotate(-8deg)` }], { duration: 2400, easing: 'ease-in-out', fill: 'forwards' }).onfinish = () => r.remove();
  }

  /* ===== PROJECT 1: Puddle-Jumper ===== */
  const gc = $('#game'), g = gc.getContext('2d'), gMsg = $('#gameMsg');
  let best = parseInt(store.get('anew-best', '0'), 10) || 0;
  const game = { on: false, y: 180, ty: 180, clouds: [], t: 0, dist: 0, spawn: 0 };
  gMsg.textContent = `Dodge the clouds. Best: ${best} m`;
  function drawCar(x, y) {
    g.save(); g.translate(x, y);
    g.fillStyle = '#FFE38A'; g.beginPath(); g.ellipse(-36, 6, 10 + Math.random() * 4, 6, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#4A2C3A'; g.lineWidth = 4;
    g.fillStyle = 'rgba(207,230,255,.9)'; g.beginPath(); g.arc(4, -10, 15, Math.PI, 0); g.fill(); g.stroke();
    g.fillStyle = '#FFF6E8'; g.beginPath(); g.arc(4, -13, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4A2C3A'; g.beginPath(); g.arc(2, -13, 1.6, 0, 7); g.arc(8, -13, 1.6, 0, 7); g.fill();
    g.fillStyle = '#FF8FB8'; g.beginPath(); if (g.roundRect) g.roundRect(-30, -10, 64, 24, 12); else g.rect(-30, -10, 64, 24); g.fill(); g.stroke();
    g.restore();
  }
  function drawCloud(c) {
    g.fillStyle = document.body.classList.contains('space') ? '#E3D6FF' : '#FFFFFF'; g.strokeStyle = '#4A2C3A'; g.lineWidth = 3;
    g.beginPath(); g.arc(c.x, c.y, c.r, 0, Math.PI * 2); g.arc(c.x + c.r * .9, c.y + 4, c.r * .75, 0, Math.PI * 2); g.arc(c.x - c.r * .9, c.y + 4, c.r * .7, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  function frame() {
    g.fillStyle = document.body.classList.contains('space') ? '#120F2E' : '#E6F1FF'; g.fillRect(0, 0, 480, 360);
    g.fillStyle = '#FF8FB8'; for (let i = 0; i < 18; i++) { const sx = (i * 97 - game.t * .4) % 480; g.fillRect((sx + 480) % 480, (i * 53) % 340, 2, 2); }
    game.clouds.forEach(drawCloud); drawCar(80, game.y);
    g.fillStyle = document.body.classList.contains('space') ? '#FFF5F2' : '#4A2C3A'; g.font = '800 20px "Baloo 2", sans-serif'; g.fillText(`${Math.floor(game.dist)} m`, 390, 30);
  }
  function loop() {
    if (!game.on) return;
    game.t++; game.dist += .18 + game.t * .00012; game.y += (game.ty - game.y) * .18;
    game.spawn -= 1; if (game.spawn <= 0) { game.clouds.push({ x: 520, y: 30 + Math.random() * 300, r: 16 + Math.random() * 16 }); game.spawn = Math.max(28, 70 - game.t / 40); }
    const sp = 3.2 + game.t * .004; game.clouds.forEach((c) => { c.x -= sp; }); game.clouds = game.clouds.filter((c) => c.x > -80);
    if (game.clouds.some((c) => Math.hypot(c.x - 80, c.y - game.y) < c.r + 18)) { crash(); return; }
    frame(); requestAnimationFrame(loop);
  }
  function crash() {
    game.on = false; frame(); Sound.thud();
    const d = Math.floor(game.dist); if (d > best) { best = d; store.set('anew-best', String(best)); }
    gMsg.textContent = `Bonk! Into a cloud at ${d} m. Best: ${best} m`; $('#gameStart').textContent = 'Try again';
    gc.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
  }
  function aimGame(cy) { const r = gc.getBoundingClientRect(); game.ty = clamp((cy - r.top) / r.height * 360, 24, 336); }
  gc.addEventListener('pointermove', (e) => aimGame(e.clientY));
  gc.addEventListener('pointerdown', (e) => { aimGame(e.clientY); if (!game.on) startGame(); });
  gc.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp') { game.ty = clamp(game.ty - 40, 24, 336); e.preventDefault(); } if (e.key === 'ArrowDown') { game.ty = clamp(game.ty + 40, 24, 336); e.preventDefault(); } });
  gc.addEventListener('touchmove', (e) => { if (game.on) e.preventDefault(); }, { passive: false });
  function startGame() { if (game.on) return; Object.assign(game, { on: true, clouds: [], t: 0, dist: 0, spawn: 20 }); gMsg.textContent = 'Go go go!'; Sound.engine(); gc.focus({ preventScroll: true }); requestAnimationFrame(loop); }
  $('#gameStart').addEventListener('click', startGame);
  frame();

  /* ===== PROJECT 2: Star-Charger ===== */
  const ch = $('#charger');
  const pts = [[70, 270], [130, 150], [220, 200], [290, 90], [370, 160], [420, 280]];
  let visited = [];
  const lines = document.createElementNS(NS, 'g'); ch.appendChild(lines);
  pts.forEach(([x, y], i) => {
    const b = document.createElementNS(NS, 'g'); b.setAttribute('class', 'star-btn'); b.setAttribute('tabindex', '0'); b.setAttribute('role', 'button'); b.setAttribute('aria-label', `Star ${i + 1}`);
    b.innerHTML = `<circle cx="${x}" cy="${y}" r="26" fill="transparent"></circle><circle class="core" cx="${x}" cy="${y}" r="10" fill="#FFF5F2" stroke="#FF8FB8" stroke-width="3"></circle>`;
    const hit = () => tapStar(i, b); b.addEventListener('click', hit); b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } });
    ch.appendChild(b);
  });
  function tapStar(i, b) {
    if (visited.includes(i)) { Sound.note(220, { dur: .1, type: 'triangle', vol: .05 }); return; }
    const prev = visited[visited.length - 1]; visited.push(i);
    const core = $('.core', b); core.setAttribute('fill', '#FFE38A');
    if (prev !== undefined) {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', pts[prev][0]); l.setAttribute('y1', pts[prev][1]); l.setAttribute('x2', pts[i][0]); l.setAttribute('y2', pts[i][1]);
      l.setAttribute('stroke', '#FF8FB8'); l.setAttribute('stroke-width', '4'); l.setAttribute('stroke-linecap', 'round');
      const len = Math.hypot(pts[i][0] - pts[prev][0], pts[i][1] - pts[prev][1]); l.style.strokeDasharray = len; l.style.strokeDashoffset = len;
      lines.appendChild(l); l.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 350, fill: 'forwards' });
    }
    core.setAttribute('r', '16'); setTimeout(() => core.setAttribute('r', '10'), 180);
    Sound.chime(72 + visited.length * 2);
    const p = Math.round(visited.length / pts.length * 100); $('#chargeBar').style.width = p + '%'; $('#chargeLabel').textContent = `Charge: ${p}%`;
    if (visited.length === pts.length) { $('#chargeLabel').textContent = 'Charge: 100%. Car ready to fly!'; [72, 76, 79, 84].forEach((m, k) => Sound.chime(m, .15 + k * .1)); toast('⚡ Star-Charger full. You named a new constellation!'); confettiBurst(); }
  }
  $('#chargeReset').addEventListener('click', () => { visited = []; lines.replaceChildren(); $$('.core', ch).forEach((c) => c.setAttribute('fill', '#FFF5F2')); $('#chargeBar').style.width = '0%'; $('#chargeLabel').textContent = 'Charge: 0%'; });

  /* ===== PROJECT 3: Comet Courier ===== */
  const rp = $('#routePath'), comet = $('#comet'), houses = $('#houses'), rlen = rp.getTotalLength();
  rp.setAttribute('stroke-dasharray', rlen); rp.setAttribute('stroke-dashoffset', rlen);
  const stops = [.08, .3, .5, .72, .95].map((t) => { const pt = rp.getPointAtLength(rlen * t); return { t, x: pt.x, y: pt.y }; });
  stops.forEach((s) => {
    const h = document.createElementNS(NS, 'g');
    h.innerHTML = `<path d="M${s.x - 22} ${s.y + 54} L${s.x - 22} ${s.y + 28} L${s.x} ${s.y + 12} L${s.x + 22} ${s.y + 28} L${s.x + 22} ${s.y + 54} Z" fill="#4B4690" stroke="#FFF5F2" stroke-width="3" stroke-linejoin="round"></path><rect class="win" x="${s.x - 7}" y="${s.y + 32}" width="14" height="12" rx="3" fill="#0E0C24"></rect>`;
    houses.appendChild(h); s.win = $('.win', h);
  });
  let autoRoute = false, lastLit = 0;
  function setRoute(p) {
    rp.setAttribute('stroke-dashoffset', rlen * (1 - p));
    const pt = rp.getPointAtLength(rlen * p); comet.setAttribute('cx', pt.x); comet.setAttribute('cy', pt.y);
    let lit = 0; stops.forEach((s) => { const on = p >= s.t; s.win.setAttribute('fill', on ? '#FFE38A' : '#0E0C24'); if (on) lit++; });
    if (lit > lastLit) Sound.chime(76 + lit * 2); lastLit = lit;
    $('#routeLabel').textContent = `${lit} of 5 delivered`;
  }
  function routeFromScroll() {
    if (autoRoute) return;
    const r = $('#routeCard').getBoundingClientRect(), vh = window.innerHeight;
    setRoute(clamp((vh - r.top) / (vh * .9 + r.height * .3), 0, 1));
  }
  function tween(dur, fn, ease = (x) => x) { return new Promise((res) => { const t0 = performance.now(); (function step(now) { const k = clamp((now - t0) / dur, 0, 1); fn(ease(k)); if (k < 1) requestAnimationFrame(step); else res(); })(t0); }); }
  const easeInOut = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  $('#routePlay').addEventListener('click', async () => {
    if (autoRoute) return; autoRoute = true; lastLit = 0;
    await tween(3000, setRoute, easeInOut);
    toast('🌙 Five lullabies delivered. Everyone is asleep.'); setTimeout(() => { autoRoute = false; }, 1500);
  });

  /* ===== LEVEL-UP PATH ===== */
  const LV = [
    { n: 1, t: 'Spoon Tinkerer', c: 'Took apart my first rattle to see where the jingle lives.', tool: 'A spoon (it\'s a screwdriver)', col: '#C8F0DE' },
    { n: 2, t: 'Crib Mechanic', c: 'Gave my crib wheels. Then a motor. Then a seatbelt, just in case.', tool: 'Rubber-band engine', col: '#CFE6FF' },
    { n: 3, t: 'Junior Sky-Car Engineer', c: 'Now I build and fix flying cars at Cloudport Garage. Bay 3 is mine!', tool: 'Starlight fuel', col: '#FF8FB8', here: true },
    { n: 4, t: 'Orbit Architect', c: 'Next dream: a sky-car that can loop all the way around the Moon.', tool: 'Gravity wrench', future: true },
    { n: 5, t: 'Galaxy Bridge Builder', c: 'Big dream: a bridge between stars so nobody has to fly home alone.', tool: '??? (still inventing it)', future: true },
  ];
  const track = $('#track');
  LV.forEach((l) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'lvl' + (l.future ? ' lvl--future' : ''); b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="lvl__dot" style="background:${l.col || '#0E0C24'};color:#4A2C3A">${l.n}</span><b>${l.t}</b>${l.here ? '<span class="here label">You are here</span>' : ''}`;
    b.addEventListener('click', () => pickLevel(l, b)); track.appendChild(b); l.el = b;
  });
  function pickLevel(l, b, quiet) {
    $$('.lvl', track).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const d = $('#lvlDetail');
    d.innerHTML = `<div><span class="label">Level ${l.n} of 5 · ${l.future ? 'a dream' : l.here ? 'right now' : 'done'}</span><h3></h3><p></p></div><div class="label">Unlocks: <span class="tool"></span></div>`;
    $('h3', d).textContent = l.t; $('p', d).textContent = l.c; $('.tool', d).textContent = l.tool;
    if (!reduce) d.animate([{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'ease-out' });
    if (!quiet) Sound.chime(70 + l.n * 2);
  }
  pickLevel(LV[2], LV[2].el, true);

  /* ===== SPACE STORY + CLICK-TO-LAUNCH ROCKET ===== */
  const sp = $('#storyPath'), slen = sp.getTotalLength(), trav = $('#traveler'), scenes = $$('.scene'), altEl = $('#alt'), shell = $('#rocketShell');
  let launching = false;
  function placeTraveler(p, rocket) {
    const pt = sp.getPointAtLength(slen * p);
    trav.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    shell.setAttribute('opacity', rocket ? '1' : '0');
    altEl.textContent = (Math.round(384400 * (1 - p) / 100) * 100).toLocaleString('en-US') + ' km';
  }
  function storyScroll() {
    if (launching) return;
    const sec = $('#story').getBoundingClientRect(), vh = window.innerHeight;
    const p = clamp((vh * .5 - sec.top) / (sec.height - vh * .7), 0, 1);
    placeTraveler(p, p > .9);
    let on = 0; scenes.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * .6) on = i; });
    scenes.forEach((s, i) => s.classList.toggle('is-on', i === on));
  }
  function puff(x, y) {
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x + (Math.random() - .5) * 20); c.setAttribute('cy', y + 60); c.setAttribute('r', 10); c.setAttribute('fill', '#FFD3E4');
    $('#smoke').appendChild(c);
    c.animate([{ opacity: .9, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(2.6)' }], { duration: 1100, fill: 'forwards' }).onfinish = () => c.remove();
    c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center';
  }
  const rocketBtn = $('#rocketGo');
  let landed = false;
  rocketBtn.addEventListener('click', async () => {
    if (landed) { crawlTo('Dream orbits', () => jump($('#orbits'))); return; }
    if (launching) return; launching = true; rocketBtn.disabled = true;
    const box = $('#storySkyBox');
    placeTraveler(1, true);
    const cd = $('#countdown');
    for (const n of ['3', '2', '1']) { cd.textContent = n; Sound.beep(); cd.animate([{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, easing: 'ease-out' }); await wait(800); }
    cd.textContent = 'Liftoff!'; Sound.blastoff(); box.classList.add('shake');
    const flame = $('#flame'); const flick = setInterval(() => flame.setAttribute('transform', `scale(1 ${(0.8 + Math.random() * .6).toFixed(2)})`), 70);
    setTimeout(() => { cd.textContent = ''; box.classList.remove('shake'); }, 900);
    let lastPuff = 0;
    await tween(3200, (k) => {
      const p = 1 - k; placeTraveler(p, true);
      if (performance.now() - lastPuff > 90) { lastPuff = performance.now(); const pt = sp.getPointAtLength(slen * p); puff(pt.x, pt.y); }
    }, (x) => x * x * (3 - 2 * x));
    clearInterval(flick);
    $('#moon').animate([{ fill: '#FFF5F2' }, { fill: '#FFE38A' }, { fill: '#FFF5F2' }], { duration: 1200 });
    [72, 76, 79, 84, 88, 91].forEach((m, i) => Sound.chime(m, i * .09)); confettiBurst();
    toast('🌙 Touchdown! Anew made it home for a visit.', 3600);
    $('#launchCopy').textContent = 'Touchdown! Hi, Moon. I\'ll be back at Cloudport by bedtime. Come see what I dream about next.';
    rocketBtn.textContent = 'Visit my dream orbits →'; rocketBtn.disabled = false; landed = true;
    setTimeout(() => { launching = false; }, 2500);
  });
  let ticking = false;
  window.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; storyScroll(); routeFromScroll(); }); }, { passive: true });
  storyScroll(); routeFromScroll();

  /* ===== GUESTBOOK ===== */
  const SEED = [{ name: 'Puff', wish: 'Please make a car with a nap button.', at: '2026-10-17T20:05:00+05:30' }, { name: 'The Moon', wish: 'Come visit soon. I have your spot ready.', at: '2026-10-17T19:40:00+05:30' }];
  const loadGB = () => { try { return JSON.parse(store.get('anew-gb', 'null')) || SEED; } catch { return SEED; } };
  function renderGB(animateFirst) {
    const ul = $('#gbList');
    ul.replaceChildren(...loadGB().map((e) => { const li = document.createElement('li'); const s = document.createElement('strong'); s.textContent = e.name; const w = document.createElement('span'); w.textContent = e.wish; const t = document.createElement('time'); t.dateTime = e.at; t.textContent = ' · ' + new Date(e.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); li.append(s, w, t); return li; }));
    if (animateFirst && !reduce && ul.firstChild) ul.firstChild.animate([{ transform: 'translateY(40px) scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.3,1.6,.6,1)' });
  }
  $('#gbForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#gbName').value.trim().slice(0, 24), wish = $('#gbWish').value.trim().slice(0, 120); if (!name || !wish) return;
    store.set('anew-gb', JSON.stringify([{ name, wish, at: new Date().toISOString() }, ...loadGB()].slice(0, 50)));
    renderGB(true); e.target.reset(); Sound.chime(79); Sound.chime(86, .14);
    toast(`📡 Wish received, ${name}! Anew will read it at bedtime.`);
  });
  renderGB(false);

  /* ===== ODOMETER ===== */
  const odo = $('#odo'), total = String(1204 + visits).padStart(6, '0');
  odo.setAttribute('aria-label', `${Number(total)} cars launched`);
  [...total].forEach((d, i) => { const s = document.createElement('span'); s.textContent = '0'; odo.appendChild(s); let n = 0; const iv = setInterval(() => { s.textContent = String(n % 10); if (n >= +d + 10 + i * 3) { s.textContent = d; clearInterval(iv); } n++; }, 45); });

  /* ===== CHAOS MODE ===== */
  const chaos = $('#chaos');
  function setChaos(on) { document.body.classList.toggle('chaos', on); chaos.setAttribute('aria-pressed', String(on)); store.set('anew-chaos', on ? '1' : '0'); }
  chaos.addEventListener('click', () => { const on = !document.body.classList.contains('chaos'); setChaos(on); if (on) { toast('✺ CHAOS MODE ✺ welcome to 1999'); confettiBurst(); } });
  setChaos(store.get('anew-chaos') === '1');

  console.log('%c🍼🚗 hi from Anew! psst: my parked car has a very honkable horn.', 'color:#C93D78;font-weight:bold;font-size:13px');
})();
