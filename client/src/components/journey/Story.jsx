import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { prefersReducedMotion, wait } from '../../lib/util.js';
import { SCENES } from '../../data/content.js';
import StarSky from '../fx/StarSky.jsx';
import SplitTitle from '../fx/SplitTitle.jsx';
import Lumi from '../art/Lumi.jsx';

gsap.registerPlugin(ScrollTrigger);

const PATH = 'M150 100 C 60 200 240 280 150 380 C 60 470 230 540 150 600';
const MOON_KM = 384400;
const PLANETS = [
  { left: '78%', top: '12%', size: 90, color: '#FFB3CF', speed: 1.4 },
  { left: '92%', top: '46%', size: 46, color: '#9DB8FF', speed: 2.2 },
  { left: '60%', top: '70%', size: 64, color: '#FFE38A', speed: 1.1 },
  { left: '4%', top: '80%', size: 38, color: '#C8F0DE', speed: 2.6 },
];

// Scroll story: Lumi falls from the Moon down to Cloudport as you scroll (GSAP ScrollTrigger).
// At the end the visitor launches Lumi back home: spoken countdown, shake, flame, smoke, touchdown.
export default function Story() {
  const { showToast, celebrate, goTo, addStamp, talk } = useApp();
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
  const [phase, setPhase] = useState('ready');

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
        trigger: '.scenes', start: 'top 55%', end: 'bottom 75%',
        onUpdate: (self) => { if (!launching.current) place.current(self.progress, self.progress > 0.95); },
      });
      gsap.utils.toArray('.scene').forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: 'top 62%', end: 'bottom 38%', onToggle: (self) => { if (self.isActive) setActive(i); } });
        if (!prefersReducedMotion()) {
          gsap.from(el, { x: i % 2 ? 90 : -90, rotate: i % 2 ? 3 : -3, opacity: 0, duration: 0.8, ease: 'back.out(1.5)', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        }
      });
      if (!prefersReducedMotion()) {
        gsap.utils.toArray('.story-planet').forEach((el) => {
          gsap.to(el, { yPercent: -260 * parseFloat(el.dataset.speed), rotate: 40, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
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
    if (phase === 'landed') { goTo('/dreams', 'The Dream Observatory'); return; }
    if (launching.current) return;
    launching.current = true;
    setPhase('flying');
    setActive(SCENES.length);
    const box = skyBox.current.getBoundingClientRect();
    if (box.top < 90 || box.bottom > window.innerHeight) window.scrollBy({ top: box.top - 100, behavior: 'smooth' });
    place.current(1, true);
    for (const n of ['3', '2', '1']) {
      setCount(n); Sound.beep();
      speak({ 3: 'Three!', 2: 'Two!', 1: 'One!' }[n], { rate: 1.2 });
      await wait(850);
    }
    setCount('Liftoff!');
    speak('Liftoff! Wheeeee!');
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
    showToast('🌙 Touchdown! Lumi made it home for a visit.', 3600);
    talk('I made it! Hi, Moon! I missed you!');
    addStamp('journey');
    setPhase('landed');
    setTimeout(() => { launching.current = false; }, 2500);
  };

  return (
    <section className="section story" id="story" ref={section}>
      <StarSky density={1} />
      {PLANETS.map((p, i) => (
        <span key={i} className="story-planet" data-speed={p.speed} aria-hidden="true"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, background: p.color }} />
      ))}
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">My story · scroll to fall</span><SplitTitle text="From moon crumb to engineer" accent="engineer" /></div>
          <p>Scroll down and fall with me from the Moon to Cloudport. At the very end, you get to launch me back home.</p>
        </div>
        <div className="story__grid">
          <div className="story__sky" ref={skyBox}>
            <div className="alt label">Altitude<strong ref={alt}>384,400 km</strong></div>
            <div className="countdown" aria-live="assertive">
              <AnimatePresence mode="popLayout">
                {count && (
                  <motion.span key={count} initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.3 }}>
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <svg viewBox="0 0 300 660" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Lumi's journey between the Moon and Cloudport">
              <circle cx="150" cy="56" r="60" fill="#FFF5F2" opacity=".12" />
              <circle ref={moon} cx="150" cy="56" r="44" fill="#FFF5F2" stroke="#4A2C3A" strokeWidth="4" />
              <circle cx="134" cy="48" r="9" fill="#FFD3E4" />
              <circle cx="166" cy="70" r="6" fill="#FFD3E4" />
              <circle cx="160" cy="36" r="4" fill="#FFD3E4" />
              <path ref={path} d={PATH} fill="none" stroke="#FF8FB8" strokeWidth="4" strokeDasharray="3 12" strokeLinecap="round" />
              <ellipse cx="150" cy="634" rx="130" ry="18" fill="#FFD3E4" />
              <text x="150" y="640" textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight="800" fontSize="14" fill="#4A2C3A" letterSpacing="2">CLOUDPORT</text>
              <g ref={smoke} />
              <g ref={traveler}>
                <g ref={shell} opacity="0">
                  <path ref={flame} d="M-18 44 C -14 88 14 88 18 44 Z" fill="#FFE38A" />
                  <path d="M-9 44 C -7 68 7 68 9 44 Z" fill="#FF7A59" />
                  <path d="M-34 22 L-52 56 L-30 46 Z M34 22 L52 56 L30 46 Z" fill="#FFB3CF" stroke="#4A2C3A" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M0 -70 C 34 -46 40 0 34 46 L-34 46 C -40 0 -34 -46 0 -70 Z" fill="#FF8FB8" stroke="#4A2C3A" strokeWidth="4" />
                  <circle cx="0" cy="-6" r="29" fill="#CFE6FF" stroke="#4A2C3A" strokeWidth="4" />
                </g>
                <svg x="-27" y="-34" width="54" height="53" viewBox="0 -6 200 196"><Lumi crop="bust" /></svg>
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
            <li className={`scene scene--launch${active >= SCENES.length ? ' is-on' : ''}`}>
              <span className="label">Scene 5 · 0 km · Your turn</span>
              <h3>Back to the Moon</h3>
              <p>{phase === 'landed'
                ? "Touchdown! Hi, Moon. I'll be back at Cloudport by bedtime. Come see what I dream about next."
                : 'My rocket is fueled and ready. Press the big button and send me home for a visit.'}</p>
              <motion.button className="btn btn--big" type="button" onClick={launch} disabled={phase === 'flying'} data-nosfx
                whileHover={{ scale: phase === 'flying' ? 1 : 1.05 }} whileTap={{ scale: 0.95 }}>
                {phase === 'landed' ? 'Visit my dream observatory →' : phase === 'flying' ? 'Flying…' : '🚀 Launch Lumi to the Moon'}
              </motion.button>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
