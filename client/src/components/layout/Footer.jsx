import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { getVisits } from '../../lib/api.js';
import { prefersReducedMotion } from '../../lib/util.js';
import { PAGES } from '../../data/content.js';
import StarSky from '../fx/StarSky.jsx';
import Lumi from '../art/Lumi.jsx';
import Cloud from '../art/Cloud.jsx';

// "Every page ends at bedtime." The footer is a night sky where Lumi sleeps in a moon cradle.
// Visitors can play a lullaby on the star piano or tuck Lumi in (music box + blanket + night-light).
const KEYS = [
  { m: 60, n: '1' }, { m: 62, n: '2' }, { m: 64, n: '3' }, { m: 65, n: '4' },
  { m: 67, n: '5' }, { m: 69, n: '6' }, { m: 71, n: '7' }, { m: 72, n: '8' },
];
// "Twinkle Twinkle Little Star" (traditional, public domain) opens with 1 1 5 5 6 6 5.
const TWINKLE = [60, 60, 67, 67, 69, 69, 67];
const TICKER = '★ now boarding: Cloudport Express ★ please keep tiny hands inside the sky-car ★ best viewed past bedtime ★ honk if you love starlight ';

function Odometer({ value }) {
  const digits = String(value ?? 0).padStart(6, '0').split('');
  return (
    <span className="odo" aria-label={`${value ?? 0} visitors`}>
      {digits.map((d, i) => (
        <motion.span key={`${i}-${d}`} aria-hidden="true" initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}>
          {d}
        </motion.span>
      ))}
    </span>
  );
}

