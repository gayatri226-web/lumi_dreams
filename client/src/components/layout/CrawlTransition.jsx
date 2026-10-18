import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import Crawler from '../art/Crawler.jsx';

// Between pages: a pink nursery in 3D (a polka-dot floor in perspective with toy blocks tumbling
// in the air) wipes in. Lumi crawls across in a real crawling gait, leaving little hearts,
// the page changes underneath while it's covered, then the nursery wipes away.
const COVER_MS = 1100;
const TOTAL_MS = 2000;
const BLOCKS = [
  { ch: 'L', x: '12%', y: '22%', c: '#FF8FB8', d: 0 },
  { ch: 'U', x: '78%', y: '16%', c: '#FFE38A', d: -1.2 },
  { ch: 'M', x: '64%', y: '64%', c: '#CFE6FF', d: -2.1 },
  { ch: 'I', x: '22%', y: '68%', c: '#C8F0DE', d: -0.6 },
];

function Cube({ ch, c }) {
  return (
    <div className="cube">
      {['front', 'back', 'right', 'left', 'top', 'bottom'].map((f) => (
        <span key={f} className={`cube__face cube__face--${f}`} style={{ background: c }}>{ch}</span>
      ))}
    </div>
  );
}

function CrawlScreen({ label, midway, onDone }) {
  const root = useRef(null);
  const baby = useRef(null);

  useEffect(() => {
    Sound.giggle();
    let step = 0;
    const pat = setInterval(() => {
      Sound.pat(step++);
      const r = baby.current?.getBoundingClientRect();
      if (!r || !root.current) return;
      const heart = document.createElement('span');
      heart.className = 'heart-step';
      heart.textContent = '♥';
      heart.style.left = `${r.left + r.width * (step % 2 ? 0.3 : 0.62)}px`;
      heart.style.top = `${r.bottom - 14}px`;
      root.current.appendChild(heart);
      heart.animate(
        [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.4) translateY(-12px)' }],
        { duration: 900, fill: 'forwards' },
      ).onfinish = () => heart.remove();
    }, 175);
    const mid = setTimeout(() => midway?.(), COVER_MS);
    const end = setTimeout(onDone, TOTAL_MS);
    return () => { clearInterval(pat); clearTimeout(mid); clearTimeout(end); };
  }, [midway, onDone]);

  return (
    <motion.div
      ref={root}
      className="crawl on"
      aria-hidden="true"
      initial={{ clipPath: 'circle(0% at 0% 60%)' }}
      animate={{ clipPath: 'circle(150% at 0% 60%)' }}
      exit={{ clipPath: 'circle(0% at 100% 60%)' }}
      transition={{ duration: 0.5, ease: [0.6, 0, 0.4, 1] }}
    >
      <div className="crawl3d">
        <div className="crawl3d__floor" />
        {BLOCKS.map((b) => (
          <div key={b.ch} className="crawl3d__block" style={{ left: b.x, top: b.y, animationDelay: `${b.d}s` }}>
            <Cube ch={b.ch} c={b.c} />
          </div>
        ))}
      </div>
      <div className="crawl__text">
        <div className="label">Hold on, crawling over…</div>
        <h2>{label}</h2>
      </div>
      <motion.div ref={baby} className="crawler" initial={{ x: '-115%' }} animate={{ x: '112vw' }} transition={{ duration: 2.2, ease: [0.3, 0.05, 0.7, 0.95] }}>
        <Crawler style={{ width: '100%', display: 'block' }} />
      </motion.div>
    </motion.div>
  );
}

export default function CrawlTransition() {
  const { crawl, endCrawl } = useApp();
  return (
    <AnimatePresence>
      {crawl && <CrawlScreen key={crawl.id} label={crawl.label} midway={crawl.midway} onDone={endCrawl} />}
    </AnimatePresence>
  );
}
