import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';

// Project 02: tap every star to draw a constellation and charge a sky-car.
const STARS = [[70, 270], [130, 150], [220, 200], [290, 90], [370, 160], [420, 280]];

export default function StarCharger() {
  const { showToast, celebrate, talk } = useApp();
  const [path, setPath] = useState([]);
  const pct = Math.round((path.length / STARS.length) * 100);
  const full = path.length === STARS.length;

  const tap = (i) => {
    if (path.includes(i)) { Sound.note(220, { dur: 0.1, type: 'triangle', vol: 0.05 }); return; }
    const next = [...path, i];
    setPath(next);
    Sound.chime(72 + next.length * 2);
    if (next.length === STARS.length) {
      Sound.arpeggio([72, 76, 79, 84], 0.1);
      showToast('⚡ Star-Charger full. You named a new constellation!');
      talk('Fully charged! Vroom vroom!');
      celebrate();
    }
  };
  const onKey = (e, i) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(i); } };

  return (
    <>
      <div className="screen" style={{ background: '#0E0C24' }}>
        <svg viewBox="0 0 480 360" role="group" aria-label="Star-Charger. Tap every star to draw a constellation.">
          {path.slice(1).map((s, k) => {
            const a = STARS[path[k]], b = STARS[s];
            return (
              <motion.line key={`${path[k]}-${s}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
                stroke="#FF8FB8" strokeWidth="4" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
            );
          })}
          {STARS.map(([x, y], i) => {
            const lit = path.includes(i);
            return (
              <g key={i} className="star-btn" tabIndex={0} role="button" aria-label={`Star ${i + 1}${lit ? ', connected' : ''}`}
                onClick={() => tap(i)} onKeyDown={(e) => onKey(e, i)}>
                <circle cx={x} cy={y} r="26" fill="transparent" />
                <motion.circle cx={x} cy={y} r="10" fill={lit ? '#FFE38A' : '#FFF5F2'} stroke="#FF8FB8" strokeWidth="3"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  animate={{ scale: lit ? [1.7, 1] : 1 }} transition={{ duration: 0.35 }} />
              </g>
            );
          })}
        </svg>
      </div>
      <h3>Star-Charger</h3>
      <p>Sky-cars run on starlight. Tap every star to draw a constellation and charge one up.</p>
      <div className="charge" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
      <div className="row">
        <span className="small" aria-live="polite">{full ? 'Charge: 100%. Car ready to fly!' : `Charge: ${pct}%`}</span>
        <button className="btn btn--ghost btn--ink" type="button" onClick={() => setPath([])}>Clear sky</button>
      </div>
    </>
  );
}
