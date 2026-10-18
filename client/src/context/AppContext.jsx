import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Sound } from '../lib/sound.js';
import { speak, stopSpeaking } from '../lib/voice.js';
import { prefersReducedMotion, store } from '../lib/util.js';
import { STAMPS } from '../data/content.js';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// Visits are remembered per browser so Lumi can say "welcome back" (counted once per page load).
const VISITS = (() => {
  const n = (parseInt(store.get('lumi-visits', '0'), 10) || 0) + 1;
  store.set('lumi-visits', String(n));
  return n;
})();

const CONFETTI_COLORS = ['#FF8FB8', '#C93D78', '#FFE38A', '#CFE6FF', '#E3D6FF'];
const loadStamps = () => {
  try { return new Set(JSON.parse(store.get('lumi-stamps', '[]'))); } catch { return new Set(); }
};

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const [muted, setMutedState] = useState(Sound.muted);
  const [music, setMusicState] = useState(false);
  const [space, setSpace] = useState(() => store.get('lumi-space') === '1');
  const [chaos, setChaos] = useState(() => store.get('lumi-chaos') === '1');
  const [rainbow, setRainbow] = useState(false);
  const [toast, setToast] = useState(null);
  const [crawl, setCrawl] = useState(null);
  const [say, setSay] = useState("Hi! Click me, I don't bite. I don't even have teeth yet.");
  const [stamps, setStamps] = useState(loadStamps);
  const [rocketFlight, setRocketFlight] = useState(null);
  const toastTimer = useRef(0);
  const crawling = useRef(false);

  useEffect(() => {
    document.body.classList.toggle('space', space);
    store.set('lumi-space', space ? '1' : '0');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', space ? '#0E0C24' : '#FFF5F2');
  }, [space]);
  useEffect(() => {
    document.body.classList.toggle('chaos', chaos);
    store.set('lumi-chaos', chaos ? '1' : '0');
  }, [chaos]);
  useEffect(() => { document.body.classList.toggle('rainbow', rainbow); }, [rainbow]);

  const setMuted = useCallback((m) => {
    Sound.setMuted(m);
    if (m) stopSpeaking();
    setMutedState(m);
  }, []);

  const setMusic = useCallback((on) => {
    if (on) { if (Sound.startMusic()) setMusicState(true); } else { Sound.stopMusic(); setMusicState(false); }
  }, []);

  const showToast = useCallback((text, ms = 3200) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const celebrate = useCallback((opts = {}) => {
    confetti({ particleCount: 130, spread: 90, origin: { y: 0.55 }, colors: CONFETTI_COLORS, shapes: ['star', 'circle'], disableForReducedMotion: true, ...opts });
  }, []);

  // Lumi says something: shown in the speech bubble and spoken out loud.
  const talk = useCallback((text, { voice = true } = {}) => {
    setSay(text);
    if (voice) speak(text);
  }, []);

  // Passport stamps, earned by doing things around the site.
  const addStamp = useCallback((id) => {
    setStamps((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      store.set('lumi-stamps', JSON.stringify([...next]));
      const info = STAMPS.find((s) => s.id === id);
      setTimeout(() => {
        Sound.stamp();
        if (next.size === STAMPS.length) {
          showToast('🛂 Passport complete! You are an honorary Cloudport engineer.', 4200);
          celebrate({ particleCount: 200, spread: 120 });
          speak('You filled my whole passport! You are an honorary Cloudport engineer!');
        } else {
          showToast(`🛂 Passport stamp: ${info?.label ?? id}! (${next.size} of ${STAMPS.length})`);
        }
      }, 250);
      return next;
    });
  }, [showToast, celebrate]);

  const launchRainbow = useCallback(() => {
    setRainbow(true);
    setTimeout(() => setRainbow(false), 6000);
    showToast('🌈 Secret unlocked: Rainbow Rocket!', 3600);
    celebrate();
    Sound.arpeggio([72, 76, 79, 84, 88]);
    Sound.whoosh();
    setRocketFlight(Date.now());
    addStamp('secret');
  }, [showToast, celebrate, addStamp]);

  // The pink crawl transition. `midway` runs while the overlay fully covers the page.
  const crawlTo = useCallback((label, midway) => {
    if (crawling.current) return;
    if (prefersReducedMotion()) { midway?.(); return; }
    crawling.current = true;
    setCrawl({ id: Date.now(), label, midway });
  }, []);
  const endCrawl = useCallback(() => { crawling.current = false; setCrawl(null); }, []);

  // Go to a page (and optional #section) through the crawl transition.
  const goTo = useCallback((to, label) => {
    const [path, hash] = to.split('#');
    crawlTo(label, () => {
      navigate(path || '/');
      setTimeout(() => {
        const el = hash && document.getElementById(hash);
        const html = document.documentElement;
        html.style.scrollBehavior = 'auto';
        if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
        html.style.scrollBehavior = '';
      }, 60);
    });
  }, [crawlTo, navigate]);

  const value = useMemo(() => ({
    muted, setMuted, music, setMusic, space, setSpace, chaos, setChaos, rainbow,
    toast, showToast, celebrate, crawl, crawlTo, endCrawl, goTo, say, talk,
    stamps, addStamp, rocketFlight, setRocketFlight, launchRainbow, visits: VISITS,
  }), [muted, setMuted, music, setMusic, space, chaos, rainbow, toast, showToast, celebrate, crawl, crawlTo, endCrawl, goTo, say, talk, stamps, addStamp, rocketFlight, launchRainbow]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