export default function Footer() {
  const { chaos, setChaos, showToast, celebrate, goTo, setMusic, music, addStamp } = useApp();
  const root = useRef(null);
  const cradle = useRef(null);
  const played = useRef([]);
  const [lit, setLit] = useState(-1);
  const [tucked, setTucked] = useState(false);
  const [awake, setAwake] = useState(false);
  const [visits, setVisits] = useState(null);

  useEffect(() => { getVisits().then((r) => setVisits(r.count)); }, []);
  useEffect(() => { document.body.classList.toggle('tucked', tucked); }, [tucked]);
  useEffect(() => { if (!music && tucked) setTucked(false); }, [music, tucked]);

  // The cradle rocks gently; the moon rises as the footer scrolls into view.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.to(cradle.current, { rotation: 6, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 0%' });
    gsap.from('.cradle-wrap', { y: 160, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 45%', scrub: true } });
  }, { scope: root });

  const play = (k, i) => {
    Sound.chime(k.m);
    setLit(i);
    setTimeout(() => setLit((x) => (x === i ? -1 : x)), 300);
    played.current = [...played.current, k.m].slice(-TWINKLE.length);
    if (played.current.join() === TWINKLE.join()) {
      played.current = [];
      setAwake(true);
      setTimeout(() => setAwake(false), 4500);
      celebrate({ origin: { y: 0.8 } });
      showToast('✨ You played my favorite lullaby!', 3600);
      setTimeout(() => speak('You played my favorite lullaby! Twinkle twinkle!'), 400);
      addStamp('secret');
    }
  };

  const tuck = () => {
    const next = !tucked;
    setTucked(next);
    setMusic(next);
    if (next) showToast('🌙 Shhh. Lumi is asleep. The music box is playing.');
    else speak('Good morning! That was a lovely nap.');
  };

  const toggleChaos = () => {
    const on = !chaos;
    setChaos(on);
    if (on) { showToast('✺ CHAOS MODE ✺ welcome to 1999'); celebrate(); }
  };

  return (
    <footer className="bedtime" ref={root}>
      <StarSky density={0.9} className="starsky bedtime__sky" />
      <div className="wrap bedtime__in">
        <div className="bedtime__scene">
          <div className="cradle-wrap">
            <div className="cradle" ref={cradle}>
              <svg className="cradle__string" viewBox="0 0 10 120" aria-hidden="true"><path d="M5 0 V120" stroke="#FFE38A" strokeWidth="2" strokeDasharray="3 5" /></svg>
              <svg className="cradle__moon" viewBox="0 0 320 260" role="img" aria-label={awake ? 'Lumi waking up in a crescent moon cradle' : 'Lumi asleep in a crescent moon cradle'}>
                <path d="M40 40 C 10 150 90 250 200 240 C 280 232 316 170 312 120 C 280 190 200 214 140 190 C 80 166 52 100 40 40 Z" fill="#FFE38A" stroke="#4A2C3A" strokeWidth="6" strokeLinejoin="round" />
                <svg x="96" y="30" width="170" height="166" viewBox="0 -6 200 196">
                  <Lumi crop="bust" mood={awake ? 'happy' : 'sleep'} />
                </svg>
                <AnimatePresence>
                  {tucked && (
                    <motion.path key="blanket" d="M70 170 C 120 140 230 140 290 150 C 300 190 250 228 190 232 C 130 236 84 214 70 170 Z"
                      fill="#FF8FB8" stroke="#4A2C3A" strokeWidth="5" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} />
                  )}
                </AnimatePresence>
                <path d="M120 180 C 160 196 240 196 300 170" fill="none" stroke="#4A2C3A" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" />
              </svg>
              {!awake && <div className="zzz" aria-hidden="true"><span>z</span><span>z</span><span>Z</span></div>}
            </div>
            <div className={`nightlight${tucked ? ' on' : ''}`} aria-hidden="true" />
          </div>

          <div className="bedtime__text">
            <span className="label">Every page ends at bedtime</span>
            <h2>Goodnight from Cloudport</h2>
            <p>Play Lumi a lullaby on the stars, or tuck Lumi in for a nap.</p>
            <div className="piano" role="group" aria-label="Star piano">
              {KEYS.map((k, i) => (
                <button key={k.m} type="button" className={`key${lit === i ? ' lit' : ''}`} onClick={() => play(k, i)} aria-label={`Star ${k.n}`} data-nosfx>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" /></svg>
                  <span>{k.n}</span>
                </button>
              ))}
            </div>
            <p className="hint">Psst. Lumi's favorite lullaby starts ★1 ★1 ★5 ★5 ★6 ★6 ★5.</p>
            <button className={`btn${tucked ? ' btn--ghost-light' : ''}`} type="button" onClick={tuck}>{tucked ? 'Wake Lumi up' : 'Tuck Lumi in'}</button>
          </div>
        </div>

        <div className="bedtime__grid">
          <div className="dash">
            <span className="label">Cloudport visitor odometer</span>
            <Odometer value={visits} />
            <span className="dash__note">One sky-car launched for every visitor.</span>
          </div>
          <nav className="foot-clouds" aria-label="Footer">
            {PAGES.map((p) => (
              <a key={p.path} href={p.path} className="cloud-btn cloud-btn--sm" onClick={(e) => { e.preventDefault(); goTo(p.path, p.title); }}>
                <Cloud className="cloud-shape" />
                <span>{p.label}</span>
              </a>
            ))}
          </nav>
          <div className="webring">
            <span className="label">Back to the clouds</span>
            <button type="button" className="uprocket" onClick={() => { Sound.whoosh(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <span aria-hidden="true">🚀</span> Fly me to the top
            </button>
          </div>
        </div>

        <div className="bedtime__bottom">
          <div className="badges" aria-hidden="true">
            <span className="b88">best viewed<br />past bedtime</span>
            <span className="b88 b88--pink">made with<br />♥ &amp; gsap</span>
            <span className="b88 b88--night">mern<br />powered</span>
            <span className="b88">🚧 under<br />construction</span>
          </div>
          <button className="pill pill--light" type="button" aria-pressed={chaos} onClick={toggleChaos}>✺ Chaos mode</button>
          <p className="credits">Lumi Moonbolt · Junior Sky-Car Engineer · Cloudport, Sky Level 3. Every sound here is made live, just for you.</p>
        </div>
      </div>
      <div className="ticker" aria-hidden="true"><div>{TICKER.repeat(2)}&nbsp;</div></div>
    </footer>
  );
}
