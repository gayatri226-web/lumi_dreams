import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, useAnimationControls } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { prefersReducedMotion } from '../../lib/util.js';
import SplitTitle from '../fx/SplitTitle.jsx';
import Friend, { FRIENDS } from '../art/Friend.jsx';
import SkyCar from '../art/SkyCar.jsx';

// Lumi's crew, plus the parked sky-car (Easter egg: honk it five times).
const HONK_LINES = ['Beep!', 'Beep beep!', 'Hey, that tickles the horn!', 'One more and something happens…'];

export default function Crew() {
  const { talk, launchRainbow } = useApp();
  const root = useRef(null);
  const honks = useRef(0);
  const timer = useRef(0);
  const car = useAnimationControls();

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from('.crew .friend', {
      y: 120, rotate: () => gsap.utils.random(-20, 20), opacity: 0, duration: 0.8, ease: 'back.out(1.8)', stagger: 0.08,
      scrollTrigger: { trigger: '.crew__line', start: 'top 85%', once: true },
    });
    gsap.from('.crew .parked', { x: -600, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.crew__line', start: 'top 85%', once: true } });
  }, { scope: root });

  const honk = () => {
    Sound.honk();
    car.start({ y: [0, -12, 0], rotate: [0, -3, 0], transition: { duration: 0.25 } });
    honks.current += 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { honks.current = 0; }, 2500);
    if (honks.current < 5) { talk(HONK_LINES[honks.current - 1], { voice: false }); return; }
    honks.current = 0;
    talk('RAINBOW ROCKET MODE! You found my secret.', { voice: false });
    speak('Rainbow rocket mode! You found my secret!');
    launchRainbow();
  };

  const hello = (f) => { Sound.pop(); talk(`That's ${f.name.split(',')[0]}! ${f.job}.`, { voice: false }); };

  return (
    <section className="section crew" ref={root}>
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">My crew</span><SplitTitle text="The Cloudport crew" accent="crew" /></div>
          <p>Every engineer needs a team. Say hi to them. And maybe honk my car. A few times.</p>
        </div>
        <div className="crew__line">
          {FRIENDS.map((f) => (
            <motion.button key={f.id} type="button" className="friend" onClick={() => hello(f)} aria-label={`${f.name}, ${f.job}`}
              whileHover={{ y: -14, rotate: -4 }} whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} data-nosfx>
              <Friend {...f} />
              <span className="friend__job">{f.job}</span>
            </motion.button>
          ))}
          <motion.button className="parked" type="button" aria-label="Lumi's parked sky-car" onClick={honk} animate={car} whileHover={{ rotate: -3 }} data-nosfx>
            <SkyCar />
            <span className="friend__job">Honk me</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
