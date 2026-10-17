import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sound } from '../lib/sound.js';
import { jumpTo, prefersReducedMotion, store } from '../lib/util.js';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// Visits are remembered per browser so Anew can say "welcome back" (counted once per page load).
const VISITS = (() => {
  const n = (parseInt(store.get('anew-visits', '0'), 10) || 0) + 1;
  store.set('anew-visits', String(n));
  return n;
})();

const CONFETTI_COLORS =['#FF8FB8', '#C93D78', '#FFE38A', '#CFE6FF', '#E3D6FF'];

export function AppProvider({ children }) {
  const [muted, setMuted] = useState(Sound.muted);
  const [space, setSpace] = useState(() => store.get('anew-space') === '1');
  const [chaos, setChaos] = useState(() => store.get('anew-chaos') === '1');
  const [rainbow, setRainbow] = useState(false);
  const [toast, setToast] = useState(null);
  const [crawl, setCrawl] = useState(null);
  const [say, setSay] = useState("Move your cursor. I'm watching (nicely).");
  const toastTimer = useRef(0);
  const crawling = useRef(false);

  const visits = VISITS;

  useEffect(() => { Sound.setMuted(muted); }, [muted]);
  useEffect(() => {
    document.body.classList.toggle('space', space);
    store.set('anew-space', space ? '1' : '0');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', space ? '#0E0C24' : '#FFF5F2');
  }, [space]);
  useEffect(() => {
    document.body.classList.toggle('chaos', chaos);
    store.set('anew-chaos', chaos ? '1' : '0');
  }, [chaos]);
  useEffect(() => { document.body.classList.toggle('rainbow', rainbow); }, [rainbow]);

  const showToast = useCallback((text, ms = 3200) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const celebrate = useCallback(() => {
    confetti({ particleCount: 120, spread: 85, origin: { y: 0.55 }, colors: CONFETTI_COLORS, shapes: ['star', 'circle'], disableForReducedMotion: true });
  }, []);

  // The pink crawl transition. `midway` runs while the overlay fully covers the page.
  const crawlTo = useCallback((label, midway) => {
    if (crawling.current) return;
    if (prefersReducedMotion()) { midway?.(); return; }
    crawling.current = true;
    setCrawl({ id: Date.now(), label, midway });
  }, []);
  const endCrawl = useCallback(() => { crawling.current = false; setCrawl(null); }, []);

  // Easter egg payoff: friends hop, confetti, chimes, and a rainbow rocket streaks across.
  const [rocketFlight, setRocketFlight] = useState(null);
  const launchRainbow = useCallback(() => {
    setRainbow(true);
    setTimeout(() => setRainbow(false), 6000);
    showToast('🌈 Secret unlocked: Rainbow Rocket!', 3600);
    celebrate();
    Sound.arpeggio([72, 76, 79, 84, 88]);
    Sound.whoosh();
    setRocketFlight(Date.now());
  }, [showToast, celebrate]);

  const goTo = useCallback((id, label) => crawlTo(label, () => jumpTo(id)), [crawlTo]);

  const value = useMemo(() => ({
    muted, setMuted, space, setSpace, chaos, setChaos, rainbow, setRainbow,
    toast, showToast, celebrate, crawl, crawlTo, endCrawl, goTo, say, setSay, visits,
    rocketFlight, setRocketFlight, launchRainbow,
  }), [muted, space, chaos, rainbow, toast, showToast, celebrate, crawl, crawlTo, endCrawl, goTo, say, visits, rocketFlight, launchRainbow]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
