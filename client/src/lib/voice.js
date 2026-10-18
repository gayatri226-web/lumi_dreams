// Lumi's speaking voice, using the browser's built-in speech synthesis (Web Speech API).
// A high pitch and slightly quick rate make any system voice sound small and bubbly.
import { Sound } from './sound.js';

const PREFERRED = ['Google UK English Female', 'Samantha', 'Karen', 'Tessa', 'Moira', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Google US English', 'Victoria', 'Fiona', 'Veena'];
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voice = null;

function pickVoice() {
  if (!supported) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  for (const name of PREFERRED) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => /^en/i.test(v.lang)) || voices[0];
}

if (supported) {
  voice = pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => { voice = pickVoice(); });
}

export const canSpeak = supported;

export function speak(text, { pitch = 1.9, rate = 1.06 } = {}) {
  if (!supported || Sound.muted || !text) return;
  try {
    const synth = window.speechSynthesis;
    const busy = synth.speaking || synth.pending;
    if (busy) synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[★♪♥]/g, ''));
    voice = voice || pickVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.pitch = pitch;
    u.rate = rate;
    u.volume = 1;
    // Chrome can drop an utterance queued in the same tick as cancel(), so give it a beat.
    const go = () => { synth.speak(u); if (synth.paused) synth.resume(); };
    if (busy) setTimeout(go, 80); else go();
  } catch { /* speech is a bonus, never an error */ }
}

export function stopSpeaking() {
  if (!supported) return;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
}
