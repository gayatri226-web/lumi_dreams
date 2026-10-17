// Small shared helpers.
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// localStorage can throw (private mode, blocked storage), so every access is wrapped.
export const store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
};

// Jump straight to an element (used mid-transition, while the pink overlay hides the page).
export function jumpTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const html = document.documentElement;
  html.style.scrollBehavior = 'auto';
  el.scrollIntoView();
  html.style.scrollBehavior = '';
}

// Points on a (possibly rotated) ellipse inside a 400x400 box, scaled to `box` px.
export function pointOnEllipse({ rx, ry, rot = 0 }, angle, box) {
  const k = box / 400;
  const cr = Math.cos((rot * Math.PI) / 180);
  const sr = Math.sin((rot * Math.PI) / 180);
  const x = Math.cos(angle) * rx;
  const y = Math.sin(angle) * ry;
  return { x: (200 + x * cr - y * sr) * k, y: (200 + x * sr + y * cr) * k, depth: Math.sin(angle) };
}
