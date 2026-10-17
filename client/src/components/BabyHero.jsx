import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Sound } from '../lib/sound.js';
import { pointOnEllipse, prefersReducedMotion } from '../lib/util.js';
import { Antenna, BabyHead, BabyParts, Cheeks, Goggles, WaveArm } from './art/SvgDefs.jsx';

const INK = '#4A2C3A';
const EYES = [{ cx: 78, cy: 100 }, { cx: 122, cy: 100 }];

// Little planets on tilted orbits around Anew. Ones on the far side pass behind the baby.
const PLANETS = [
  { rx: 190, ry: 70, rot: -14, speed: 0.5, phase: 0, color: '#FF8FB8', mark: '' },
  { rx: 150, ry: 54, rot: 18, speed: -0.7, phase: 2, color: '#FFE38A', mark: '★' },
  { rx: 176, ry: 132, rot: 0, speed: 0.35, phase: 4, color: '#CFE6FF', mark: '' },
  { rx: 190, ry: 70, rot: -14, speed: 0.5, phase: 3.14, color: '#C8F0DE', mark: 'z' },
];

export default function BabyHero({ wave }) {
  const { setSay } = useApp();
  const stage = useRef(null);
  const svg = useRef(null);
  const pupils = useRef([]);
  const planets = useRef([]);

  // Eyes follow the pointer (or touch); they wander on their own when nobody is pointing.
  useEffect(() => {
    let pointer = null, raf = 0, wander = 0;
    const look = (x, y) => {
      const el = svg.current; if (!el) return;
      const r = el.getBoundingClientRect(), s = r.width / 200;
      EYES.forEach((eye, i) => {
        const ex = r.left + eye.cx * s, ey = r.top + (eye.cy + 12) * s;
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
    let blinkT;
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

  // Orbiting planets.
  useEffect(() => {
    let raf = 0, t = 0;
    const reduce = prefersReducedMotion();
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
    if (!reduce) raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);

  const doWave = () => {
    const el = svg.current; if (!el) return;
    el.classList.remove('waving'); void el.getBoundingClientRect(); el.classList.add('waving');
    setTimeout(() => el.classList.remove('waving'), 2200);
  };
  useEffect(() => { if (wave) doWave(); }, [wave]);

  const onClick = (e) => {
    if (e.target.id === 'antennaStar') { Sound.chime(91); setSay('Ding! My antenna picks up starlight.'); return; }
    Sound.giggle(); setSay('Hehe! That tickles.'); doWave();
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
      <svg ref={svg} className="baby-hero" id="babyHero" viewBox="0 -12 200 252" role="img"
        aria-label="Anew, a cute moon baby in pink pajamas with goggles and a star antenna, watching your cursor" onClick={onClick}>
        <BabyParts />
        <g id="antenna"><Antenna starProps={{ id: 'antennaStar' }} /></g>
        <BabyHead />
        {EYES.map((eye, i) => (
          <g key={i}>
            <g ref={(el) => { pupils.current[i] = el; }}>
              <ellipse cx={eye.cx} cy={eye.cy} rx="11" ry="13" fill={INK} />
              <circle cx={eye.cx + 4} cy={eye.cy - 5} r="4.5" fill="#fff" />
              <circle cx={eye.cx - 3} cy={eye.cy + 5} r="2" fill="#fff" />
            </g>
            <rect className="lid" x={eye.cx - 14} y={eye.cy - 15} width="28" height="30" rx="12" fill="#FFF6E8" />
          </g>
        ))}
        <Cheeks />
        <g id="goggles"><Goggles /></g>
        <g id="heroArm"><WaveArm /></g>
      </svg>
    </div>
  );
}
