import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/util.js';

// A realistic night sky on canvas: deep gradient, a pink-violet Milky Way band,
// hundreds of tinted twinkling stars (bright ones get a glow and spikes) and shooting stars.
// Static layers are painted once offscreen; only stars and meteors animate, and only while visible.
const TINTS = ['255,255,255', '255,255,255', '255,255,255', '207,226,255', '255,236,210', '255,205,225'];
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export default function StarSky({ density = 1, className = 'starsky', id }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = prefersReducedMotion();
    let w = 0, h = 0, stars = [], bg = null, meteors = [], visible = true, t = 0, raf = 0;

    function build() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bg = document.createElement('canvas');
      bg.width = w * dpr; bg.height = h * dpr;
      const b = bg.getContext('2d');
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      const base = b.createRadialGradient(w * 0.35, h * 0.25, 0, w * 0.5, h * 0.5, Math.max(w, h));
      base.addColorStop(0, '#221C4C'); base.addColorStop(0.55, '#120F2E'); base.addColorStop(1, '#07061A');
      b.fillStyle = base; b.fillRect(0, 0, w, h);
      b.save(); b.translate(w / 2, h / 2); b.rotate(-0.5);
      const L = Math.hypot(w, h);
      [['255,143,184', 0.08], ['170,150,255', 0.07], ['255,235,210', 0.05]].forEach(([col, a], k) => {
        for (let i = 0; i < 9; i++) {
          const x = (Math.random() - 0.5) * L, y = gauss() * h * 0.06 + (k - 1) * 18, r = 60 + Math.random() * 140;
          const g = b.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
          b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2);
        }
      });
      const dust = Math.min(9000, Math.floor((w * h) / 220));
      for (let i = 0; i < dust; i++) {
        b.fillStyle = `rgba(255,255,255,${Math.random() * 0.22})`;
        b.fillRect((Math.random() - 0.5) * L, gauss() * h * 0.09, Math.random() * 1.2, Math.random() * 1.2);
      }
      b.restore();
      const faint = Math.min(4000, (w * h) / 900);
      for (let i = 0; i < faint; i++) {
        b.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.25})`;
        b.fillRect(Math.random() * w, Math.random() * h, 0.8, 0.8);
      }
      const n = Math.min(900, Math.floor(((w * h) / 1700) * density));
      stars = Array.from({ length: n }, () => {
        const big = Math.random() < 0.06;
        return {
          x: Math.random() * w, y: Math.random() * h,
          r: big ? 1.4 + Math.random() * 1.3 : 0.4 + Math.random() * 0.9,
          a: 0.45 + Math.random() * 0.55, s: 0.5 + Math.random() * 2.2, p: Math.random() * 6.3,
          c: TINTS[(Math.random() * TINTS.length) | 0], big,
        };
      });
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible || !bg || document.hidden) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(bg, 0, 0, w, h);
      for (const s of stars) {
        const a = s.a * (0.65 + 0.35 * Math.sin(t * s.s + s.p));
        ctx.fillStyle = `rgba(${s.c},${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        if (s.big) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
          g.addColorStop(0, `rgba(${s.c},${a * 0.35})`); g.addColorStop(1, `rgba(${s.c},0)`);
          ctx.fillStyle = g; ctx.fillRect(s.x - s.r * 6, s.y - s.r * 6, s.r * 12, s.r * 12);
          ctx.strokeStyle = `rgba(${s.c},${a * 0.5})`; ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 5, s.y); ctx.lineTo(s.x + s.r * 5, s.y);
          ctx.moveTo(s.x, s.y - s.r * 5); ctx.lineTo(s.x, s.y + s.r * 5);
          ctx.stroke();
        }
      }
      if (!reduce && Math.random() < 0.006) meteors.push({ x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.4, v: 9 + Math.random() * 6, life: 1 });
      meteors = meteors.filter((m) => m.life > 0);
      for (const m of meteors) {
        m.x -= m.v; m.y += m.v * 0.45; m.life -= 0.02;
        const g = ctx.createLinearGradient(m.x, m.y, m.x + 90, m.y - 40);
        g.addColorStop(0, `rgba(255,255,255,${m.life})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + 90, m.y - 40); ctx.stroke();
      }
    }

    build();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [density]);

  return <canvas ref={ref} id={id} className={className} aria-hidden="true" />;
}
