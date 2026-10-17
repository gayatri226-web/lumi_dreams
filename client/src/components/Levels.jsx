import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sound } from '../lib/sound.js';

// How Anew grows as an engineer. Levels 4 and 5 are dreams still ahead.
export const LEVELS = [
  { n: 1, title: 'Spoon Tinkerer', copy: 'Took apart my first rattle to see where the jingle lives.', tool: "A spoon (it's a screwdriver)", color: '#C8F0DE' },
  { n: 2, title: 'Crib Mechanic', copy: 'Gave my crib wheels. Then a motor. Then a seatbelt, just in case.', tool: 'Rubber-band engine', color: '#CFE6FF' },
  { n: 3, title: 'Junior Sky-Car Engineer', copy: 'Now I build and fix flying cars at Cloudport Garage. Bay 3 is mine!', tool: 'Starlight fuel', color: '#FF8FB8', here: true },
  { n: 4, title: 'Orbit Architect', copy: 'Next dream: a sky-car that can loop all the way around the Moon.', tool: 'Gravity wrench', future: true },
  { n: 5, title: 'Galaxy Bridge Builder', copy: 'Big dream: a bridge between stars so nobody has to fly home alone.', tool: '??? (still inventing it)', future: true },
];

export default function Levels() {
  const [pick, setPick] = useState(2);
  const lvl = LEVELS[pick];
  const choose = (i) => { setPick(i); Sound.chime(70 + LEVELS[i].n * 2); };

  return (
    <section className="section" id="levels" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="levels reveal">
          <div className="section__head">
            <div><span className="label" style={{ color: 'var(--pink)' }}>Engineer level-up path</span><h2>How I'm growing up</h2></div>
            <p>Each level unlocks a new tool. Levels 4 and 5 are still dreams. Tap a level.</p>
          </div>
          <div className="track">
            {LEVELS.map((l, i) => (
              <button key={l.n} type="button" className={`lvl${l.future ? ' lvl--future' : ''}`} aria-pressed={pick === i} onClick={() => choose(i)}>
                <span className="lvl__dot" style={{ background: l.color || '#0E0C24', color: '#4A2C3A' }}>{l.n}</span>
                <b>{l.title}</b>
                {l.here && <span className="here label">You are here</span>}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={lvl.n} className="lvl-detail" aria-live="polite"
              initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.25 }}>
              <div>
                <span className="label">Level {lvl.n} of 5 · {lvl.future ? 'a dream' : lvl.here ? 'right now' : 'done'}</span>
                <h3>{lvl.title}</h3>
                <p>{lvl.copy}</p>
              </div>
              <div className="label">Unlocks: <span>{lvl.tool}</span></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
