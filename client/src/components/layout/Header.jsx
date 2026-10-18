import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { PAGES } from '../../data/content.js';
import Cloud from '../art/Cloud.jsx';
import ScrollCar from './ScrollCar.jsx';

// Top bar: logo on the left, cloud-shaped page buttons on the right, then music / space / sound.
// On phones the clouds tuck into a cloud "Menu" button.
function Icon({ name }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'moon') return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
  if (name === 'sun') return <svg {...p}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (name === 'music') return <svg {...p}><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>;
  if (name === 'on') return <svg {...p}><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></svg>;
  return <svg {...p}><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M22 9l-6 6M16 9l6 6" /></svg>;
}

export function SoundButton({ className = 'round' }) {
  const { muted, setMuted } = useApp();
  const [vol, setVol] = useState(Sound.volume);
  const toggle = () => { const next = !muted; setMuted(next); if (!next) Sound.pop(); };
  // Press M anywhere (outside a text box) to mute or unmute instantly.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() !== 'm' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest('input, textarea, [contenteditable="true"]')) return;
      setMuted(!Sound.muted);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMuted]);
  const change = (e) => {
    const v = Number(e.target.value) / 100;
    setVol(v); Sound.setVolume(v);
    if (v > 0 && muted) setMuted(false);
    if (v === 0 && !muted) setMuted(true);
  };
  return (
    <div className="vol">
      <button className={className} type="button" aria-pressed={!muted} aria-label={muted ? 'Turn sound on (M)' : 'Turn sound off (M)'} title={muted ? 'Sound off · press M' : 'Sound on · press M'} onClick={toggle} data-nosfx>
        <Icon name={muted ? 'off' : 'on'} />
      </button>
      <label className="vol__pop">
        <span className="sr-only">Volume</span>
        <input type="range" min="0" max="100" step="5" value={muted ? 0 : Math.round(vol * 100)} onChange={change} onPointerUp={() => Sound.pop()} />
      </label>
    </div>
  );
}

export default function Header() {
  const { space, setSpace, talk, goTo, music, setMusic } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const go = (e, p) => {
    e.preventDefault();
    setOpen(false);
    if (p.path === pathname) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    goTo(p.path, p.title);
  };
  const toggleSpace = () => {
    const on = !space;
    setSpace(on);
    talk(on ? 'Helmet on! Space mode engaged.' : 'Helmet off. Hello, sunshine!');
    if (on) { Sound.chime(79); Sound.chime(84, 0.12); } else Sound.chime(72);
  };

  const cloudLinks = (cls) => PAGES.map((p, i) => (
    <a key={p.path} href={p.path} className={`${cls}${pathname === p.path ? ' active' : ''}`} aria-current={pathname === p.path ? 'page' : undefined}
      onClick={(e) => go(e, p)} style={{ animationDelay: `${-i * 0.9}s` }}>
      <Cloud className="cloud-shape" />
      <span>{p.label}</span>
    </a>
  ));

  return (
    <header className="top">
      <div className="wrap top__in">
        <a className="logo" href="/" onClick={(e) => go(e, PAGES[0])}>lumi<span>.dreams</span></a>
        <nav className="clouds" aria-label="Pages">{cloudLinks('cloud-btn')}</nav>
        <div className="controls">
          <button className="round" type="button" aria-pressed={music} aria-label={music ? 'Stop the lullaby music' : 'Play the lullaby music'} title="Lullaby music" onClick={() => setMusic(!music)}>
            <Icon name="music" />
          </button>
          <button className="round" type="button" aria-pressed={space} aria-label={space ? 'Switch to cloud mode' : 'Switch to space mode'} title={space ? 'Cloud mode' : 'Space mode'} onClick={toggleSpace}>
            <Icon name={space ? 'sun' : 'moon'} />
          </button>
          <SoundButton />
          <button className="menu-btn cloud-btn" type="button" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen((o) => !o)}>
            <Cloud className="cloud-shape" />
            <span>{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav id="mnav" className="mnav" aria-label="Pages"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
            {cloudLinks('cloud-btn mnav__item')}
          </motion.nav>
        )}
      </AnimatePresence>
      <ScrollCar />
    </header>
  );
}
