// Lumi's speaking voice, using the browser's built-in speech synthesis (Web Speech API).
// Baby first: if the device has a real child voice (Edge's "Ana", Amazon-style "Ivy") we use it as-is.
// Otherwise we take the clearest young-sounding English voice and lift the pitch and pace so Lumi
// sounds like a tiny, bubbly baby. Speech waits for the voice list to load.
import { Sound } from './sound.js';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voice = null;
let ready = null;

// Higher score = clearer voice.
function score(v) {
  const n = v.name.toLowerCase();
  if (!/^en/i.test(v.lang)) return -1;
  let s = 0;
  if (/\bana\b|\bivy\b|child|kid|junior/.test(n)) s += 120; // real child voices
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

const isChild = (v) => v && /\bana\b|\bivy\b|child|kid|junior/i.test(v.name);

export async function speak(text, { pitch = 1.75, rate = 1.04 } = {}) {
  if (!supported || Sound.muted || !text) return;
  await voicesReady();
  if (Sound.muted) return;
  try {
    const synth = window.speechSynthesis;
    const busy = synth.speaking || synth.pending;
    if (busy) synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[★♪♥✨🌙🛂📮⚡🌈]/gu, ''));
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    // A real child voice needs only a touch of lift; any other voice gets the full baby pitch,
    // a little less for neural voices so they stay clear rather than chipmunky.
    const neural = voice && /natural|neural|online/i.test(voice.name);
    u.pitch = isChild(voice) ? Math.min(pitch, 1.2) : neural ? Math.min(pitch, 1.55) : Math.min(2, pitch);
    u.rate = isChild(voice) ? rate * 0.96 : rate;
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
