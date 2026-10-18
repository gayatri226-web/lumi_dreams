// Lumi's speaking voice, using the browser's built-in speech synthesis (Web Speech API).
// Clarity first: we pick the most natural-sounding English voice the device has (the "Natural",
// "Online" and Google voices are neural and much clearer), and only lift the pitch a little so
// Lumi sounds young without getting squeaky or blurry. Speech waits for the voice list to load.
import { Sound } from './sound.js';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voice = null;
let ready = null;

// Higher score = clearer voice.
function score(v) {
  const n = v.name.toLowerCase();
  if (!/^en/i.test(v.lang)) return -1;
  let s = 0;
  if (/natural|neural|online/.test(n)) s += 50;
  if (/google/.test(n)) s += 30;
  if (/aria|jenny|ava|emma|libby|sonia|samantha|serena|karen|tessa|moira|zira|female|girl/.test(n)) s += 20;
  if (/en-(gb|us|au|in)/i.test(v.lang)) s += 5;
  if (v.localService === false) s += 5;
  if (/male|david|mark|george|daniel|fred|alex/.test(n) && !/female/.test(n)) s -= 25;
  return s;
}

function pickVoice() {
  if (!supported) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

function voicesReady() {
  if (!supported) return Promise.resolve(null);
  if (ready) return ready;
  ready = new Promise((resolve) => {
    const now = pickVoice();
    if (now) { voice = now; resolve(now); return; }
    const done = () => { voice = pickVoice(); resolve(voice); };
    window.speechSynthesis.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, 1200);
  });
  return ready;
}
if (supported) voicesReady();

export const canSpeak = supported;
export const voiceName = () => voice?.name ?? '';

export async function speak(text, { pitch = 1.35, rate = 0.98 } = {}) {
  if (!supported || Sound.muted || !text) return;
  await voicesReady();
  if (Sound.muted) return;
  try {
    const synth = window.speechSynthesis;
    const busy = synth.speaking || synth.pending;
    if (busy) synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[★♪♥✨🌙🛂📮⚡🌈]/gu, ''));
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    // Neural voices already sound bright; lift them less so they stay crisp.
    const neural = voice && /natural|neural|online|google/i.test(voice.name);
    u.pitch = neural ? Math.min(pitch, 1.25) : pitch;
    u.rate = rate;
    u.volume = Sound.volume;
    // Chrome can drop an utterance queued in the same tick as cancel(), so give it a beat.
    const go = () => { synth.speak(u); if (synth.paused) synth.resume(); };
    if (busy) setTimeout(go, 90); else go();
  } catch { /* speech is a bonus, never an error */ }
}

export function stopSpeaking() {
  if (!supported) return;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
}
