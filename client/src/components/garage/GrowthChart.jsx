import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Sound } from '../../lib/sound.js';
import { prefersReducedMotion } from '../../lib/util.js';
import { LEVELS } from '../../data/content.js';
import SplitTitle from '../fx/SplitTitle.jsx';
import Lumi from '../art/Lumi.jsx';

// The engineer level-up path, drawn as a nursery growth chart. As you scroll, Lumi grows taller
// next to a measuring tape and each level lights up (GSAP ScrollTrigger scrub). Levels 4 and 5 are dreams.
const MAX_CM = 120;

export default function GrowthChart() {
  const root = useRef(null);
  const lumi = useRef(null);
  const fill = useRef(null);
  const cm = useRef(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    const start = LEVELS[0].cm, end = LEVELS[LEVELS.length - 1].cm;
    const apply = (p) => {
      const h = start + (end - start) * p;
      if (lumi.current) lumi.current.style.transform = `scale(${(0.5 + (h / MAX_CM) * 0.62).toFixed(3)})`;
      if (fill.current) fill.current.style.height = `${(h / MAX_CM) * 100}%`;
      if (cm.current) cm.current.textContent = `${Math.round(h)} cm`;
    };
    apply(0);
    gsap.utils.toArray('.lvl-card', root.current).forEach((el, i) => {
      gsap.from(el, { x: 80, opacity: 0, duration: 0.6, ease: 'back.out(1.6)', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 40%', onToggle: (self) => { if (self.isActive) { setActive(i); Sound.chime(70 + LEVELS[i].n * 2); } } });
    });
    if (prefersReducedMotion()) { apply(0.5); return; }
    ScrollTrigger.create({ trigger: '.growth__levels', start: 'top 60%', end: 'bottom 60%', onUpdate: (self) => apply(self.progress) });
  }, { scope: root });

  return (
    <section className="section growth" id="levels" ref={root}>
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">Engineer level-up path</span><SplitTitle text="Watch me grow" accent="grow" /></div>
          <p>Every engineer starts small. Scroll and I'll grow up next to my nursery measuring tape. The last two levels are still dreams.</p>
        </div>
        <div className="growth__grid">
          <div className="growth__chart">
            <div className="tape" aria-hidden="true">
              <div className="tape__fill" ref={fill} />
              {Array.from({ length: 13 }, (_, i) => (
                <span key={i} className="tape__mark" style={{ bottom: `${(i * 10 / MAX_CM) * 100}%` }}>{i * 10}</span>
              ))}
              {LEVELS.map((l) => (
                <span key={l.n} className={`tape__level${l.future ? ' future' : ''}`} style={{ bottom: `${(l.cm / MAX_CM) * 100}%` }}>Lv {l.n}</span>
              ))}
            </div>
            <div className="growth__lumi-wrap">
              <div className="growth__lumi" ref={lumi}><Lumi title="Lumi, growing up" /></div>
            </div>
            <div className="growth__height"><span className="label">Height</span><strong ref={cm}>52 cm</strong></div>
          </div>
          <ol className="growth__levels">
            {LEVELS.map((l, i) => (
              <li key={l.n} className={`lvl-card${active === i ? ' is-on' : ''}${l.future ? ' future' : ''}`}>
                <span className="lvl-card__dot" style={{ background: l.color || 'transparent' }}>{l.n}</span>
                <div>
                  <span className="label">Level {l.n} · {l.cm} cm · {l.future ? 'a dream' : l.here ? 'right now' : 'done'}</span>
                  <h3>{l.title}</h3>
                  <p>{l.copy}</p>
                  <span className="lvl-card__tool">Unlocks: {l.tool}</span>
                </div>
                {l.here && <span className="here label">You are here</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
