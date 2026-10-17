import { useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { Sound } from '../lib/sound.js';
import Friend, { FRIENDS } from './art/Friend.jsx';

const SHEET = [
  ['Name', 'Anew Moonbolt (say it “a-NEW”)'],
  ['What I am', 'A baby Moonling in pink star pajamas, with a star antenna and goggles three sizes too big.'],
  ['What I do', 'Junior Sky-Car Engineer. I build and fix flying cars for sleepy creatures.'],
  ['My story', 'I fell off the Moon, landed in a scrapyard, and built my first car from a teacup.'],
  ['Tagline', '“Small hands. Big launches.”'],
];
const HONK_LINES = ['Beep!', 'Beep beep!', 'Hey, that tickles the horn!', 'One more and something happens…'];

export default function FriendsBand() {
  const { setSay, launchRainbow } = useApp();
  const honks = useRef(0);
  const timer = useRef(0);
  const car = useAnimationControls();

  // Easter egg: honk the parked car five times.
  const honk = () => {
    Sound.honk();
    car.start({ y: [0, -10, 0], transition: { duration: 0.2 } });
    honks.current += 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { honks.current = 0; }, 2500);
    if (honks.current < 5) { setSay(HONK_LINES[honks.current - 1]); return; }
    honks.current = 0;
    setSay('RAINBOW ROCKET MODE! You found my secret.');
    launchRainbow();
  };

  return (
    <div className="band">
      <div className="wrap" style={{ position: 'relative' }}>
        <motion.button className="parked" type="button" aria-label="Anew's parked sky-car" onClick={honk} animate={car} whileHover={{ rotate: -3 }} data-nosfx>
          <svg viewBox="0 0 420 240" aria-hidden="true"><use href="#sky-car" /></svg>
        </motion.button>
        <div className="lineup">
          {FRIENDS.map((f) => (
            <motion.div key={f.id} className="friend" whileHover={{ y: -12, rotate: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
              <Friend {...f} />
            </motion.div>
          ))}
        </div>
        <dl className="sheet" aria-label="Character sheet">
          {SHEET.map(([k, v]) => (
            <div key={k}><dt className="label">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}
