import { useApp } from '../context/AppContext.jsx';
import { Sound } from '../lib/sound.js';
import MuteButton from './MuteButton.jsx';

export const NAV = [
  { id: 'workshop', label: 'Workshop', title: 'The Workshop' },
  { id: 'levels', label: 'Level-up', title: 'Level-up path' },
  { id: 'story', label: 'Story', title: 'My space story' },
  { id: 'orbits', label: 'Dreams', title: 'Dream orbits' },
];

export default function Header() {
  const { space, setSpace, setSay, goTo } = useApp();

  const go = (e, id, title) => { e.preventDefault(); goTo(id, title); };
  const toggleSpace = () => {
    const on = !space;
    setSpace(on);
    setSay(on ? 'Goggles down! Space mode engaged.' : 'Goggles up. Hello, sunshine!');
    if (on) { Sound.chime(79); Sound.chime(84, 0.12); } else Sound.chime(72);
  };

  return (
    <header className="top">
      <div className="wrap">
        <a className="logo" href="#hello" onClick={(e) => go(e, 'hello', 'Hello again')}>anew<span>.dreams</span></a>
        <nav className="nav" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id, n.title)}>{n.label}</a>
          ))}
        </nav>
        <div className="controls">
          <button className="pill" type="button" aria-pressed={space} onClick={toggleSpace}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            <span className="lbl">{space ? 'Cloud mode' : 'Space mode'}</span>
          </button>
          <MuteButton />
        </div>
      </div>
    </header>
  );
}
