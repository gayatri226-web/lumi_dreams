import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { prefersReducedMotion } from '../../lib/util.js';
import { SHEET, STAMPS } from '../../data/content.js';
import SplitTitle from '../fx/SplitTitle.jsx';
import Lumi from '../art/Lumi.jsx';

// Lumi's character sheet, presented as a cosmic baby passport. The right-hand page collects
// stamps that visitors earn around the site. The passport tilts open as it scrolls into view.
function StampIcon({ icon }) {
  const p = { width: 34, height: 34, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (icon === 'wrench') return <svg {...p}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" /></svg>;
  if (icon === 'rocket') return <svg {...p}><path d="M12 2c3 2 5 6 4 11H8C7 8 9 4 12 2z" /><path d="M8 13l-3 4h4M16 13l3 4h-4M10 19l2 3 2-3" /></svg>;
  if (icon === 'star') return <svg {...p}><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" /></svg>;
  if (icon === 'heart') return <svg {...p}><path d="M12 21s-8-5.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.6-8 11-8 11z" /></svg>;
  return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
}

export default function Passport() {
  const { stamps } = useApp();
  const root = useRef(null);
  const done = STAMPS.filter((s) => stamps.has(s.id)).length;

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo('.passport', { rotateX: 48, y: 120, opacity: 0.4 }, {
      rotateX: 0, y: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top 95%', end: 'top 30%', scrub: 1 },
    });
  }, { scope: root });

  return (
    <section className="section" id="passport" ref={root}>
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">What I am</span><SplitTitle text="My cosmic passport" accent="passport" /></div>
          <p>Everything you need to know about me. Earn all five stamps around Cloudport to fill it up.</p>
        </div>
        <div className="passport-3d">
          <div className="passport">
            <div className="passport__page passport__id">
              <div className="passport__top label">Cosmic baby passport · Cloudport · No. LM-0001</div>
              <div className="passport__body">
                <div className="passport__photo">
                  <Lumi crop="bust" title="Passport photo of Lumi" />
                  <span className="label">Photo taken mid-giggle</span>
                </div>
                <dl className="passport__fields" aria-label="Character sheet">
                  {SHEET.map(([k, v]) => (
                    <div key={k}><dt className="label">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </div>
              <div className="passport__mrz" aria-hidden="true">P&lt;CLD&lt;MOONBOLT&lt;&lt;LUMI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;★&lt;&lt;&lt;&lt;&lt;&lt;0001</div>
            </div>
            <div className="passport__page passport__stamps">
              <div className="passport__top label">Visas &amp; stamps · {done} of {STAMPS.length}</div>
              <div className="stamps">
                {STAMPS.map((s, i) => {
                  const got = stamps.has(s.id);
                  return (
                    <div key={s.id} className={`stamp-slot${got ? ' got' : ''}`}>
                      {got ? (
                        <motion.div className="stamp" style={{ color: s.color, borderColor: s.color, rotate: (i % 2 ? 8 : -10) }}
                          initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                          <StampIcon icon={s.icon} />
                          <span>{s.id === 'secret' ? 'Secret finder' : s.label}</span>
                        </motion.div>
                      ) : (
                        <div className="stamp-empty">
                          <StampIcon icon={s.icon} />
                          <span>{s.task}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="stamp-bar" aria-hidden="true"><span style={{ width: `${(done / STAMPS.length) * 100}%` }} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
