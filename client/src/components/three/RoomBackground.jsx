import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext.jsx';
import { makeLumi, makeRocket, toon } from './models.js';

// The scrolling background: Lumi's 3D nursery. A long pastel room with a round moon window,
// a crib (with Lumi napping in it), toy blocks, balloons, a star mobile and a moon lamp.
// As you scroll the page, the camera glides deeper into the room and the toys bob and spin.
// In night mode the lights go down and the window and lamp glow.

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  t.anisotropy = 4;
  return t;
}

const floorTex = () => canvasTex(256, 256, (g, w) => {
  g.fillStyle = '#FFE3EC'; g.fillRect(0, 0, w, w);
  g.fillStyle = '#FFD0DF'; g.fillRect(0, 0, w / 2, w / 2); g.fillRect(w / 2, w / 2, w / 2, w / 2);
  g.strokeStyle = 'rgba(201,61,120,.12)'; g.lineWidth = 3; g.strokeRect(0, 0, w, w);
}, [8, 16]);

const wallTex = () => canvasTex(256, 256, (g, w) => {
  g.fillStyle = '#FFF4F0'; g.fillRect(0, 0, w, w);
  const star = (x, y, r, c) => {
    g.fillStyle = c; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.fill();
  };
  star(60, 70, 16, '#FFC2D6'); star(190, 180, 12, '#E3D6FF'); star(200, 50, 8, '#FFE38A'); star(70, 200, 9, '#FFE38A');
  g.fillStyle = '#FFE3EC'; [[128, 120], [30, 140], [230, 110]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); });
}, [5, 2]);

const windowTex = () => canvasTex(512, 512, (g, w) => {
  const grd = g.createRadialGradient(w * 0.5, w * 0.5, 0, w * 0.5, w * 0.5, w * 0.6);
  grd.addColorStop(0, '#2A2156'); grd.addColorStop(1, '#0E0C24');
  g.fillStyle = grd; g.fillRect(0, 0, w, w);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,${230 + Math.random() * 25},${230 + Math.random() * 25},${0.4 + Math.random() * 0.6})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * w, Math.random() * 2.2, 0, 7); g.fill(); }
  // Crescent moon.
  g.fillStyle = '#FFF1C9'; g.beginPath(); g.arc(w * 0.66, w * 0.34, 62, 0, 7); g.fill();
  g.fillStyle = '#1C1740'; g.beginPath(); g.arc(w * 0.62, w * 0.3, 56, 0, 7); g.fill();
  // Little clouds at the bottom.
  g.fillStyle = 'rgba(255,211,228,.85)';
  [[80, 430, 46], [150, 410, 58], [230, 440, 44], [330, 425, 52], [420, 440, 48]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
});

const letterTex = (ch, bg) => canvasTex(128, 128, (g, w) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, w);
  g.strokeStyle = '#4A2C3A'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, w - 8);
  g.fillStyle = '#4A2C3A'; g.font = '800 76px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(ch, w / 2, w / 2 + 6);
});

function starGeo(outer = 0.3, inner = 0.13, depth = 0.08) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
}

const W = 16, H = 9, D = 34;

