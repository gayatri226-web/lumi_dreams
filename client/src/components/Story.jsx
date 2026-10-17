import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { Sound } from '../lib/sound.js';
import { wait } from '../lib/util.js';
import StarSky from './StarSky.jsx';

gsap.registerPlugin(ScrollTrigger);

const SCENES = [
  { km: '384,400 km', title: 'A crumb falls off the Moon', copy: 'One sleepy night the Moon sneezed. A tiny crumb tumbled off, and that crumb was me.' },
  { km: '300,000 km', title: 'Crash-landing in Cloudport', copy: 'I bounced into a scrapyard full of broken sky-cars. Nobody was fixing them, so I picked up a spoon.' },
  { km: '120,000 km', title: 'The teacup car', copy: 'A teacup, two springs and one very helpful firefly. It flew! Sort of. Mostly sideways.' },
  { km: '2 km', title: 'Cloudport hires a baby', copy: 'Now I fix cars for sleepy ghosts, foxes and turtles who need a ride home before bedtime.' },
];
const PATH = 'M150 100 C 60 200 240 280 150 380 C 60 470 230 540 150 600';
const MOON_KM = 384400;

// Scroll story: Anew falls from the Moon down to Cloudport as you scroll (GSAP ScrollTrigger).
// At the end the visitor launches Anew back home: countdown, shake, flame, smoke, touchdown.
export default function Story() {
  const { showToast, celebrate, goTo } = useApp();
  const section = useRef(null);
  const skyBox = useRef(null);
  const path = useRef(null);
  const traveler = useRef(null);
  const shell = useRef(null);
  const flame = useRef(null);
  const smoke = useRef(null);
  const moon = useRef(null);
  const alt = useRef(null);
  const launching = useRef(false);
  const place = useRef(() => {});
  const [active, setActive] = useState(0);
  const [count, setCount] = useState('');
  const [phase, setPhase] = useState('ready'); // ready | flying | landed

  useLayoutEffect(() => {
    const p = path.current;
    const len = p.getTotalLength();
    place.current = (k, rocket) => {
      const pt = p.getPointAtLength(len * k);
      traveler.current.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      shell.current.setAttribute('opacity', rocket ? '1' : '0');
      alt.current.textContent = `${(Math.round((MOON_KM * (1 - k)) / 100) * 100).toLocaleString('en-US')} km`;
      return pt;
    };
    place.current(0, false);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top 40%',
        end: 'bottom 85%',
        onUpdate: (self) => { if (!launching.current) place.current(self.progress, self.progress > 0.92); },
      });
      gsap.utils.toArray('.scene', section.current).forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: 'top 62%', end: 'bottom 38%', onToggle: (self) => { if (self.isActive) setActive(i); } });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  const puff = (x, y) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x + (Math.random() - 0.5) * 20);
    c.setAttribute('cy', y + 60);
    c.setAttribute('r', 10);
    c.setAttribute('fill', '#FFD3E4');
    smoke.current.appendChild(c);
    gsap.to(c, { attr: { r: 26 }, opacity: 0, duration: 1.1, ease: 'power1.out', onComplete: () => c.remove() });
  };

  const launch = async () => {
    if (phase === 'landed') { goTo('orbits', 'Dream orbits'); return; }
    if (launching.current) return;
    launching.current = true;
    setPhase('flying');
    setActive(SCENES.length);
    // Make sure the whole sky (Moon included) is on screen before liftoff.
    const box = skyBox.current.getBoundingClientRect();
    if (box.top < 90) window.scrollBy({ top: box.top - 100, behavior: 'smooth' });
    place.current(1, true);
    for (const n of ['3', '2', '1']) { setCount(n); Sound.beep(); await wait(800); }
    setCount('Liftoff!');
    Sound.blastoff();
    const shake = gsap.to(skyBox.current, { x: 2, y: -1, duration: 0.05, repeat: 17, yoyo: true, ease: 'none', onComplete: () => gsap.set(skyBox.current, { x: 0, y: 0 }) });
    const flicker = gsap.to(flame.current, { scaleY: 1.4, transformOrigin: '50% 0%', duration: 0.07, repeat: -1, yoyo: true });
    setTimeout(() => setCount(''), 900);
    const ride = { k: 1 };
    let lastPuff = 0;
    await gsap.to(ride, {
      k: 0, duration: 3.2, ease: 'power2.inOut',
      onUpdate: () => {
        const pt = place.current(ride.k, true);
        const now = performance.now();
        if (now - lastPuff > 90) { lastPuff = now; puff(pt.x, pt.y); }
      },
    });
    flicker.kill(); shake.kill();
    gsap.fromTo(moon.current, { attr: { fill: '#FFE38A' } }, { attr: { fill: '#FFF5F2' }, duration: 1.2 });
    Sound.arpeggio([72, 76, 79, 84, 88, 91], 0.09);
    celebrate();
    showToast('🌙 Touchdown! Anew made it home for a visit.', 3600);
    setPhase('landed');
    setTimeout(() => { launching.current = false; }, 2500);
  };

  return (
    <section className="section story" id="story" ref={section}>
      <StarSky density={1} />
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">My story · scroll to fly</span><h2>From moon crumb to engineer</h2></div>
          <p>Scroll down. I fall from the Moon to Cloudport. At the end, you get to launch me back home.</p>
        </div>
        <div className="story__grid">
          <div className="story__sky" ref={skyBox}>
            <div className="alt label">Altitude<strong ref={alt}>384,400 km</strong></div>
            <div className="countdown" aria-live="assertive">
              <AnimatePresence mode="popLayout">
                {count && (
                  <motion.span key={count} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.3 }}>
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <svg viewBox="0 0 300 660" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Anew's journey between the Moon and Cloudport">
              <circle cx="150" cy="56" r="60" fill="#FFF5F2" opacity=".12" />
              <circle ref={moon} cx="150" cy="56" r="44" fill="#FFF5F2" stroke="#4A2C3A" strokeWidth="4" />
              <circle cx="134" cy="48" r="9" fill="#FFD3E4" />
              <circle cx="166" cy="70" r="6" fill="#FFD3E4" />
              <circle cx="160" cy="36" r="4" fill="#FFD3E4" />
              <path ref={path} d={PATH} fill="none" stroke="#FF8FB8" strokeWidth="4" strokeDasharray="3 12" strokeLinecap="round" />
              <ellipse cx="150" cy="634" rx="130" ry="18" fill="#FFD3E4" />
              <text x="150" y="640" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="14" fill="#4A2C3A" letterSpacing="2">CLOUDPORT</text>
              <g ref={smoke} />
              <g ref={traveler}>
                <g ref={shell} opacity="0">
                  <path ref={flame} d="M-16 40 C -12 80 12 80 16 40 Z" fill="#FFE38A" />
                  <path d="M-8 40 C -6 62 6 62 8 40 Z" fill="#FF7A59" />
                  <path d="M-30 20 L-46 50 L-26 40 Z M30 20 L46 50 L26 40 Z" fill="#FFB3CF" stroke="#4A2C3A" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M0 -62 C 30 -40 36 0 30 42 L-30 42 C -36 0 -30 -40 0 -62 Z" fill="#FF8FB8" stroke="#4A2C3A" strokeWidth="4" />
                  <circle cx="0" cy="-4" r="24" fill="#CFE6FF" stroke="#4A2C3A" strokeWidth="4" />
                </g>
                <g transform="translate(-22 -30) scale(.22)"><use href="#baby" /></g>
              </g>
            </svg>
          </div>
          <ol className="scenes">
            {SCENES.map((s, i) => (
              <li key={s.title} className={`scene${active === i ? ' is-on' : ''}`}>
                <span className="label">Scene {i + 1} · {s.km}</span>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </li>
            ))}
            <li className={`scene${active >= SCENES.length ? ' is-on' : ''}`}>
              <span className="label">Scene 5 · 0 km · Your turn</span>
              <h3>Back to the Moon</h3>
              <p>{phase === 'landed'
                ? "Touchdown! Hi, Moon. I'll be back at Cloudport by bedtime. Come see what I dream about next."
                : 'My rocket is fueled and ready. Press the big button and send me home for a visit.'}</p>
              <motion.button className="btn" type="button" onClick={launch} disabled={phase === 'flying'} data-nosfx
                whileHover={{ scale: phase === 'flying' ? 1 : 1.04 }} whileTap={{ scale: 0.96 }}>
                {phase === 'landed' ? 'Visit my dream orbits →' : phase === 'flying' ? 'Flying…' : 'Launch Anew to the Moon'}
              </motion.button>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
