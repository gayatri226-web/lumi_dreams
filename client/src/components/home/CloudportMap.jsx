import { useRef, useState } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { prefersReducedMotion } from '../../lib/util.js';
import SplitTitle from '../fx/SplitTitle.jsx';
import { SkyCarBody } from '../art/SkyCar.jsx';

gsap.registerPlugin(MotionPathPlugin);

// The home page's hub: Cloudport, a floating island in the clouds. Each building is a door
// to another page. The island rises into place as you scroll, and tiny sky-cars circle it.
const INK = '#4A2C3A';
const PLACES = [
  { id: 'garage', to: '/garage', title: 'The Sky-Car Garage', label: 'Sky-Car Garage', sub: 'Play with my machines', x: 190 },
  { id: 'launch', to: '/journey', title: 'My space journey', label: 'Launchpad', sub: 'Fly my story', x: 430 },
  { id: 'obs', to: '/dreams', title: 'The Dream Observatory', label: 'Dream Observatory', sub: 'See what I dream', x: 640 },
  { id: 'post', to: '/dreams#guestbook', title: 'The Wish Post Office', label: 'Wish Post Office', sub: 'Send me a wish', x: 850 },
];

function Building({ id }) {
  if (id === 'garage') return (
    <g>
      <rect x="120" y="300" width="150" height="110" rx="14" fill="#FFD3E4" stroke={INK} strokeWidth="5" />
      <path d="M108 308 L195 246 L282 308 Z" fill="#FF8FB8" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <rect x="148" y="336" width="94" height="74" rx="8" fill="#FFF5F2" stroke={INK} strokeWidth="4" />
      {[350, 364, 378, 392].map((y) => <path key={y} d={`M152 ${y} H238`} stroke="#FF8FB8" strokeWidth="4" />)}
      <circle cx="195" cy="282" r="13" fill="#FFE38A" stroke={INK} strokeWidth="4" />
      <path d="M189 282 h12 M195 276 v12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
  if (id === 'launch') return (
    <g>
      <rect x="470" y="236" width="14" height="174" fill="#CFE6FF" stroke={INK} strokeWidth="4" />
      <path d="M470 270 H446 M470 320 H446 M470 370 H446" stroke={INK} strokeWidth="4" />
      <path d="M430 222 C 452 238 458 270 454 330 L406 330 C 402 270 408 238 430 222 Z" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
      <circle cx="430" cy="276" r="13" fill="#CFE6FF" stroke={INK} strokeWidth="4" />
      <path d="M406 310 L390 340 L408 334 Z M454 310 L470 340 L452 334 Z" fill="#E3D6FF" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x="380" y="380" width="110" height="30" rx="10" fill="#FFE38A" stroke={INK} strokeWidth="5" />
      <path className="map-flame" d="M418 334 C 420 362 440 362 442 334 Z" fill="#FFB347" />
    </g>
  );
  if (id === 'obs') return (
    <g>
      <rect x="580" y="320" width="120" height="90" rx="12" fill="#E3D6FF" stroke={INK} strokeWidth="5" />
      <path d="M570 324 A70 70 0 0 1 710 324 Z" fill="#9DB8FF" stroke={INK} strokeWidth="5" />
      <path d="M640 256 V324" stroke={INK} strokeWidth="4" strokeDasharray="6 6" />
      <rect x="642" y="250" width="70" height="20" rx="8" transform="rotate(-28 642 260)" fill="#FFE38A" stroke={INK} strokeWidth="4" />
      <rect x="622" y="358" width="36" height="52" rx="16" fill="#FFF5F2" stroke={INK} strokeWidth="4" />
      <path d="M598 300 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#FFE38A" />
    </g>
  );
  return (
    <g>
      <rect x="796" y="318" width="110" height="92" rx="12" fill="#C8F0DE" stroke={INK} strokeWidth="5" />
      <path d="M784 324 L851 270 L918 324 Z" fill="#7BD3A8" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <rect x="822" y="342" width="58" height="40" rx="6" fill="#FFF5F2" stroke={INK} strokeWidth="4" />
      <path d="M822 344 L851 366 L880 344" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M851 298 c-6 -8 -18 -2 -12 8 l12 10 12 -10 c6 -10 -6 -16 -12 -8 z" fill="#FF8FB8" stroke={INK} strokeWidth="3" />
      <rect x="920" y="360" width="16" height="50" fill="#FF8FB8" stroke={INK} strokeWidth="4" />
      <rect x="910" y="346" width="36" height="22" rx="8" fill="#FF8FB8" stroke={INK} strokeWidth="4" />
    </g>
  );
}

export default function CloudportMap() {
  const { goTo } = useApp();
  const root = useRef(null);
  const [hover, setHover] = useState(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo('.island', { y: 160, scale: 0.86, rotate: -2 }, {
      y: 0, scale: 1, rotate: 0, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 25%', scrub: 1 },
    });
    gsap.from('.place', {
      scale: 0, transformOrigin: '50% 100%', duration: 0.7, ease: 'back.out(2.2)', stagger: 0.12,
      scrollTrigger: { trigger: '.island', start: 'top 70%', once: true },
    });
    root.current.querySelectorAll('.mini-car').forEach((car, i) => {
      gsap.to(car, {
        motionPath: { path: `#lane-${i}`, align: `#lane-${i}`, autoRotate: true, alignOrigin: [0.5, 0.5] },
        duration: 16 + i * 5, repeat: -1, ease: 'none', delay: -i * 4,
      });
    });
    gsap.to('.map-flame', { scaleY: 1.4, transformOrigin: '50% 0%', duration: 0.12, yoyo: true, repeat: -1 });
  }, { scope: root });

  const enter = (p) => { Sound.pop(); goTo(p.to, p.title); };
  const key = (e, p) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(p); } };

  return (
    <section className="section map" id="map" ref={root}>
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">Welcome to Cloudport</span><SplitTitle text="Where should we fly?" accent="fly" /></div>
          <p>This is my floating town. Tap a building and I'll crawl you there.</p>
        </div>
        <div className="island-wrap">
          <svg className="island" viewBox="0 0 1000 600" role="group" aria-label="Map of Cloudport">
            <path id="lane-0" d="M80 300 C 80 120 920 120 920 300 C 920 520 80 520 80 300 Z" fill="none" stroke="var(--lane)" strokeWidth="2" strokeDasharray="4 12" />
            <path id="lane-1" d="M150 200 C 300 60 700 60 850 200 C 960 300 760 260 500 230 C 260 205 40 300 150 200 Z" fill="none" stroke="none" />
            <path d="M60 430 C 40 390 120 370 180 390 C 220 350 330 360 360 390 C 420 360 520 362 560 390 C 620 355 740 360 780 390 C 850 365 960 380 940 430 C 960 480 860 510 780 490 C 720 530 600 525 540 500 C 470 530 360 530 300 502 C 230 525 120 515 90 480 C 40 480 40 450 60 430 Z" fill="var(--island)" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
            <path d="M150 505 C 200 560 260 540 300 506 M420 516 C 460 590 560 580 590 508 M700 506 C 740 556 800 540 820 494" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" opacity=".35" />
            <ellipse cx="500" cy="420" rx="420" ry="22" fill={INK} opacity=".08" />
            {PLACES.map((p) => (
              <motion.g key={p.id} className="place" role="link" tabIndex={0} aria-label={`${p.label}: ${p.sub}`}
                onClick={() => enter(p)} onKeyDown={(e) => key(e, p)}
                onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)}
                whileHover={{ y: -14 }} whileFocus={{ y: -14 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                style={{ cursor: 'pointer', transformBox: 'fill-box' }}>
                <Building id={p.id} />
                <g transform={`translate(${p.x} 170)`}>
                  <path d="M0 22 V50" stroke={INK} strokeWidth="4" />
                  <rect x={-p.label.length * 5.4 - 16} y="-16" width={p.label.length * 10.8 + 32} height="40" rx="20" fill={hover === p.id ? '#FF8FB8' : '#FFF5F2'} stroke={INK} strokeWidth="4" />
                  <text x="0" y="11" textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight="800" fontSize="20" fill={INK}>{p.label}</text>
                </g>
              </motion.g>
            ))}
            {[0, 1].map((i) => (
              <g key={i} className="mini-car"><g transform="scale(.16) translate(-210 -150)"><SkyCarBody /></g></g>
            ))}
          </svg>
          <div className="map-legend" aria-live="polite">
            {hover ? `${PLACES.find((p) => p.id === hover).sub} →` : 'Hover or tap a building'}
          </div>
        </div>
      </div>
    </section>
  );
}
