import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sound } from '../lib/sound.js';
import { pointOnEllipse, prefersReducedMotion } from '../lib/util.js';

// What's next: each dream circles sleeping Anew on its own orbit. Catch one to see progress.
const DREAMS = [
  { r: 80, speed: 1.6, color: '#FF8FB8', title: 'A car that folds into a pillow', text: "Fly to Grandma's, land, fold it up, take a nap on it. Perfect.", pct: 60 },
  { r: 122, speed: 1.1, color: '#FFE38A', title: 'Loop-the-Moon license', text: 'Pass my flying test so I can loop around the Moon without asking.', pct: 35 },
  { r: 162, speed: 0.8, color: '#CFE6FF', title: 'Seatbelts for ghosts', text: "Ghosts keep floating out of their seats. I'm designing very gentle straps.", pct: 20 },
  { r: 194, speed: 0.55, color: '#C8F0DE', title: 'A bridge between two stars', text: 'My biggest dream: a sparkly bridge so nobody ever flies home alone.', pct: 5 },
];
const RING_COLORS = ['#FF8FB8', '#FFC24D', '#9DB8FF', '#7BD3A8'];

export default function DreamOrbits() {
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

  const choose = (i) => { setPick(i); Sound.chime(74 + i * 3); };
  const hold = (i, v) => { paused.current[i] = v; };
  const d = DREAMS[pick];

  return (
    <section className="section" id="orbits">
      <div className="wrap">
        <div className="section__head reveal">
          <div><span className="label eyebrow">What's next</span><h2>Dream orbits</h2></div>
          <p>Every dream I have circles my head until I build it. Catch one to see how close it is.</p>
        </div>
        <div className="dreamsys">
          <div className="system" ref={system}>
            <svg viewBox="0 0 400 400" aria-hidden="true">
              {DREAMS.map((dr, i) => (
                <circle key={i} cx="200" cy="200" r={dr.r} fill="none" stroke={RING_COLORS[i]} strokeWidth="2" strokeDasharray="3 9" />
              ))}
              <circle cx="200" cy="200" r="44" fill="#FFD3E4" stroke="#4A2C3A" strokeWidth="4" />
              <g transform="translate(178 172) scale(.22)"><use href="#baby" /></g>
              <text x="200" y="262" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="13" fill="#C93D78">zzz…</text>
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
              <span className="label eyebrow">Orbit {pick + 1}</span>
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
