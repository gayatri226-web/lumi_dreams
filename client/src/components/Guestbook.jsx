import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { addWish, getVisits, getWishes } from '../lib/api.js';
import { Sound } from '../lib/sound.js';

// Live guestbook (MongoDB through the Express API) plus the hit counter.
// If the server is unreachable both fall back to this browser, and the status line says so.
const fmt = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

function Odometer({ value }) {
  const digits = String(value ?? 0).padStart(6, '0').split('');
  return (
    <span className="odo__digits" aria-label={`${value ?? 0} cars launched`}>
      {digits.map((d, i) => (
        <motion.span key={`${i}-${d}`} aria-hidden="true" initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}>
          {d}
        </motion.span>
      ))}
    </span>
  );
}

export default function Guestbook() {
  const { showToast } = useApp();
  const [wishes, setWishes] = useState([]);
  const [live, setLive] = useState(true);
  const [visits, setVisits] = useState(null);
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getWishes().then((r) => { if (alive) { setWishes(r.wishes); setLive(r.live); } });
    getVisits().then((r) => { if (alive) setVisits(r.count); });
    return () => { alive = false; };
  }, []);

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
      showToast(`📡 Wish received, ${n}! Anew will read it at bedtime.`);
    } catch (err) {
      setError(err.message || 'That wish got lost in space. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section" id="guestbook" style={{ paddingTop: 0 }}>
      <div className="wrap gbwrap">
        <form className="panel gb reveal" onSubmit={submit} autoComplete="off" noValidate>
          <span className="label eyebrow">Guestbook</span>
          <h2 style={{ fontSize: 40 }}>Send Anew a launch wish</h2>
          <span className={`gb__status${live ? '' : ' off'}`}><i aria-hidden="true" />{live ? 'Live: everyone can see these' : 'Server asleep: saved on this device for now'}</span>
          <div className="gb__row">
            <label htmlFor="gbName">Your name
              <input id="gbName" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Space visitor" />
            </label>
            <label htmlFor="gbWish">Your wish
              <input id="gbWish" value={wish} onChange={(e) => setWish(e.target.value)} maxLength={120} placeholder="Fly safe, little engineer!" />
            </label>
            <motion.button className="btn" type="submit" disabled={sending} whileTap={{ scale: 0.95 }}>{sending ? 'Beaming…' : 'Beam it up'}</motion.button>
          </div>
          {error && <p className="gb__error" role="alert">{error}</p>}
          <ul aria-live="polite">
            <AnimatePresence initial={false}>
              {wishes.map((e) => (
                <motion.li key={e._id} layout initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                  <strong>{e.name}</strong>
                  <span>{e.wish}</span>
                  <time dateTime={e.createdAt}> · {fmt(e.createdAt)}</time>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </form>
        <div className="panel odo reveal">
          <span className="label eyebrow">Hit counter</span>
          <h2 style={{ fontSize: 34 }}>Cars launched</h2>
          <Odometer value={visits} />
          <span className="small">One for every visitor who dropped by.</span>
        </div>
      </div>
    </section>
  );
}
