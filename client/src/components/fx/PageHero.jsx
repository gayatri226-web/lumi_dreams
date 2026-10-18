import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '../../lib/util.js';
import ParallaxClouds from './ParallaxClouds.jsx';
import SplitTitle from './SplitTitle.jsx';
import Lumi from '../art/Lumi.jsx';
import { useApp } from '../../context/AppContext.jsx';

// The banner at the top of each inner page: big bouncy title, parallax clouds, and a little Lumi
// peeking in from the side holding a sign.
const SMALL_CLOUDS = [
  { left: '-3%', top: '14%', w: 170, speed: 1.2, o: 0.9 },
  { left: '82%', top: '8%', w: 200, speed: 0.8, o: 0.85 },
  { left: '64%', top: '64%', w: 120, speed: 1.6, o: 0.7 },
];

export default function PageHero({ kicker, title, accent, text, sign }) {
  const { space } = useApp();
  const root = useRef(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from('.page-hero__lumi', { x: 220, rotate: 25, duration: 1.1, ease: 'elastic.out(1, .6)', delay: 0.3 });
    gsap.from('.page-hero__text p, .page-hero__text .label', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.2 });
    gsap.to('.page-hero__lumi', { y: -60, rotate: -8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
  }, { scope: root });

  return (
    <section className="page-hero" ref={root}>
      <ParallaxClouds set={SMALL_CLOUDS} />
      <div className="wrap page-hero__in">
        <div className="page-hero__text">
          <span className="label eyebrow">{kicker}</span>
          <SplitTitle as="h1" text={title} accent={accent} />
          <p>{text}</p>
        </div>
        <div className="page-hero__lumi" aria-hidden="true">
          <div className="sign">{sign}</div>
          <Lumi helmet={space} />
        </div>
      </div>
    </section>
  );
}
