import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { pointOnEllipse, prefersReducedMotion } from '../../lib/util.js';
import Lumi, { LUMI_EYES } from '../art/Lumi.jsx';
import Cloud from '../art/Cloud.jsx';

// Big Lumi in the hero, standing on a cloud with little dream planets orbiting around.
// Eyes follow the pointer (or wander on touch screens), Lumi blinks, and talks when clicked.
const PLANETS = [
  { rx: 190, ry: 70, rot: -14, speed: 0.5, phase: 0, color: '#FF8FB8', mark: '' },
  { rx: 150, ry: 54, rot: 18, speed: -0.7, phase: 2, color: '#FFE38A', mark: '★' },
  { rx: 176, ry: 132, rot: 0, speed: 0.35, phase: 4, color: '#CFE6FF', mark: '' },
  { rx: 190, ry: 70, rot: -14, speed: 0.5, phase: 3.14, color: '#C8F0DE', mark: 'z' },
];
const LINES = [
  'Hehe! That tickles!',
  'Did you know I can fix a sky-car with just a spoon?',
  "My hood has cloud ears. They're for hearing dreams.",
  'Boop! You found my belly star.',
  "I'm two hundred and twelve days old. Practically an engineer.",
  'Want to see my garage? Tap the Garage cloud!',
];

export default function OrbitLumi({ entered }) {
  const { talk, space } = useApp();
  const stage = useRef(null);
  const svg = useRef(null);
  const pupils = useRef([]);
  const planets = useRef([]);
  const lineIdx = useRef(0);

  useEffect(() => {
    let pointer = null, raf = 0, wander = 0, blinkT = 0;
    const look = (x, y) => {
      const el = svg.current; if (!el) return;
      const r = el.getBoundingClientRect(), s = r.width / 200;
      LUMI_EYES.forEach((eye, i) => {
        const ex = r.left + eye.cx * s, ey = r.top + (eye.cy + 6) * s;
        const dx = x - ex, dy = y - ey, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
        pupils.current[i]?.setAttribute('transform', `translate(${((dx / d) * 5 * k).toFixed(1)} ${((dy / d) * 5 * k).toFixed(1)})`);
      });
    };
    const onMove = (e) => {
      pointer = [e.clientX, e.clientY];
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; look(pointer[0], pointer[1]); });
    };
    const roam = setInterval(() => {
      if (pointer || !svg.current) return;
      const r = svg.current.getBoundingClientRect();
      wander += 0.9;
      look(r.left + r.width / 2 + Math.cos(wander) * 300, r.top + r.height / 2 + Math.sin(wander) * 140);
    }, 1300);
    const blink = () => {
      blinkT = setTimeout(() => {
        svg.current?.classList.add('blink');
        setTimeout(() => svg.current?.classList.remove('blink'), 130);
        blink();
      }, 2400 + Math.random() * 3200);
    };
    blink();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      clearInterval(roam); clearTimeout(blinkT); cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    let raf = 0, t = 0;
    const place = () => {
      const box = stage.current?.clientWidth || 0;
      PLANETS.forEach((p, i) => {
        const el = planets.current[i]; if (!el) return;
        const { x, y, depth } = pointOnEllipse(p, t * p.speed + p.phase, box);
        el.style.left = `${x}px`; el.style.top = `${y}px`;
        el.classList.toggle('front', depth > 0);
        el.style.scale = (0.75 + (depth + 1) * 0.2).toFixed(2);
      });
    };
    const spin = () => { raf = requestAnimationFrame(spin); t += 0.016; place(); };
    place();
    if (!prefersReducedMotion()) raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);

  const wave = () => {
    const el = svg.current; if (!el) return;
    el.classList.remove('waving'); void el.getBoundingClientRect(); el.classList.add('waving');
    setTimeout(() => el.classList.remove('waving'), 2200);
  };
  useEffect(() => { if (entered) wave(); }, [entered]);

  const onClick = () => {
    Sound.giggle();
    talk(LINES[lineIdx.current % LINES.length]);
    lineIdx.current += 1;
    wave();
  };

  return (
    <div className="orbit-stage" ref={stage}>
      <svg className="rings" viewBox="0 0 400 400" aria-hidden="true">
        <ellipse cx="200" cy="200" rx="190" ry="70" transform="rotate(-14 200 200)" fill="none" stroke="#FF8FB8" strokeWidth="2.5" strokeDasharray="4 10" />
        <ellipse cx="200" cy="200" rx="150" ry="54" transform="rotate(18 200 200)" fill="none" stroke="#FFC24D" strokeOpacity=".8" strokeWidth="2.5" strokeDasharray="4 10" />
        <ellipse cx="200" cy="200" rx="176" ry="132" fill="none" stroke="#9DB8FF" strokeOpacity=".6" strokeWidth="2" strokeDasharray="2 12" />
      </svg>
      {PLANETS.map((p, i) => (
        <span key={i} ref={(el) => { planets.current[i] = el; }} className="planet" aria-hidden="true" style={{ background: p.color }}>{p.mark}</span>
      ))}
      <Cloud className="hero-cloud" />
      <button className="lumi-btn" type="button" onClick={onClick} aria-label="Lumi, a moon baby in a pink cloud-ear hood. Click to hear Lumi talk." data-nosfx>
        <Lumi svgRef={svg} className="lumi-hero" pupilRefs={pupils} helmet={space} />
      </button>
    </div>
  );
}
