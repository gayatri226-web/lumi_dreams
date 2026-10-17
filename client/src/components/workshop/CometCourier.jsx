import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';

gsap.registerPlugin(ScrollTrigger);

// Project 03: the lullaby route draws itself as you scroll (GSAP ScrollTrigger),
// or plays on its own from the button. Each lit window is a creature asleep.
const ROUTE = 'M30 300 C 110 120 170 320 240 190 C 300 80 360 240 450 70';
const STOP_AT = [0.08, 0.3, 0.5, 0.72, 0.95];

export default function CometCourier({ cardRef }) {
  const { showToast } = useApp();
  const path = useRef(null);
  const comet = useRef(null);
  const windows = useRef([]);
  const [stops, setStops] = useState([]);
  const [lit, setLit] = useState(0);
  const auto = useRef(false);
  const setRoute = useRef(() => {});

  useLayoutEffect(() => {
    const p = path.current;
    const len = p.getTotalLength();
    setStops(STOP_AT.map((t) => { const pt = p.getPointAtLength(len * t); return { t, x: pt.x, y: pt.y }; }));
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    let lastLit = 0;
    setRoute.current = (k) => {
      p.style.strokeDashoffset = len * (1 - k);
      const pt = p.getPointAtLength(len * k);
      comet.current.setAttribute('cx', pt.x);
      comet.current.setAttribute('cy', pt.y);
      const count = STOP_AT.filter((t) => k >= t).length;
      windows.current.forEach((w, i) => w?.setAttribute('fill', k >= STOP_AT[i] ? '#FFE38A' : '#0E0C24'));
      if (count > lastLit) Sound.chime(76 + count * 2);
      if (count !== lastLit) { lastLit = count; setLit(count); }
    };
    const st = ScrollTrigger.create({
      trigger: cardRef.current,
      start: 'top 90%',
      end: 'bottom 35%',
      onUpdate: (self) => { if (!auto.current) setRoute.current(self.progress); },
    });
    return () => st.kill();
  }, [cardRef]);

  const play = () => {
    if (auto.current) return;
    auto.current = true;
    const proxy = { k: 0 };
    gsap.to(proxy, {
      k: 1, duration: 3, ease: 'power1.inOut',
      onUpdate: () => setRoute.current(proxy.k),
      onComplete: () => { showToast('🌙 Five lullabies delivered. Everyone is asleep.'); setTimeout(() => { auto.current = false; }, 1500); },
    });
  };

  return (
    <>
      <div className="screen" style={{ background: '#231E4A' }}>
        <svg viewBox="0 0 480 360" role="img" aria-label="A comet flying a lullaby route across five rooftops">
          {stops.map((s, i) => (
            <g key={i}>
              <path d={`M${s.x - 22} ${s.y + 54} L${s.x - 22} ${s.y + 28} L${s.x} ${s.y + 12} L${s.x + 22} ${s.y + 28} L${s.x + 22} ${s.y + 54} Z`} fill="#4B4690" stroke="#FFF5F2" strokeWidth="3" strokeLinejoin="round" />
              <rect ref={(el) => { windows.current[i] = el; }} x={s.x - 7} y={s.y + 32} width="14" height="12" rx="3" fill="#0E0C24" />
            </g>
          ))}
          <path ref={path} d={ROUTE} fill="none" stroke="#FF8FB8" strokeWidth="5" strokeLinecap="round" />
          <circle ref={comet} cx="30" cy="300" r="12" fill="#FFE38A" stroke="#FFF5F2" strokeWidth="4" />
        </svg>
      </div>
      <h3>Comet Courier Routes</h3>
      <p>My night route for delivering lullabies. It draws itself as you scroll. Each lit window is a creature asleep.</p>
      <div className="row">
        <button className="btn" type="button" onClick={play}>Fly the route</button>
        <span className="small" aria-live="polite">{lit} of 5 delivered</span>
      </div>
    </>
  );
}
