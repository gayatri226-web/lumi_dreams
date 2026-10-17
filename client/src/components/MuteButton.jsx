import { useApp } from '../context/AppContext.jsx';
import { Sound } from '../lib/sound.js';

export default function MuteButton() {
  const { muted, setMuted } = useApp();
  const toggle = () => {
    const next = !muted;
    Sound.setMuted(next);
    setMuted(next);
    if (!next) Sound.click();
  };
  return (
    <button className="round" type="button" aria-pressed={muted} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'} onClick={toggle} data-nosfx>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        {!muted && <path d="M15.5 8.5a5 5 0 0 1 0 7" />}
        {muted && <path d="M22 9l-6 6M16 9l6 6" />}
      </svg>
    </button>
  );
}
