import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import Crawler from '../art/Crawler.jsx';

// Between pages: a pink polka-dot screen wipes in, Lumi crawls across leaving little hearts,
// the page changes underneath while it's covered, then the screen wipes away.
const COVER_MS = 1050;
const TOTAL_MS = 1850;

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
      heart.style.left = `${r.left + r.width * 0.25}px`;
      heart.style.top = `${r.bottom - 12}px`;
      root.current.appendChild(heart);
      heart.animate(
        [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.4) translateY(-10px)' }],
        { duration: 900, fill: 'forwards' },
      ).onfinish = () => heart.remove();
    }, 190);
    const mid = setTimeout(() => midway?.(), COVER_MS);
    const end = setTimeout(onDone, TOTAL_MS);
    return () => { clearInterval(pat); clearTimeout(mid); clearTimeout(end); };
  }, [midway, onDone]);

  return (
    <motion.div
      ref={root}
      className="crawl on"
      aria-hidden="true"
      initial={{ clipPath: 'circle(0% at 0% 50%)' }}
      animate={{ clipPath: 'circle(150% at 0% 50%)' }}
      exit={{ clipPath: 'circle(0% at 100% 50%)' }}
      transition={{ duration: 0.48, ease: [0.6, 0, 0.4, 1] }}
    >
      <div className="crawl__text">
        <div className="label">Hold on, crawling over…</div>
        <h2>{label}</h2>
      </div>
      <div className="crawl__floor" />
      <motion.div ref={baby} className="crawler" initial={{ x: '-110%' }} animate={{ x: '110vw' }} transition={{ duration: 2.1, ease: 'linear' }}>
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