export default function RoomBackground() {
  const { space } = useApp();
  const mount = useRef(null);
  const nightRef = useRef(space);
  useEffect(() => { nightRef.current = space; }, [space]);

  useEffect(() => {
    const el = mount.current;
    const small = window.innerWidth < 720;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: false, powerPreference: 'low-power' }); } catch { return undefined; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const bgDay = new THREE.Color('#FFF1F4'), bgNight = new THREE.Color('#141032');
    scene.background = bgDay.clone();
    scene.fog = new THREE.Fog(scene.background, 14, 40);
    const camera = new THREE.PerspectiveCamera(small ? 70 : 55, 1, 0.1, 80);

    const hemi = new THREE.HemisphereLight(0xfff3f6, 0xffc2d6, 1.1);
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 8, 10);
    const lampLight = new THREE.PointLight(0xffd98a, 0, 14, 1.6); lampLight.position.set(-5.5, 2.4, -6);
    const windowLight = new THREE.PointLight(0x9fa8ff, 0, 18, 1.4); windowLight.position.set(0, 4.5, -14);
    scene.add(hemi, key, lampLight, windowLight);

    // Room shell.
    const floorMat = new THREE.MeshLambertMaterial({ map: floorTex() });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.z = -D / 2 + 6;
    const wallMat = new THREE.MeshLambertMaterial({ map: wallTex() });
    const left = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
    left.rotation.y = Math.PI / 2; left.position.set(-W / 2, H / 2, -D / 2 + 6);
    const right = left.clone(); right.rotation.y = -Math.PI / 2; right.position.x = W / 2;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
    back.position.set(0, H / 2, -D + 6);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ color: 0xfff7f3 }));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, -D / 2 + 6);
    // Skirting boards.
    const trimMat = toon(0xff8fb8);
    [[-W / 2 + 0.06, 0], [W / 2 - 0.06, 0]].forEach(([x]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, D), trimMat); b.position.set(x, 0.2, -D / 2 + 6); scene.add(b);
    });
    scene.add(floor, left, right, back, ceil);

    // Round moon window on the back wall.
    const winZ = -D + 6.02;
    const winMat = new THREE.MeshBasicMaterial({ map: windowTex() });
    const win = new THREE.Mesh(new THREE.CircleGeometry(2.6, 64), winMat); win.position.set(0, 4.6, winZ);
    const winFrame = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.22, 16, 64), toon(0xffe38a)); winFrame.position.set(0, 4.6, winZ + 0.05);
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.12, 0.08), toon(0xffe38a)); bar1.position.set(0, 4.6, winZ + 0.06);
    const bar2 = bar1.clone(); bar2.rotation.z = Math.PI / 2;
    scene.add(win, winFrame, bar1, bar2);

    // Rug.
    const rug = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), new THREE.MeshLambertMaterial({ color: 0xe3d6ff }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0.5, 0.01, -6);
    const rug2 = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.9, 48), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    rug2.rotation.x = -Math.PI / 2; rug2.position.set(0.5, 0.02, -6);
    scene.add(rug, rug2);

    // Crib with a napping Lumi.
    const crib = new THREE.Group();
    const wood = toon(0xffffff);
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 1.9), toon(0xffd3e4)); base.position.y = 0.9;
    crib.add(base);
    for (let i = 0; i <= 10; i++) {
      [-0.95, 0.95].forEach((z) => { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8), wood); bar.position.set(-1.6 + i * 0.32, 1.65, z); crib.add(bar); });
    }
    [[-1.7, 0], [1.7, 0]].forEach(([x]) => { const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.6, 2.06), wood); post.position.set(x, 1.3, 0); crib.add(post); });
    [-0.95, 0.95].forEach((z) => { const rail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 0.12), toon(0xff8fb8)); rail.position.set(0, 2.32, z); crib.add(rail); });
    const lumi = makeLumi();
    lumi.root.scale.setScalar(0.42);
    lumi.root.position.set(0.2, 1.35, 0.1);
    lumi.root.rotation.set(-1.1, 0.2, 0);
    crib.add(lumi.root);
    crib.position.set(4.6, 0, -9);
    crib.rotation.y = -0.35;
    scene.add(crib);

    // Toy blocks spelling LUMI.
    const blocks = [];
    [['L', '#FFC2D6'], ['U', '#FFE38A'], ['M', '#BDEBD5'], ['I', '#CFE6FF']].forEach(([ch, bg], i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshLambertMaterial({ map: letterTex(ch, bg) }));
      m.position.set(-4.4 + i * 1.0, 0.45 + (i === 2 ? 0.9 : 0), -3.2 + (i % 2) * 0.3);
      if (i === 2) m.position.x = -3.4;
      m.rotation.y = (i - 1.5) * 0.25;
      scene.add(m); blocks.push(m);
    });

    // A toy rocket on the floor.
    const rocket = makeRocket();
    rocket.flame.visible = false;
    rocket.root.scale.setScalar(0.9);
    rocket.root.position.set(-4.8, 0.9, -12);
    scene.add(rocket.root);

    // Moon lamp on a little table.
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 32), toon(0xe3d6ff)); table.position.set(-5.5, 1.3, -6);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.3, 12), toon(0xe3d6ff)); leg.position.set(-5.5, 0.65, -6);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
    const lamp = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.22, 16, 40, Math.PI * 1.3), lampMat);
    lamp.position.set(-5.5, 2.15, -6); lamp.rotation.z = -0.6;
    scene.add(table, leg, lamp);

    // Balloons.
    const balloons = [];
    [[0xff8fb8, 2.2, -4], [0xffe38a, 3.2, -5.2], [0xe3d6ff, -1.8, -10], [0xbdebd5, 1.2, -14], [0xff8fb8, -3, -17]].forEach(([c, x, z], i) => {
      const g = new THREE.Group();
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 18), toon(c)); b.scale.y = 1.18;
      const knot = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 8), toon(c)); knot.position.y = -0.68; knot.rotation.x = Math.PI;
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.2, 4), new THREE.MeshBasicMaterial({ color: 0x4a2c3a })); str.position.y = -1.8;
      g.add(b, knot, str);
      g.position.set(x, 5 + (i % 3) * 0.6, z);
      scene.add(g); balloons.push({ g, ph: i * 1.7 });
    });

    // Star-and-moon mobile hanging from the ceiling.
    const mobile = new THREE.Group();
    mobile.position.set(0.5, H, -6);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.04, 8, 48), toon(0xffffff)); ring.rotation.x = Math.PI / 2; ring.position.y = -1.2;
    mobile.add(ring);
    const hangCords = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4), new THREE.MeshBasicMaterial({ color: 0x4a2c3a })); hangCords.position.y = -0.6; mobile.add(hangCords);
    const sg = starGeo();
    [0xffe38a, 0xff8fb8, 0xe3d6ff, 0xffe38a, 0xbdebd5, 0xff8fb8].forEach((c, i) => {
      const a = (i / 6) * Math.PI * 2;
      const st = new THREE.Mesh(sg, toon(c));
      const len = 0.6 + (i % 2) * 0.4;
      st.position.set(Math.cos(a) * 1.4, -1.2 - len - 0.3, Math.sin(a) * 1.4);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, len, 4), new THREE.MeshBasicMaterial({ color: 0x4a2c3a }));
      cord.position.set(Math.cos(a) * 1.4, -1.2 - len / 2, Math.sin(a) * 1.4);
      mobile.add(st, cord);
    });
    scene.add(mobile);

    // Puffy clouds floating near the ceiling, and loose stars drifting about.
    const cloudMat = toon(0xffffff);
    const clouds = [];
    [[-5, 7, -8], [5, 7.4, -13], [-2, 7.6, -20], [4, 6.8, -2]].forEach(([x, y, z], i) => {
      const g = new THREE.Group();
      [[0, 0, 0.6], [0.6, -0.1, 0.45], [-0.6, -0.12, 0.48], [0.25, 0.3, 0.42]].forEach(([dx, dy, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), cloudMat); s.position.set(dx, dy, 0); g.add(s); });
      g.position.set(x, y, z); scene.add(g); clouds.push({ g, ph: i });
    });
    const floaters = [];
    for (let i = 0; i < 14; i++) {
      const st = new THREE.Mesh(sg, toon([0xffe38a, 0xff8fb8, 0xe3d6ff][i % 3]));
      st.position.set((Math.random() - 0.5) * (W - 3), 1.5 + Math.random() * 5.5, 4 - Math.random() * (D - 6));
      st.scale.setScalar(0.5 + Math.random() * 0.6);
      scene.add(st); floaters.push({ m: st, ph: Math.random() * 6, sp: 0.3 + Math.random() * 0.5 });
    }

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 72 : 55;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const prog = () => { const max = document.documentElement.scrollHeight - window.innerHeight; return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0; };
    let cur = prog(), night = nightRef.current ? 1 : 0, raf = 0, last = 0;
    const clock = new THREE.Clock();
    const tmpC = new THREE.Color();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      if (now - last < (small ? 33 : 16)) return; // ~30fps on phones
      last = now;
      const dt = Math.min(0.1, clock.getDelta());
      const t = clock.elapsedTime;
      cur += (prog() - cur) * (1 - Math.exp(-dt * 4));
      night += ((nightRef.current ? 1 : 0) - night) * (1 - Math.exp(-dt * 2.5));

      // Camera glides from the doorway towards the moon window, swaying past the toys.
      const z = 8 - cur * 20;
      const x = Math.sin(cur * Math.PI * 2) * 2.2;
      const y = 3.4 + Math.sin(cur * Math.PI) * 0.8;
      camera.position.set(x, y, z);
      camera.lookAt(x * 0.3 + Math.sin(cur * Math.PI * 3) * 1.2, 3.2 - cur * 0.3, z - 10);
      if (!reduce) {
        camera.position.y += Math.sin(t * 0.6) * 0.06;
        mobile.rotation.y = t * 0.25 + cur * 4;
        balloons.forEach(({ g, ph }) => { g.position.y += Math.sin(t * 0.9 + ph) * 0.003; g.rotation.z = Math.sin(t * 0.7 + ph) * 0.08; });
        clouds.forEach(({ g, ph }) => { g.position.x += Math.sin(t * 0.2 + ph) * 0.004; });
        floaters.forEach(({ m, ph, sp }) => { m.rotation.y = t * sp + cur * 6; m.position.y += Math.sin(t * sp + ph) * 0.004; });
        rocket.root.rotation.y = t * 0.3 + cur * 3;
        blocks.forEach((b, i) => { b.rotation.y = (i - 1.5) * 0.25 + Math.sin(cur * Math.PI * 2 + i) * 0.4; });
        lumi.root.position.y = 1.35 + Math.sin(t * 1.4) * 0.02; // breathing
      }

      // Day/night lighting.
      hemi.intensity = 1.1 - night * 0.8;
      key.intensity = 1.4 - night * 1.25;
      lampLight.intensity = night * 9;
      windowLight.intensity = night * 6;
      lampMat.color.setHex(0xffe9a8).multiplyScalar(1 + night * 0.4);
      tmpC.copy(bgDay).lerp(bgNight, night);
      scene.background.copy(tmpC); scene.fog.color.copy(tmpC);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) { o.material.map?.dispose?.(); o.material.dispose?.(); } });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="room-bg" aria-hidden="true">
      <div className="room-bg__canvas" ref={mount} />
      <div className="room-bg__veil" />
    </div>
  );
}
