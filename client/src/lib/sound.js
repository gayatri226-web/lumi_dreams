// Every sound on the site is synthesized live with the Web Audio API (no audio files).
// A single master gain node makes the mute switch instant and total.
import { store } from './util.js';

let ctx = null;
let master = null;
let muted = store.get('anew-muted') === '1';
const live = new Set();

// Browsers only allow audio after the visitor interacts, so nothing is created before that.
let gestured = false;
if (typeof window !== 'undefined') {
  const mark = () => { gestured = true; };
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, mark, { once: true, capture: true, passive: true }));
}

function audio() {
  if (!gestured) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function track(node) {
  live.add(node);
  node.onended = () => live.delete(node);
}

function note(freq, { when = 0, dur = 0.25, type = 'sine', vol = 0.15, to = null } = {}) {
  if (muted) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime + when;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
  track(osc);
}

function noise({ when = 0, dur = 0.5, from = 400, to = 4000, vol = 0.25 } = {}) {
  if (muted) return;
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  const t = a.currentTime + when;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(t);
  track(src);
}

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

export const Sound = {
  midi,
  note,
  unlock: () => audio(),
  click: () => note(950 + Math.random() * 200, { dur: 0.06, type: 'triangle', vol: 0.07 }),
  chime(m, when = 0) {
    note(midi(m), { when, dur: 0.9, vol: 0.14 });
    note(midi(m) * 2, { when, dur: 0.5, vol: 0.04, type: 'triangle' });
  },
  engine() {
    note(70, { dur: 1.4, type: 'sawtooth', vol: 0.06, to: 220 });
    noise({ dur: 1.2, from: 200, to: 3000, vol: 0.16 });
  },
  blastoff() {
    note(55, { dur: 2.8, type: 'sawtooth', vol: 0.08, to: 260 });
    noise({ dur: 2.8, from: 150, to: 4500, vol: 0.25 });
  },
  beep: () => note(880, { dur: 0.18, type: 'square', vol: 0.05 }),
  pat: (i) => note(i % 2 ? 330 : 392, { dur: 0.08, type: 'triangle', vol: 0.06 }),
  giggle() {
    [84, 86, 84, 88].forEach((m, i) => note(midi(m), { when: i * 0.07, dur: 0.09, type: 'triangle', vol: 0.07 }));
  },
  whoosh: () => noise({ dur: 0.45, from: 600, to: 5000, vol: 0.14 }),
  honk() {
    note(392, { dur: 0.16, type: 'square', vol: 0.06 });
    note(494, { dur: 0.16, type: 'square', vol: 0.05 });
  },
  thud: () => note(140, { dur: 0.35, type: 'sine', vol: 0.2, to: 50 }),
  arpeggio(notes, gap = 0.1) {
    notes.forEach((m, i) => Sound.chime(m, i * gap));
  },
  setMuted(m) {
    muted = m;
    store.set('anew-muted', m ? '1' : '0');
    if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.02);
    if (m) {
      live.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } });
      live.clear();
    }
  },
  get muted() { return muted; },
};
