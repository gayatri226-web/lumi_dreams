import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { getName } from '../../lib/chat.js';
import { prefersReducedMotion } from '../../lib/util.js';
import StarSky from '../fx/StarSky.jsx';
import Lumi from '../art/Lumi.jsx';
import { SkyCarBody } from '../art/SkyCar.jsx';
import { SoundButton } from './Header.jsx';

// The arrival. Step 1: the visitor turns the key (this also unlocks sound and voice).
// Step 2: Lumi's sky-car flies in, Lumi waves and says hi out loud while the starlight tank fills.
// Step 3: "Launch" zooms the car away into the pink crawl transition.
export default function Preloader({ onEnter, onStart }) {
  const { visits, crawlTo, muted } = useApp();
  const root = useRef(null);
  const [stage, setStage] = useState('idle'); // idle | arriving | ready
  const [fuel, setFuel] = useState(0);
  const [typed, setTyped] = useState('');
  const leaving = useRef(false);
  const typer = useRef(0);
  const name = getName();
  const line = name
    ? `Welcome back, ${name}! That's visit number ${visits}. I kept your seat warm!`
    : visits > 1
      ? `Welcome back, friend! That's visit number ${visits}. I kept your seat warm!`
      : "Hi hi! I'm Lumi! Welcome to my little garage in the sky!";

  useEffect(() => () => clearInterval(typer.current), []);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from('.bigname span', { y: 90, rotation: () => gsap.utils.random(-25, 25), duration: 0.8, stagger: 0.12, ease: 'back.out(2.2)' });
    gsap.to('.bigname span', { y: -8, duration: 1.3, yoyo: true, repeat: -1, stagger: 0.15, ease: 'sine.inOut', delay: 1.2 });
    gsap.from('.ignite-wrap', { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.7 });
  }, { scope: root });

  const typeLine = () => {
    let i = 0;
    clearInterval(typer.current);
    typer.current = setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i % 3 === 0) Sound.note(900 + Math.random() * 300, { dur: 0.03, type: 'square', vol: 0.02 });
      if (i >= line.length) clearInterval(typer.current);
    }, 32);
  };

  const ignite = () => {
    if (stage !== 'idle') return;
    Sound.unlock();
    Sound.engine();
    onStart?.();
    setStage('arriving');
    const tank = { p: 0 };
    const q = gsap.utils.selector(root);
    if (prefersReducedMotion()) {
      speak(line); setTyped(line); setFuel(100); setStage('ready');
      return;
    }
    gsap.timeline()
      .to(q('.ignite-wrap'), { scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(2)' })
      .fromTo(q('.car'), { x: '-95vw', y: -80, rotation: -14, autoAlpha: 1 }, { x: 0, y: 0, rotation: 0, duration: 1.6, ease: 'power3.out' })
      .to(q('.car'), { rotation: 5, duration: 0.22, yoyo: true, repeat: 1, ease: 'sine.inOut' })
      .fromTo(q('.bubble'), { scale: 0, autoAlpha: 0 }, {
        scale: 1, autoAlpha: 1, transformOrigin: '0% 80%', duration: 0.5, ease: 'back.out(2)',
        onStart: () => { Sound.giggle(); speak(line); typeLine(); },
      }, '-=.2')
      .fromTo(q('.loader__fuel'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '<')
      .to(tank, { p: 100, duration: 2.6, ease: 'power1.inOut', onUpdate: () => setFuel(tank.p), onComplete: () => { setStage('ready'); Sound.chime(84); } });
  };

  const launch = async () => {
    if (leaving.current || stage !== 'ready') return;
    leaving.current = true;
    Sound.engine();
    speak('Wheee! Here we go!');
    if (!prefersReducedMotion()) {
      const q = gsap.utils.selector(root);
      gsap.to(q('.bubble'), { scale: 0.6, autoAlpha: 0, duration: 0.3 });
      gsap.to(q('.bigname span'), { y: -220, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'power2.in' });
      await gsap.to(q('.car'), { x: '85vw', y: -160, rotation: -12, scale: 0.7, duration: 0.9, ease: 'power3.in' });
    }
    crawlTo("Lumi's sky", onEnter);
  };

  const skip = () => { Sound.unlock(); onEnter(); };

  return (
    <div className={`loader stage-${stage}`} ref={root} role="dialog" aria-label="Lumi is arriving">
      <StarSky density={1.2} />
      <div className="loader__top">
        <SoundButton className="round round--light" />
        <button className="pill pill--light" type="button" onClick={skip}>Skip intro</button>
      </div>

      <div className="loader__name">
        <div className="label">A new baby has arrived</div>
        <div className="bigname" aria-label="Lumi">
          {'Lumi'.split('').map((ch, i) => <span key={i} aria-hidden="true">{ch}</span>)}
        </div>
      </div>

      <div className="loader__stage">
        <div className="ignite-wrap">
          <button className="ignite" type="button" onClick={ignite} data-nosfx>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 20 3M17 6l3 3M14 9l2 2" />
            </svg>
            <span>Start the engine</span>
          </button>
          <p className="ignite-hint">{muted ? 'Sound is off. Tap the speaker to hear Lumi talk.' : 'Turn your sound on. Lumi wants to say hi!'}</p>
        </div>

        <div className="loader__scene">
          <div className="car">
            <svg className="hover" viewBox="0 0 420 300" role="img" aria-label="Lumi waving from a pink flying car">
              <ellipse cx="205" cy="290" rx="120" ry="8" fill="#FF8FB8" fillOpacity=".25" />
              <svg x="148" y="2" width="176" height="172" viewBox="0 -6 200 196" overflow="visible">
                <Lumi crop="bust" />
              </svg>
              <g transform="translate(0 52)"><SkyCarBody /></g>
              <path d="M144 152 C 144 48 184 0 236 0 C 290 0 328 48 328 152 Z" fill="#CFE6FF" fillOpacity=".22" stroke="#4A2C3A" strokeWidth="5" />
              <path d="M170 60 q18 -36 52 -42" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".7" />
            </svg>
          </div>
          <div className="bubble" aria-live="polite">
            <div className="label">Incoming transmission</div>
            <h2>Hi hi! I'm Lumi.</h2>
            <p>{typed}<span className="caret" aria-hidden="true" /></p>
          </div>
        </div>
      </div>

      <div className="loader__fuel">
        <div className="label">{stage === 'ready' ? 'Tank full · ready for launch' : `Fueling up with starlight · ${Math.round(fuel)}%`}</div>
        <div className="fuel" aria-hidden="true"><span style={{ width: `${fuel}%` }} /></div>
        <button className={`btn${stage === 'ready' ? ' launch-ready' : ''}`} type="button" disabled={stage !== 'ready'} onClick={launch} data-nosfx>
          Launch into my world →
        </button>
      </div>
    </div>
  );
}
