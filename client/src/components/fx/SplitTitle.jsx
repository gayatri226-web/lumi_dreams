import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '../../lib/util.js';

// A heading whose letters bounce up one by one when it scrolls into view (GSAP ScrollTrigger).
// Screen readers get the plain text; the per-letter spans are hidden from them.
export default function SplitTitle({ text, as: Tag = 'h2', className, accent, delay = 0, auto = true }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (!auto || prefersReducedMotion()) return;
    gsap.from(ref.current.querySelectorAll('.ch'), {
      yPercent: 110, rotate: 12, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.025, delay,
      scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
    });
  }, { scope: ref });

  const words = text.split(' ');
  return (
    <Tag ref={ref} className={`split ${className || ''}`} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className={`word${accent && w.replace(/[^\w]/g, '') === accent ? ' pinkt' : ''}`} aria-hidden="true">
          {w.split('').map((c, ci) => <span key={ci} className="ch">{c}</span>)}
          {wi < words.length - 1 && <span className="ch">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
