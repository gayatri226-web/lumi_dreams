import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { getName, reply, SUGGESTIONS } from '../../lib/chat.js';
import SplitTitle from '../fx/SplitTitle.jsx';

// Tier 3 corner: a 3D Lumi (Three.js, loaded only when needed) that you can spin, plus a chat
// where Lumi answers in character, out loud, and remembers your name between visits.
const Lumi3D = lazy(() => import('../three/Lumi3D.jsx'));

export default function TalkToLumi() {
  const { setMusic } = useApp();
  const model = useRef(null);
  const list = useRef(null);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState(() => {
    const name = getName();
    return [{ from: 'lumi', text: name ? `Welcome back, ${name}! I remembered you. Want to chat?` : "Hi! I'm Lumi. Spin me around, or ask me anything. What's your name?" }];
  });

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);

  const respond = (input) => {
    const r = reply(input);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'lumi', text: r.text }]);
      speak(r.text);
      model.current?.talk(Math.min(6000, 600 + r.text.length * 55));
      if (r.action === 'happy') { model.current?.bounce(); Sound.giggle(); }
      if (r.action === 'sing') setMusic(true);
    }, 450);
  };

  const send = (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: 'you', text: t }]);
    setText('');
    Sound.pop();
    respond(t);
  };

  const chip = (s) => {
    if (s.endsWith('…')) { setText('My name is '); document.getElementById('chatInput')?.focus(); return; }
    setMsgs((m) => [...m, { from: 'you', text: s }]);
    Sound.pop();
    respond(s);
  };

  const poke = () => {
    Sound.giggle();
    const lines = ['Wheee! Spin me again!', 'Hehe, that tickles!', "I'm dizzy… in a good way!"];
    const l = lines[Math.floor(Math.random() * lines.length)];
    setMsgs((m) => [...m, { from: 'lumi', text: l }]);
    speak(l);
    model.current?.talk(1600);
  };

  // Only download the 3D engine when this section is about to scroll into view (keeps first load fast).
  const stageRef = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="section talk" id="talk">
      <div className="wrap">
        <div className="section__head">
          <div><span className="label eyebrow">Say hi to me</span><SplitTitle text="Spin me, then say hi" accent="hi" /></div>
          <p>That's me in 3D! Drag to spin me around, tap to make me jump, and chat with me below. I'll remember your name.</p>
        </div>
        <div className="talk__grid">
          <div className="talk__stage" ref={stageRef}>
            {near ? (
              <Suspense fallback={<div className="talk__loading">Building 3D Lumi…</div>}>
                <Lumi3D ref={model} onPoke={poke} className="talk__canvas" />
              </Suspense>
            ) : <div className="talk__loading">3D Lumi is waking up…</div>}
            <span className="talk__hint">↔ drag to spin · tap to jump</span>
          </div>
          <div className="chat panel">
            <ul className="chat__list" ref={list} aria-live="polite">
              <AnimatePresence initial={false}>
                {msgs.map((m, i) => (
                  <motion.li key={i} className={`chat__msg chat__msg--${m.from}`} initial={{ opacity: 0, y: 14, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                    {m.text}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="chat__chips">
              {SUGGESTIONS.map((s) => <button key={s} type="button" className="chip-btn" onClick={() => chip(s)}>{s}</button>)}
            </div>
            <form className="chat__form" onSubmit={send}>
              <label htmlFor="chatInput" className="sr-only">Message Lumi</label>
              <input id="chatInput" value={text} onChange={(e) => setText(e.target.value)} maxLength={140} placeholder="Ask Lumi anything…" autoComplete="off" />
              <button className="btn" type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
