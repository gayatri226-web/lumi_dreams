import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext.jsx';
import { Sound } from '../lib/sound.js';
import { prefersReducedMotion } from '../lib/util.js';
import StarSky from './StarSky.jsx';
import MuteButton from './MuteButton.jsx';
import { WaveArm } from './art/SvgDefs.jsx';

// The arrival: Anew's name pops in, the pink sky-car flies in and waves,
// the starlight tank fills, then "Launch" zooms the car off into the crawl transition.
export default function Preloader({ onEnter }) {
  const { visits, crawlTo } = useApp();
  const root = useRef(null);
  const [fuel, setFuel] = useState(0);
  const [ready, setReady] = useState(false);
  const leaving = useRef(false);

  useGSAP(() => {
    const done = () => { setFuel(100); setReady(true); };
    if (prefersReducedMotion()) { done(); return; }
    const tank = { p: 0 };
    gsap.timeline()
      .from('.bigname span', { y: 80, opacity: 0, rotation: () => gsap.utils.random(-25, 25), duration: 0.7, stagger: 0.12, ease: 'back.out(2.2)' })
      .from('.car', { x: '-80vw', y: -40, rotation: -10, duration: 1.7, ease: 'power3.out' }, 0.2)
      .to('.car', { rotation: 5, duration: 0.22, yoyo: true, repeat: 1, ease: 'sine.inOut' })
      .from('.bubble', { scale: 0, opacity: 0, transformOrigin: '0% 80%', duration: 0.55, ease: 'back.out(2)' }, '-=.2')
      .to(tank, { p: 100, duration: 2.1, ease: 'power1.inOut', onUpdate: () => setFuel(tank.p), onComplete: done }, '-=.3');
    gsap.to('.bigname span', { y: -6, duration: 1.2, yoyo: true, repeat: -1, stagger: 0.15, ease: 'sine.inOut', delay: 1.4 });
  }, { scope: root });

  const launch = async () => {
    if (leaving.current) return;
    leaving.current = true;
    Sound.unlock();
    Sound.engine();
    if (!prefersReducedMotion()) {
      const q = gsap.utils.selector(root);
      gsap.to(q('.bubble'), { scale: 0.6, opacity: 0, duration: 0.3 });
      gsap.to(q('.bigname span'), { y: -200, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'power2.in' });
      await gsap.to(q('.car'), { x: '80vw', y: -140, rotation: -12, scale: 0.7, duration: 0.9, ease: 'power3.in' });
    }
    crawlTo("Anew's world", onEnter);
  };

  const skip = () => { Sound.unlock(); onEnter(); };

  return (
    <div className="loader" ref={root} role="dialog" aria-label="Anew is arriving">
      <StarSky density={1.2} />
      <div className="loader__top">
        <MuteButton />
        <button className="pill" type="button" onClick={skip}>Skip intro</button>
      </div>

      <div className="loader__name">
        <div className="label">A new baby has arrived</div>
        <div className="bigname" aria-label="Anew">
          {'Anew'.split('').map((ch, i) => <span key={i} aria-hidden="true">{ch}</span>)}
        </div>
      </div>

      <div className="loader__stage">
        <div className="loader__scene">
          <div className="car">
            <svg className="hover" viewBox="0 0 420 260" role="img" aria-label="Anew waving from a pink flying car">
              <ellipse cx="200" cy="244" rx="120" ry="8" fill="#FF8FB8" fillOpacity=".25" />
              <g transform="translate(176 -6) scale(.6)">
                <use href="#baby" />
                <g id="waveArm"><WaveArm x={170} y={140} /></g>
              </g>
              <use href="#sky-car" />
              <path d="M150 100 C 150 30 190 8 236 8 C 282 8 318 38 318 100 Z" fill="#CFE6FF" fillOpacity=".28" stroke="#4A2C3A" strokeWidth="5" />
            </svg>
          </div>
          <div className="bubble">
            <div className="label">Incoming transmission</div>
            <h2>Hi hi! I'm Anew.</h2>
            <p>{visits > 1 ? `Welcome back, friend! Visit #${visits}. I kept your seat warm.` : 'Welcome to my garage in the sky. Buckle up!'}</p>
          </div>
        </div>
      </div>

      <div className="loader__fuel">
        <div className="label" aria-live="polite">{ready ? 'Tank full · ready for launch' : `Fueling up with starlight · ${Math.round(fuel)}%`}</div>
        <div className="fuel" aria-hidden="true"><span style={{ width: `${fuel}%` }} /></div>
        <button className={`btn${ready ? ' launch-ready' : ''}`} type="button" disabled={!ready} onClick={launch} data-nosfx>
          Launch into my world →
        </button>
      </div>
    </div>
  );
}
