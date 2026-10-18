import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { pointOnEllipse, prefersReducedMotion } from '../../lib/util.js';
import { DREAMS } from '../../data/content.js';
import SplitTitle from '../fx/SplitTitle.jsx';
import Lumi from '../art/Lumi.jsx';

// What's next: each dream circles sleeping Lumi on its own orbit. Catch one to see progress.
const RING_COLORS = ['#FF8FB8', '#FFC24D', '#9DB8FF', '#7BD3A8'];

export default function DreamOrbits() {
  const { addStamp, talk } = useApp();
  const root = useRef(null);
  const system = useRef(null);
  const planets = useRef([]);
  const angles = useRef(DREAMS.map((_, i) => i * 1.7));
  const paused = useRef(DREAMS.map(() => false));
  const [pick, setPick] = useState(0);

  useEffect(() => {
    let raf = 0;
    const place = () => {
      const box = system.current?.clientWidth || 0;
      DREAMS.forEach((d, i) => {
        const el = planets.current[i]; if (!el) return;
        const { x, y } = pointOnEllipse({ rx: d.r, ry: d.r }, angles.current[i], box);
        el.style.left = `${x}px`; el.style.top = `${y}px`;
      });
    };
    const spin = () => {
      raf = requestAnimationFrame(spin);
      DREAMS.forEach((d, i) => { if (!paused.current[i]) angles.current[i] += 0.004 * d.speed; });
      place();
    };
    place();
    if (!prefersReducedMotion()) raf = requestAnimationFrame(spin);
    window.addEventListener('resize', place);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', place); };
  }, []);

  // The whole system spins in and the rings draw themselves as it scrolls into view.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo('.system', { rotate: -90, scale: 0.6, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 25%', scrub: 1 } });
    gsap.from('.dream-card', { x: 100, opacity: 0, duration: 0.8, ease: 'back.out(1.6)', scrollTrigger: { trigger: root.current, start: 'top 60%', once: true } });
  }, { scope: root });

  const choose = (i) => {
    setPick(i);
    Sound.chime(74 + i * 3);
    addStamp('dreams');
    if (i === 3) talk('That one is my biggest dream.', { voice: true });
  };
  const hold = (i, v) => { paused.current[i] = v; };
  const d = DREAMS[pick];

  return (
    <section className="section" id="orbits" ref={root}>
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">What's next</span><SplitTitle text="Dream orbits" accent="orbits" /></div>
          <p>Every dream I have circles my head until I build it. Catch a planet to see how close it is.</p>
        </div>
        <div className="dreamsys">
          <div className="system" ref={system}>
            <svg viewBox="0 0 400 400" aria-hidden="true">
              {DREAMS.map((dr, i) => (
                <circle key={i} cx="200" cy="200" r={dr.r} fill="none" stroke={RING_COLORS[i]} strokeWidth="2.5" strokeDasharray="3 9" />
              ))}
              <circle cx="200" cy="200" r="46" fill="#FFD3E4" stroke="#4A2C3A" strokeWidth="4" />
              <svg x="162" y="158" width="76" height="74" viewBox="0 -6 200 196"><Lumi crop="bust" mood="sleep" /></svg>
              <text x="200" y="266" textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight="800" fontSize="14" fill="#C93D78">zzz…</text>
            </svg>
            {DREAMS.map((dr, i) => (
              <motion.button key={i} type="button" className="dplanet" ref={(el) => { planets.current[i] = el; }}
                style={{ background: dr.color }} aria-pressed={pick === i} aria-label={`Dream ${i + 1}: ${dr.title}`}
                onClick={() => choose(i)} onMouseEnter={() => hold(i, true)} onMouseLeave={() => hold(i, false)}
                onFocus={() => hold(i, true)} onBlur={() => hold(i, false)} whileTap={{ scale: 0.9 }}>
                {i + 1}
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={pick} className="dream-card" aria-live="polite"
              initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -8 }} transition={{ duration: 0.25 }}>
              <span className="label eyebrow">Orbit {pick + 1} of {DREAMS.length}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
              <div className="meter" aria-hidden="true">
                <motion.span initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
              </div>
              <p className="small" style={{ marginTop: 8 }}>{d.pct}% built</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
