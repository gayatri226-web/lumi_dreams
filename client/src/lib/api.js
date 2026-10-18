// Talks to the Express API. If the server can't be reached, the site keeps working
// with a local copy so nothing ever breaks in front of a visitor.
import { store } from './util.js';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      ...options,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

const SEED = [
  { _id: 'seed-1', name: 'Puff', wish: 'Please make a car with a nap button.', createdAt: '2026-10-17T14:35:00Z' },
  { _id: 'seed-2', name: 'The Moon', wish: 'Come visit soon. I have your spot ready.', createdAt: '2026-10-17T14:10:00Z' },
];
const localWishes = () => {
  try { return JSON.parse(store.get('lumi-gb', 'null')) || SEED; } catch { return SEED; }
};

export async function getWishes() {
  try {
    const data = await request('/wishes?limit=30');
    return { wishes: data.wishes, live: true };
  } catch {
    return { wishes: localWishes(), live: false };
  }
}

export async function addWish({ name, wish }) {
  try {
    const data = await request('/wishes', { method: 'POST', body: JSON.stringify({ name, wish }) });
    return { entry: data.wish, live: true };
  } catch (err) {
    // A validation or rate-limit answer from the server is a real error the visitor should see.
    if (err.status && err.status < 500) throw err;
    const entry = { _id: `local-${Date.now()}`, name, wish, createdAt: new Date().toISOString() };
    store.set('lumi-gb', JSON.stringify([entry, ...localWishes()].slice(0, 50)));
    return { entry, live: false };
  }
}

// Counts one visit per browser session, then reads the total.
export async function getVisits() {
  let counted = false;
  try { counted = sessionStorage.getItem('lumi-counted') === '1'; } catch { /* ignore */ }
  try {
    const data = counted ? await request('/visits') : await request('/visits', { method: 'POST' });
    try { sessionStorage.setItem('lumi-counted', '1'); } catch { /* ignore */ }
    return { count: data.count, live: true };
  } catch {
    const local = (parseInt(store.get('lumi-visits', '0'), 10) || 0) + 1204;
    return { count: local, live: false };
  }
}
