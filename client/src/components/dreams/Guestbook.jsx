import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { addWish, getWishes } from '../../lib/api.js';
import { Sound } from '../../lib/sound.js';
import { prefersReducedMotion } from '../../lib/util.js';
import SplitTitle from '../fx/SplitTitle.jsx';

// The Wish Post Office: a live guestbook (MongoDB through the Express API). Each wish is a
// postcard on the wall. If the server can't be reached it falls back to this browser and says so.
const fmt = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const TINTS = ['#FFEAF2', '#FFF6D6', '#E8F3FF', '#EAFBF2', '#F1EAFF'];

export default function Guestbook() {
  const { showToast, addStamp, talk } = useApp();
  const root = useRef(null);
  const [wishes, setWishes] = useState([]);
  const [live, setLive] = useState(true);
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getWishes().then((r) => { if (alive) { setWishes(r.wishes); setLive(r.live); } });
    return () => { alive = false; };
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from('.mailbox', { y: 80, rotate: -6, opacity: 0, duration: 0.8, ease: 'back.out(1.6)', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } });
  }, { scope: root });

  const submit = async (e) => {
    e.preventDefault();
    const n = name.trim(), w = wish.trim();
    if (!n || !w) { setError('Add your name and a wish first.'); return; }
    setSending(true); setError('');
    try {
      const { entry, live: isLive } = await addWish({ name: n, wish: w });
      setWishes((list) => [entry, ...list].slice(0, 50));
      setLive(isLive);
      setName(''); setWish('');
      Sound.chime(79); Sound.chime(86, 0.14);
      showToast(`📮 Wish posted, ${n}! Lumi will read it at bedtime.`);
      talk(`Thank you, ${n}! I'll read it at bedtime.`);
      addStamp('post');
    } catch (err) {
      setError(err.message || 'That wish got lost in space. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section" id="guestbook" ref={root}>
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">Guestbook</span><SplitTitle text="The Wish Post Office" accent="Wish" /></div>
          <p>Leave Lumi a launch wish. Every postcard goes up on the wall for everyone to see.</p>
        </div>
        <div className="post">
          <form className="panel gb mailbox" onSubmit={submit} autoComplete="off" noValidate>
            <span className={`gb__status${live ? '' : ' off'}`}><i aria-hidden="true" />{live ? 'Live: everyone can see these' : 'Server asleep: saved on this device for now'}</span>
            <label htmlFor="gbName">Your name
              <input id="gbName" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Space visitor" />
            </label>
            <label htmlFor="gbWish">Your wish for Lumi
              <textarea id="gbWish" value={wish} onChange={(e) => setWish(e.target.value)} maxLength={120} rows={3} placeholder="Fly safe, little engineer!" />
            </label>
            <div className="gb__foot">
              <span className="small">{120 - wish.length} characters left</span>
              <motion.button className="btn" type="submit" disabled={sending} whileTap={{ scale: 0.95 }}>{sending ? 'Posting…' : '📮 Post my wish'}</motion.button>
            </div>
            {error && <p className="gb__error" role="alert">{error}</p>}
          </form>
          <ul className="postcards" aria-live="polite">
            <AnimatePresence initial={false}>
              {wishes.map((e, i) => (
                <motion.li key={e._id} layout className="postcard" style={{ background: TINTS[i % TINTS.length], rotate: ((i * 37) % 7) - 3 }}
                  initial={{ opacity: 0, y: -60, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                  <span className="postcard__stamp" aria-hidden="true">★</span>
                  <p>{e.wish}</p>
                  <span className="postcard__from">from <strong>{e.name}</strong> · <time dateTime={e.createdAt}>{fmt(e.createdAt)}</time></span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </section>
  );
}
