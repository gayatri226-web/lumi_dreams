import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext.jsx';
import { prefersReducedMotion } from '../lib/util.js';
import BabyHero from './BabyHero.jsx';
import FriendsBand from './FriendsBand.jsx';

export default function Hero({ entered }) {
  const { say, goTo } = useApp();
  const root = useRef(null);

  // Entrance once the visitor arrives from the preloader.
  useGSAP(() => {
    if (!entered || prefersReducedMotion()) return;
    gsap.from('.hero__text > *', { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)' });
    gsap.from('.baby-hero', { scale: 0.4, opacity: 0, duration: 0.9, ease: 'back.out(1.8)' });
    gsap.from('.friend svg', { y: 70, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'back.out(2)', delay: 0.3 });
    gsap.from('.parked', { x: -500, duration: 1.1, ease: 'power3.out', delay: 0.4 });
  }, { scope: root, dependencies: [entered] });

  const go = (e, id, title) => { e.preventDefault(); goTo(id, title); };

  return (
    <section className="hero" id="hello" ref={root}>
      <div className="wrap hero__grid">
        <div className="hero__text">
          <span className="hero__badge label">Cloudport Garage · Bay 3</span>
          <h1>Hello! I'm <span className="pinkt">Anew</span>.</h1>
          <p className="lead">A baby Moonling and Junior Sky-Car Engineer. I build flying cars so the littlest creatures get to bed on time.</p>
          <div className="hero__cta">
            <a className="btn" href="#workshop" onClick={(e) => go(e, 'workshop', 'The Workshop')}>See my sky-cars</a>
            <a className="btn btn--ghost" href="#story" onClick={(e) => go(e, 'story', 'My space story')}>Fly my story</a>
          </div>
          <p className="say" aria-live="polite">{say}</p>
        </div>
        <BabyHero wave={entered} />
      </div>
      <FriendsBand />
    </section>
  );
}
