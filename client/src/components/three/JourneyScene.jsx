import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { SCENES } from '../../data/content.js';
import { cloudTexture, earthTexture, moonTexture } from './textures.js';
import { makeRocket } from './models.js';

// The Journey: a pinned, scroll-driven Three.js flight. Scrolling launches Lumi's rocket from
// Cloudport (on a storybook Earth), flies it through the stars past four story chapters, and
// lands it on the Moon with the Earth hanging in the sky. Scroll position = flight progress.
const E = new THREE.Vector3(0, 0, 0);
const M = new THREE.Vector3(22, -8, -82);
const R_EARTH = 4, R_MOON = 16;
const dE = E.clone().sub(M).normalize();
const N = dE.clone().multiplyScalar(0.28).add(new THREE.Vector3(0, 0.96, 0)).normalize(); // landing normal (Earth sits low in the sky)
const L = M.clone().add(N.clone().multiplyScalar(R_MOON)); // landing point
const AWAY = dE.clone().sub(N.clone().multiplyScalar(dE.dot(N))).normalize().negate();
const LAUNCH_AT = 0.1, LAND_AT = 0.94;

const CHAPTERS = [
  { from: 0.0, to: 0.08, side: 'right', kind: 'title' },
  { from: 0.1, to: 0.19, side: 'center', kind: 'liftoff' },
  ...SCENES.map((s, i) => ({ from: 0.22 + i * 0.15, to: 0.33 + i * 0.15, side: i % 2 ? 'left' : 'right', kind: 'scene', i })),
  { from: 0.83, to: 0.93, side: 'right', kind: 'approach' },
  { from: 0.965, to: 1.01, side: 'left', kind: 'landed' },
];

const smooth = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

