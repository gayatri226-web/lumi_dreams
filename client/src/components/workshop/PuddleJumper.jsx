import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Sound } from '../../lib/sound.js';
import { clamp, store } from '../../lib/util.js';

// Project 01: steer the flying stroller through the clouds. Canvas game, 480 x 360 logical px.
const W = 480, H = 360, CAR_X = 80;

export default function PuddleJumper() {
  const canvas = useRef(null);
  const game = useRef({ on: false, y: 180, ty: 180, clouds: [], t: 0, dist: 0, spawn: 0 });
  const [best, setBest] = useState(() => parseInt(store.get('anew-best', '0'), 10) || 0);
  const [msg, setMsg] = useState(null);
  const [started, setStarted] = useState(false);
  const shake = useAnimationControls();
  const bestRef = useRef(best);

  useEffect(() => {
    const g = canvas.current.getContext('2d');
    const isSpace = () => document.body.classList.contains('space');
    const s = game.current;
    let raf = 0;

    const drawCar = (x, y) => {
      g.save(); g.translate(x, y);
      g.fillStyle = '#FFE38A'; g.beginPath(); g.ellipse(-36, 6, 10 + Math.random() * 4, 6, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#4A2C3A'; g.lineWidth = 4;
      g.fillStyle = 'rgba(207,230,255,.9)'; g.beginPath(); g.arc(4, -10, 15, Math.PI, 0); g.fill(); g.stroke();
      g.fillStyle = '#FFF6E8'; g.beginPath(); g.arc(4, -13, 8, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#4A2C3A'; g.beginPath(); g.arc(2, -13, 1.6, 0, 7); g.arc(8, -13, 1.6, 0, 7); g.fill();
      g.fillStyle = '#FF8FB8'; g.beginPath();
      if (g.roundRect) g.roundRect(-30, -10, 64, 24, 12); else g.rect(-30, -10, 64, 24);
      g.fill(); g.stroke();
      g.restore();
    };
    const drawCloud = (c) => {
      g.fillStyle = isSpace() ? '#E3D6FF' : '#FFFFFF'; g.strokeStyle = '#4A2C3A'; g.lineWidth = 3;
      g.beginPath();
      g.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      g.arc(c.x + c.r * 0.9, c.y + 4, c.r * 0.75, 0, Math.PI * 2);
      g.arc(c.x - c.r * 0.9, c.y + 4, c.r * 0.7, 0, Math.PI * 2);
      g.fill(); g.stroke();
    };
    const draw = () => {
      g.fillStyle = isSpace() ? '#120F2E' : '#E6F1FF'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#FF8FB8';
      for (let i = 0; i < 18; i++) { const sx = (i * 97 - s.t * 0.4) % W; g.fillRect((sx + W) % W, (i * 53) % 340, 2, 2); }
      s.clouds.forEach(drawCloud);
      drawCar(CAR_X, s.y);
      g.fillStyle = isSpace() ? '#FFF5F2' : '#4A2C3A';
      g.font = '800 20px "Baloo 2", sans-serif';
      g.fillText(`${Math.floor(s.dist)} m`, 390, 30);
    };
    const crash = () => {
      s.on = false; draw(); Sound.thud();
      const d = Math.floor(s.dist);
      if (d > bestRef.current) { bestRef.current = d; store.set('anew-best', String(d)); setBest(d); }
      setMsg(`Bonk! Into a cloud at ${d} m.`);
      shake.start({ x: [-6, 6, -3, 0], transition: { duration: 0.3 } });
    };
    const loop = () => {
      if (!s.on) return;
      s.t++; s.dist += 0.18 + s.t * 0.00012; s.y += (s.ty - s.y) * 0.18;
      if (--s.spawn <= 0) { s.clouds.push({ x: W + 40, y: 30 + Math.random() * 300, r: 16 + Math.random() * 16 }); s.spawn = Math.max(28, 70 - s.t / 40); }
      const speed = 3.2 + s.t * 0.004;
      s.clouds.forEach((c) => { c.x -= speed; });
      s.clouds = s.clouds.filter((c) => c.x > -80);
      if (s.clouds.some((c) => Math.hypot(c.x - CAR_X, c.y - s.y) < c.r + 18)) { crash(); return; }
      draw();
      raf = requestAnimationFrame(loop);
    };
    s.start = () => {
      if (s.on) return;
      Object.assign(s, { on: true, clouds: [], t: 0, dist: 0, spawn: 20 });
      setMsg('Go go go!'); setStarted(true);
      Sound.engine();
      canvas.current.focus({ preventScroll: true });
      raf = requestAnimationFrame(loop);
    };
    draw();
    const redraw = new MutationObserver(() => { if (!s.on) draw(); });
    redraw.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => { s.on = false; cancelAnimationFrame(raf); redraw.disconnect(); };
  }, [shake]);

  const aim = (clientY) => {
    const r = canvas.current.getBoundingClientRect();
    game.current.ty = clamp(((clientY - r.top) / r.height) * H, 24, H - 24);
  };
  const onKey = (e) => {
    const s = game.current;
    if (e.key === 'ArrowUp') { s.ty = clamp(s.ty - 40, 24, H - 24); e.preventDefault(); }
    if (e.key === 'ArrowDown') { s.ty = clamp(s.ty + 40, 24, H - 24); e.preventDefault(); }
  };

  return (
    <>
      <motion.div className="screen" animate={shake}>
        <canvas
          ref={canvas} width={W} height={H} tabIndex={0}
          aria-label="Puddle-Jumper game. Move your pointer or use the up and down arrow keys to dodge clouds."
          onPointerMove={(e) => aim(e.clientY)}
          onPointerDown={(e) => { aim(e.clientY); game.current.start?.(); }}
          onKeyDown={onKey}
          style={{ touchAction: 'none' }}
        />
        <div className="screen__msg" aria-live="polite">{msg ? `${msg} Best: ${best} m` : `Dodge the clouds. Best: ${best} m`}</div>
      </motion.div>
      <h3>Puddle-Jumper Mk.1</h3>
      <p>My very first flying stroller. Steer it through the clouds and don't wake the Moon.</p>
      <div className="row">
        <button className="btn" type="button" onClick={() => game.current.start?.()}>{started ? 'Try again' : 'Take the wheel'}</button>
        <span className="small">Pointer, touch or ↑ ↓</span>
      </div>
    </>
  );
}
