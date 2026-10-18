import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '../../lib/util.js';
import Cloud from '../art/Cloud.jsx';

// Puffy clouds at different depths that drift apart as you scroll (GSAP ScrollTrigger scrub).
const CLOUDS = [
  { left: '-4%', top: '8%', w: 220, speed: 0.9, o: 0.95 },
  { left: '78%', top: '4%', w: 260, speed: 1.4, o: 0.9 },
  { left: '40%', top: '62%', w: 180, speed: 0.5, o: 0.7 },
  { left: '88%', top: '58%', w: 150, speed: 1.1, o: 0.8 },
  { left: '6%', top: '70%', w: 130, speed: 1.7, o: 0.85 },
  { left: '58%', top: '2%', w: 120, speed: 0.6, o: 0.6 },
];

export default function ParallaxClouds({ set = CLOUDS }) {
  const root = useRef(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    root.current.querySelectorAll('.pcloud').forEach((el) => {
      const speed = parseFloat(el.dataset.speed);
      gsap.to(el, {
        yPercent: -120 * speed, xPercent: (speed - 1) * 40, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
  }, { scope: root });

  return (
    <div className="pclouds" ref={root} aria-hidden="true">
      {set.map((c, i) => (
        <div key={i} className="pcloud" data-speed={c.speed} style={{ left: c.left, top: c.top, width: c.w, opacity: c.o }}>
          <Cloud style={{ width: '100%', height: 'auto', display: 'block' }} strokeWidth={2.5} />
        </div>
      ))}
    </div>
  );
}
