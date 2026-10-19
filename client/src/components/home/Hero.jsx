import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { prefersReducedMotion } from '../../lib/util.js';
import ParallaxClouds from '../fx/ParallaxClouds.jsx';
import OrbitLumi from './OrbitLumi.jsx';

export default function Hero({ entered }) {
  const { say, goTo } = useApp();
  const root = useRef(null);

  useGSAP(() => {
    if (!entered || prefersReducedMotion()) return;
    gsap.from('.hero .ch', { yPercent: 120, rotate: 10, opacity: 0, duration: 0.7, stagger: 0.035, ease: 'back.out(2)' });
    gsap.from(['.hero__badge', '.hero .lead', '.hero__cta', '.speech'], { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.6)', delay: 0.3 });
    gsap.from('.lumi-btn', { scale: 0.3, opacity: 0, duration: 1, ease: 'elastic.out(1, .6)', delay: 0.2 });
    // As you scroll away, Lumi floats up and the text drifts back (scrubbed).
    gsap.to('.orbit-stage', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__text', { yPercent: 12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'center center', end: 'bottom top', scrub: true } });
  }, { scope: root, dependencies: [entered] });

  const go = (e, path, label) => { e.preventDefault(); goTo(path, label); };
  const big = (word, cls = '') => (
    <span className={`word ${cls}`} aria-hidden="true">{word.split('').map((c, i) => <span key={i} className="ch">{c}</span>)}</span>
  );

  return (
    <section className="hero" id="hello" ref={root}>
      <ParallaxClouds />
      <div className="wrap hero__grid">
        <div className="hero__text">
          <span className="hero__badge label">Chapter 1 · Meet Lumi · Cloudport Bay 3</span>
          <h1 aria-label="Hi! I'm Lumi.">{big('Hi!')}{' '}{big("I'm")}<br />{big('Lumi.', 'pinkt')}</h1>
          <p className="lead">A baby Moonling and Junior Space-Car Engineer. I build flying sky-cars in Cloudport, and now I'm teaching them to fly all the way to the Moon.</p>
          <div className="hero__cta">
            <a className="btn" href="/garage" onClick={(e) => go(e, '/garage', 'The Sky-Car Garage')}>Visit my garage</a>
            <a className="btn btn--ghost" href="/origin" onClick={(e) => go(e, '/origin', 'Where I come from')}>See where I come from</a>
          </div>
          <div className="speech" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.span key={say} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{say}</motion.span>
            </AnimatePresence>
          </div>
        </div>
        <OrbitLumi entered={entered} />
      </div>
      <a className="scroll-hint" href="#map" onClick={(e) => { e.preventDefault(); document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }); }}>
        <span>Scroll to explore Cloudport</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
      </a>
    </section>
  );
}
