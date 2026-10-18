// Hand-painted canvas textures for the 3D scenes, generated at runtime (no image downloads).
import * as THREE from 'three';

function rng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function canvasTexture(draw, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// A pastel storybook Earth: soft blue oceans, mint and sand continents, white poles.
export function earthTexture() {
  return canvasTexture((g, w, h) => {
    const r = rng(42);
    const sea = g.createLinearGradient(0, 0, 0, h);
    sea.addColorStop(0, '#7FC4F0'); sea.addColorStop(0.5, '#4C9EDB'); sea.addColorStop(1, '#7FC4F0');
    g.fillStyle = sea; g.fillRect(0, 0, w, h);
    const land = (cx, cy, size, col) => {
      g.fillStyle = col;
      for (let i = 0; i < 60; i++) {
        const a = r() * Math.PI * 2, d = r() * size;
        g.beginPath();
        g.arc(cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d * 0.8, size * (0.25 + r() * 0.35), 0, Math.PI * 2);
        g.fill();
      }
    };
    [[180, 170, 70], [300, 330, 60], [560, 150, 90], [640, 300, 60], [820, 200, 70], [900, 360, 40], [420, 230, 40]].forEach(([x, y, s]) => {
      land(x, y, s, '#8FD9A8');
      land(x + 10, y + 5, s * 0.55, '#C9E7A2');
      land(x - 8, y - 4, s * 0.3, '#F2DDA4');
    });
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, w, 22); g.fillRect(0, h - 22, w, 22);
    for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(r() * w, 20, 14 + r() * 16, 0, 7); g.fill(); g.beginPath(); g.arc(r() * w, h - 20, 14 + r() * 16, 0, 7); g.fill(); }
  }, 1024, 512);
}

export function cloudTexture() {
  return canvasTexture((g, w, h) => {
    const r = rng(7);
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = 60 + r() * (h - 120), s = 10 + r() * 34;
      const grd = g.createRadialGradient(x, y, 0, x, y, s * 2);
      grd.addColorStop(0, 'rgba(255,255,255,.85)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.beginPath(); g.ellipse(x, y, s * 2.4, s, 0, 0, Math.PI * 2); g.fill();
    }
  }, 1024, 512);
}

// A soft grey Moon with craters (also used as its bump map).
export function moonTexture() {
  return canvasTexture((g, w, h) => {
    const r = rng(99);
    g.fillStyle = '#C9C6CF'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '60,55,70'},${r() * 0.08})`; g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); }
    for (let i = 0; i < 14; i++) {
      const x = r() * w, y = 60 + r() * (h - 120), a = 40 + r() * 120, b = 30 + r() * 60, rot = r() * 3;
      g.fillStyle = 'rgba(110,104,122,.16)';
      [x - w, x, x + w].forEach((xx) => { g.beginPath(); g.ellipse(xx, y, a, b, rot, 0, 7); g.fill(); });
    }
    for (let i = 0; i < 220; i++) {
      const x = 40 + r() * (w - 80), y = 30 + r() * (h - 60), s = 3 + Math.pow(r(), 3) * 34;
      g.fillStyle = 'rgba(95,90,108,.45)'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = Math.max(1, s * 0.18);
      g.beginPath(); g.arc(x - s * 0.1, y - s * 0.1, s, Math.PI * 0.9, Math.PI * 1.9); g.stroke();
    }
  }, 1024, 512);
}

// Lumi's face for the rocket porthole.
export function lumiFaceTexture() {
  return canvasTexture((g, w) => {
    const c = w / 2;
    g.fillStyle = '#CFE6FF'; g.fillRect(0, 0, w, w);
    g.fillStyle = '#FF8FB8'; g.beginPath(); g.arc(c, c + 10, c * 0.82, 0, 7); g.fill();
    g.beginPath(); g.arc(c - c * 0.62, c - c * 0.5, c * 0.22, 0, 7); g.arc(c + c * 0.62, c - c * 0.5, c * 0.22, 0, 7); g.fill();
    g.fillStyle = '#FFF6E8'; g.beginPath(); g.ellipse(c, c + 22, c * 0.62, c * 0.56, 0, 0, 7); g.fill();
    g.fillStyle = '#4A2C3A';
    g.beginPath(); g.ellipse(c - 30, c + 20, 11, 14, 0, 0, 7); g.ellipse(c + 30, c + 20, 11, 14, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(c - 25, c + 13, 4.5, 0, 7); g.arc(c + 35, c + 13, 4.5, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,143,184,.8)'; g.beginPath(); g.ellipse(c - 52, c + 42, 12, 7, 0, 0, 7); g.ellipse(c + 52, c + 42, 12, 7, 0, 0, 7); g.fill();
    g.fillStyle = '#C93D78'; g.beginPath(); g.moveTo(c - 12, c + 46); g.quadraticCurveTo(c, c + 64, c + 12, c + 46); g.closePath(); g.fill();
  }, 256, 256);
}

// Three-step toon ramp for the cel-shaded look.
export function toonRamp() {
  const t = new THREE.DataTexture(new Uint8Array([90, 180, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}
