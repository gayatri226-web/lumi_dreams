// Every sound on the site is synthesized live with the Web Audio API (no audio files).
// One master gain node makes the mute switch instant and total.
import { store } from './util.js';

let ctx = null;
let master = null;
let muted = store.get('lumi-muted') === '1';
let gestured = false;
const live = new Set();

// Browsers only allow audio after the visitor interacts. We remember the first gesture and
// resume the context on every later one (Safari and Chrome can suspend it again).
if (typeof window !== 'undefined') {
  const onGesture = () => {
    gestured = true;
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  };
  ['pointerdown', 'keydown', 'touchend'].forEach((ev) => window.addEventListener(ev, onGesture, { capture: true, passive: true }));
}

function audio() {
  if (!gestured) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  return ctx;
}

function track(node) {
  live.add(node);
  node.onended = () => live.delete(node);
}

// Plays one tone. `at` is an absolute AudioContext time; `when` is seconds from now.
function tone(freq, { when = 0, at = null, dur = 0.25, type = 'sine', vol = 0.15, to = null } = {}) {
  if (muted) return;
  const a = audio();
  if (!a) return;
  const t = at ?? a.currentTime + when;
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

// A gentle original music-box lullaby, looped with a small lookahead scheduler.
const BEAT = 0.42;
const MELODY = [76, 79, 81, 79, 76, 0, 74, 72, 74, 76, 79, 0, 76, 74, 72, 0, 72, 74, 76, 79, 81, 79, 76, 0, 74, 76, 74, 72, 74, 0, 72, 0];
const BASS = [48, 53, 55, 48, 45, 53, 55, 48];
let musicTimer = 0;
let nextAt = 0;
let step = 0;
function schedule() {
  const a = audio();
  if (!a) return;
  while (nextAt < a.currentTime + 0.6) {
    const m = MELODY[step % MELODY.length];
    if (m) {
      tone(midi(m), { at: nextAt, dur: 1.1, vol: 0.07 });
      tone(midi(m) * 2, { at: nextAt, dur: 0.5, vol: 0.018, type: 'triangle' });
    }
    if (step % 4 === 0) tone(midi(BASS[(step / 4) % BASS.length]), { at: nextAt, dur: 1.7, vol: 0.05, type: 'triangle' });
    nextAt += BEAT;
    step++;
  }
}

export const Sound = {
  midi,
  note: (f, o) => tone(f, o),
  unlock: () => { gestured = true; return audio(); },
  click: () => tone(950 + Math.random() * 200, { dur: 0.06, type: 'triangle', vol: 0.08 }),
  pop: () => tone(520, { dur: 0.12, type: 'sine', vol: 0.12, to: 980 }),
  chime(m, when = 0) {
    tone(midi(m), { when, dur: 0.9, vol: 0.15 });
    tone(midi(m) * 2, { when, dur: 0.5, vol: 0.045, type: 'triangle' });
  },
  arpeggio(notes, gap = 0.1) { notes.forEach((m, i) => Sound.chime(m, i * gap)); },
  engine() {
    tone(70, { dur: 1.4, type: 'sawtooth', vol: 0.07, to: 220 });
    noise({ dur: 1.2, from: 200, to: 3000, vol: 0.18 });
  },
  blastoff() {
    tone(55, { dur: 2.8, type: 'sawtooth', vol: 0.09, to: 260 });
    noise({ dur: 2.8, from: 150, to: 4500, vol: 0.28 });
  },
  beep: () => tone(880, { dur: 0.18, type: 'square', vol: 0.05 }),
  pat: (i) => tone(i % 2 ? 330 : 392, { dur: 0.08, type: 'triangle', vol: 0.07 }),
  giggle() {
    [84, 86, 84, 88].forEach((m, i) => tone(midi(m), { when: i * 0.07, dur: 0.09, type: 'triangle', vol: 0.08 }));
  },
  whoosh: () => noise({ dur: 0.45, from: 600, to: 5000, vol: 0.15 }),
  honk() {
    tone(392, { dur: 0.16, type: 'square', vol: 0.06 });
    tone(494, { dur: 0.16, type: 'square', vol: 0.05 });
  },
  stamp: () => { noise({ dur: 0.12, from: 300, to: 150, vol: 0.35 }); tone(110, { dur: 0.15, vol: 0.2, to: 60 }); },
  thud: () => tone(140, { dur: 0.35, type: 'sine', vol: 0.2, to: 50 }),
  startMusic() {
    const a = audio();
    if (!a) return false;
    clearInterval(musicTimer);
    nextAt = a.currentTime + 0.1;
    step = 0;
    schedule();
    musicTimer = setInterval(schedule, 150);
    return true;
  },
  stopMusic() { clearInterval(musicTimer); musicTimer = 0; },
  setMuted(m) {
    muted = m;
    store.set('lumi-muted', m ? '1' : '0');
    if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.02);
    if (m) {
      live.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } });
      live.clear();
    }
  },
  get muted() { return muted; },
};