export default function JourneyScene() {
  const { goTo, addStamp, celebrate, talk } = useApp();
  const section = useRef(null);
  const stage = useRef(null);
  const [p, setP] = useState(0);
  const [km, setKm] = useState(384400);
  const fired = useRef({ liftoff: false, landed: false });

  useEffect(() => {
    const el = stage.current;
    const isSmall = window.innerWidth < 720;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x07061a);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07061a, 0.0035);
    const camera = new THREE.PerspectiveCamera(isSmall ? 62 : 48, 1, 0.05, 900);

    // Light: a warm sun, soft fill, and a pink bounce.
    const sun = new THREE.DirectionalLight(0xfff4e6, 2.4);
    sun.position.set(-40, 30, 40);
    scene.add(sun, new THREE.AmbientLight(0x8f86c9, 0.45), new THREE.HemisphereLight(0xffd3e4, 0x231e4a, 0.35));

    // Stars.
    const starGeo = new THREE.BufferGeometry();
    const n = isSmall ? 2500 : 5000;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const tints = [[1, 1, 1], [1, 0.85, 0.92], [0.85, 0.9, 1], [1, 0.95, 0.8]];
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(250 + Math.random() * 300);
      pos.set([v.x, v.y, v.z - 40], i * 3);
      col.set(tints[i % 4], i * 3);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.4, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.9, fog: false })));

    // Earth with clouds and a fresnel glow.
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 64, 48), new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.85 }));
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH * 1.025, 64, 48), new THREE.MeshStandardMaterial({ map: cloudTexture(), transparent: true, depthWrite: false }));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH * 1.18, 48, 32), new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vN; void main(){ float i = pow(0.75 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(1.0,0.62,0.82,1.0) * i; }',
    }));
    earth.rotation.z = 0.35;
    scene.add(earth, clouds, glow);
    // Cloudport: a little pink launch pad on a puff of cloud on top of the Earth.
    const pad = new THREE.Group();
    const puff = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    [[0, 0, 0, 0.5], [0.45, -0.05, 0.1, 0.38], [-0.42, -0.06, -0.05, 0.4], [0.1, -0.05, 0.42, 0.34]].forEach(([x, y, z, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), puff); s.position.set(x, y, z); pad.add(s);
    });
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0xffe38a }));
    deck.position.y = 0.42; pad.add(deck);
    pad.position.set(0, R_EARTH - 0.05, 0);
    scene.add(pad);

    // Moon.
    const mtex = moonTexture();
    const moon = new THREE.Mesh(new THREE.SphereGeometry(R_MOON, 128, 96), new THREE.MeshStandardMaterial({ map: mtex, bumpMap: mtex, bumpScale: 0.6, roughness: 1 }));
    moon.position.copy(M);
    moon.rotation.y = 1.2;
    scene.add(moon);
    // A flag Lumi plants on landing.
    const flag = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    pole.position.y = 0.8;
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshStandardMaterial({ color: 0xff8fb8, side: THREE.DoubleSide }));
    cloth.position.set(0.42, 1.35, 0);
    flag.add(pole, cloth);
    flag.position.copy(L.clone().add(AWAY.clone().multiplyScalar(-1.6)).add(new THREE.Vector3(1.2, 0, 0)));
    flag.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), N);
    flag.scale.setScalar(0.001);
    scene.add(flag);

    // Rocket and its exhaust puffs.
    const rocket = makeRocket();
    rocket.root.scale.setScalar(0.55);
    scene.add(rocket.root);
    const puffs = [];
    const puffMat = new THREE.MeshBasicMaterial({ color: 0xffd3e4, transparent: true, depthWrite: false });
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), puffMat.clone());
      m.visible = false; scene.add(m); puffs.push({ m, life: 0 });
    }
    let puffIdx = 0;

    // Flight path: off the pad, up through the sky, across space, down onto the Moon.
    const start = new THREE.Vector3(0, R_EARTH + 0.75, 0);
    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(0.3, 8, -2),
      new THREE.Vector3(4, 13, -18),
      new THREE.Vector3(11, 15, -38),
      L.clone().add(N.clone().multiplyScalar(9)).add(AWAY.clone().multiplyScalar(-4)),
      L.clone().add(N.clone().multiplyScalar(0.45)),
    ], false, 'centripetal');

    // Camera keyframes: [progress, position(rocket), lookAt(rocket)].
    const v = (x, y, z) => new THREE.Vector3(x, y, z);
    const camLand = L.clone().add(N.clone().multiplyScalar(0.7)).add(AWAY.clone().multiplyScalar(6.5));
    const lookLand = camLand.clone().add(AWAY.clone().multiplyScalar(-10)).add(N.clone().multiplyScalar(0.1));
    const KEYS = [
      [0.0, () => v(7.5, 4.8, 12.5), () => v(3.4, 3.6, 0)],
      [0.1, (r) => r.clone().add(v(2.2, 0.8, 4)), (r) => r.clone().add(v(0, 0.3, 0))],
      [0.3, (r) => r.clone().add(v(3, 2.5, 8)), (r) => r.clone().lerp(E, 0.15)],
      [0.6, (r) => r.clone().add(v(-5, 2, 7)), (r) => r.clone().add(v(5, -1, -12))],
      [0.84, () => M.clone().add(v(12, 18, 40)), () => M.clone().add(v(0, 4, 0))],
      [1.0, () => camLand, () => lookLand],
    ];
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
    const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let target = 0, cur = 0, visible = true, raf = 0, lastP = -1;
    const st = ScrollTrigger.create({ trigger: section.current, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { target = self.progress; } });
    target = cur = st.progress || 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion(), qLand = new THREE.Quaternion().setFromUnitVectors(up, N);
    const clock = new THREE.Clock();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const rawDt = Math.min(0.25, clock.getDelta());
      const dt = Math.min(0.05, rawDt);
      const t = clock.elapsedTime;
      cur += (target - cur) * (1 - Math.exp(-rawDt * 5));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      const pr = cur;
      const u = smooth(clamp01((pr - LAUNCH_AT) / (LAND_AT - LAUNCH_AT)));

      // Rocket position and heading.
      const rp = curve.getPointAt(u);
      rocket.root.position.copy(rp);
      const tan = curve.getTangentAt(Math.min(0.999, u));
      q.setFromUnitVectors(up, tan);
      const landBlend = smooth(clamp01((u - 0.8) / 0.2));
      const padBlend = 1 - smooth(clamp01(u / 0.06));
      rocket.root.quaternion.copy(q).slerp(qLand, landBlend);
      if (padBlend > 0) rocket.root.quaternion.slerp(new THREE.Quaternion(), padBlend);
      const flying = u > 0.001 && u < 0.995;
      const thrust = flying ? (0.8 + Math.sin(t * 40) * 0.15) * (1 - landBlend * 0.7) : 0.05;
      rocket.flame.scale.set(1, thrust, 1);
      rocket.flame.visible = thrust > 0.06;

      // Exhaust puffs while flying.
      if (flying && Math.random() < 0.7) {
        const pf = puffs[puffIdx++ % puffs.length];
        pf.m.position.copy(rp).add(tmpA.copy(tan).multiplyScalar(-0.8));
        pf.m.position.x += (Math.random() - 0.5) * 0.2;
        pf.m.visible = true; pf.life = 1;
      }
      puffs.forEach((pf) => {
        if (pf.life <= 0) return;
        pf.life -= dt * 0.9;
        pf.m.scale.setScalar(0.5 + (1 - pf.life) * 2.2);
        pf.m.material.opacity = Math.max(0, pf.life) * 0.7;
        if (pf.life <= 0) pf.m.visible = false;
      });

      // Camera between keyframes.
      let k = 0;
      while (k < KEYS.length - 2 && pr > KEYS[k + 1][0]) k++;
      const [p0, pos0, look0] = KEYS[k], [p1, pos1, look1] = KEYS[k + 1];
      const f = smooth(clamp01((pr - p0) / (p1 - p0)));
      camPos.copy(pos0(rp)).lerp(tmpA.copy(pos1(rp)), f);
      camLook.copy(look0(rp)).lerp(tmpB.copy(look1(rp)), f);
      camera.position.lerp(camPos, 1 - Math.exp(-rawDt * 12));
      camera.lookAt(camLook);

      earth.rotation.y = t * 0.03;
      clouds.rotation.y = t * 0.045;
      moon.rotation.y = 1.2 + t * 0.005;
      const flagS = smooth(clamp01((pr - 0.975) / 0.02));
      flag.scale.setScalar(Math.max(0.001, flagS));
      cloth.rotation.y = Math.sin(t * 3) * 0.15;

      renderer.render(scene, camera);
      if (Math.abs(pr - lastP) > 0.002) {
        lastP = pr;
        setP(pr);
        setKm(Math.round((384400 * (1 - u)) / 100) * 100);
      }
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      st.kill(); io.disconnect();
      window.removeEventListener('resize', resize);
      renderer.dispose();
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material?.map) o.material.map.dispose(); });
      renderer.domElement.remove();
    };
  }, []);

  // One-shot moments: liftoff and touchdown.
  useEffect(() => {
    if (p > LAUNCH_AT + 0.005 && !fired.current.liftoff) {
      fired.current.liftoff = true;
      Sound.blastoff();
      speak('Three, two, one, liftoff!', { rate: 1.05 });
    }
    if (p > 0.975 && !fired.current.landed) {
      fired.current.landed = true;
      Sound.arpeggio([72, 76, 79, 84, 88, 91], 0.09);
      celebrate();
      talk('We landed on the Moon! Hi, Moon! I missed you!');
      addStamp('journey');
    }
  }, [p, celebrate, talk, addStamp]);

  const active = CHAPTERS.filter((c) => p >= c.from && p < c.to);

  return (
    <section className="journey" ref={section}>
      <div className="journey__sticky">
        <div className="journey__stage" ref={stage} />
        <div className="journey__hud" aria-live="off">
          <span className="label">Distance to the Moon</span>
          <strong>{km.toLocaleString('en-US')} km</strong>
          <div className="journey__bar"><span style={{ transform: `scaleX(${p})` }} /></div>
        </div>
        <AnimatePresence>
          {active.map((c) => (
            <motion.div key={`${c.kind}-${c.i ?? ''}`} className={`journey__card journey__card--${c.side} journey__card--${c.kind}`}
              initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.45 }}>
              {c.kind === 'title' && (<><span className="label">My story · scroll to fly</span><h2>From moon crumb to engineer</h2><p>I fell off the Moon a long time ago. Today I'm flying back for a visit. Keep scrolling to launch!</p><span className="journey__scroll">Scroll ↓</span></>)}
              {c.kind === 'liftoff' && (<h2 className="journey__big">3… 2… 1… Liftoff!</h2>)}
              {c.kind === 'scene' && (<><span className="label">Chapter {c.i + 1} · {SCENES[c.i].km}</span><h3>{SCENES[c.i].title}</h3><p>{SCENES[c.i].copy}</p></>)}
              {c.kind === 'approach' && (<><span className="label">Almost home</span><h3>There it is. The Moon!</h3><p>Same craters, same sleepy glow. Coming in to land… gently… gently…</p></>)}
              {c.kind === 'landed' && (<><h2>We landed on the Moon!!</h2><p>Planting my pink flag. I'll be back at Cloudport by bedtime.</p>
                <button className="btn" type="button" onClick={() => goTo('/dreams', 'The Dream Observatory')}>Visit my dream observatory →</button></>)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
