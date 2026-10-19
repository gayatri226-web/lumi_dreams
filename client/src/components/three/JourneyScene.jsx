import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { SCENES } from '../../data/content.js';
import { makeSkyCar } from './models.js';
import { glowTexture, makeEarth, makeJupiter, makeLandingSite, makeMars, makeMoon, makeSaturn, makeSky, makeStreaks, makeSun } from './space.js';

// The Journey: a pinned, scroll-driven Three.js flight through realistic space. Scrolling launches
// Lumi's sky-car, the Moonbolt-1, from Cloudport (on top of a day/night Earth), flies past Mars, Jupiter and Saturn
// through four story chapters, and lands on real moon ground with the Earth hanging in the sky.
// Scroll position = flight progress.
const E = new THREE.Vector3(0, 0, 0);
const M = new THREE.Vector3(30, -12, -170);
const R_EARTH = 10, R_MOON = 14;
const SUN_DIR = new THREE.Vector3(-0.85, 0.42, -0.32).normalize();
const dE = E.clone().sub(M).normalize();
const N = dE.clone().multiplyScalar(0.28).add(new THREE.Vector3(0, 0.96, 0)).normalize(); // landing normal (Earth low in the sky)
const L = M.clone().add(N.clone().multiplyScalar(R_MOON)); // landing point
const AWAY = dE.clone().sub(N.clone().multiplyScalar(dE.dot(N))).normalize().negate();
const LAUNCH_AT = 0.1, LAND_AT = 0.94;
const CAR_S = 0.42, BASE = 0.46 * CAR_S;

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
  const [hud, setHud] = useState({ km: 384400, speed: 0 });
  const fired = useRef({ liftoff: false, landed: false });

  useEffect(() => {
    const el = stage.current;
    const isSmall = window.innerWidth < 720;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x020208);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isSmall ? 62 : 46, 1, 0.03, 2500);

    // Light: one hard sun (space has no fill), plus the faintest starlight.
    const sunLight = new THREE.DirectionalLight(0xfff6ea, 3.2);
    sunLight.position.copy(SUN_DIR).multiplyScalar(100);
    scene.add(sunLight, new THREE.AmbientLight(0x6a6a9a, 0.07));
    const sunFlare = makeSun(SUN_DIR.clone().multiplyScalar(800));
    scene.add(sunFlare);

    const sky = makeSky(1000, isSmall ? 3500 : 7000);
    scene.add(sky);

    const earth = makeEarth(R_EARTH, SUN_DIR, isSmall ? 72 : 112);
    scene.add(earth.group);

    // Cloudport: a little launch pad on a puff of cloud on top of the Earth.
    const pad = new THREE.Group();
    const puffMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffe3ee, emissiveIntensity: 0.12 });
    [[0, 0, 0, 0.5], [0.45, -0.05, 0.1, 0.38], [-0.42, -0.06, -0.05, 0.4], [0.1, -0.05, 0.42, 0.34]].forEach(([x, y, z, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), puffMat); s.position.set(x, y, z); pad.add(s);
    });
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0xffe38a, emissive: 0xffe38a, emissiveIntensity: 0.2 }));
    deck.position.y = 0.42; pad.add(deck);
    pad.scale.setScalar(0.6);
    pad.position.set(0, R_EARTH - 0.05, 0);
    scene.add(pad);

    const moon = makeMoon(R_MOON);
    moon.position.copy(M);
    moon.rotation.y = 2.4;
    scene.add(moon);
    scene.add(makeLandingSite(L, N, M, R_MOON, 8));

    // Distant planets drifting past for a sense of travel.
    const mars = makeMars(4); mars.position.set(58, 30, -84); scene.add(mars);
    const jupiter = makeJupiter(34); jupiter.position.set(-190, 70, -500); jupiter.rotation.z = 0.05; scene.add(jupiter);
    const saturn = makeSaturn(22); saturn.position.set(180, 95, -430); scene.add(saturn);

    // The flag Lumi plants on landing.
    const flag = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    pole.position.y = 0.4;
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshStandardMaterial({ color: 0xff8fb8, side: THREE.DoubleSide, emissive: 0xff8fb8, emissiveIntensity: 0.25 }));
    cloth.position.set(0.21, 0.66, 0);
    flag.add(pole, cloth);
    flag.position.copy(L.clone().add(AWAY.clone().multiplyScalar(-0.7)).add(new THREE.Vector3(0.7, 0, 0)));
    flag.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), N);
    flag.scale.setScalar(0.001);
    scene.add(flag);

    // Lumi's sky-car, with its cute colors kept true and a soft self-glow so it reads against black space.
    const rocket = makeSkyCar();
    rocket.root.scale.setScalar(CAR_S);
    rocket.root.traverse((o) => {
      if (o.material && o.material.isMeshToonMaterial) { o.material.emissive = o.material.color.clone(); o.material.emissiveIntensity = 0.28; o.material.toneMapped = false; }
    });
    scene.add(rocket.root);

    // A soft contact shadow that appears under the rocket as it lands.
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: glowTexture('rgba(0,0,0,.85)', 'rgba(0,0,0,.4)'), transparent: true, depthWrite: false }));
    shadow.position.copy(L).add(N.clone().multiplyScalar(0.05));
    shadow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
    scene.add(shadow);

    // Exhaust: hot additive sparks and slower grey smoke.
    const fireTex = glowTexture('rgba(255,250,220,1)', 'rgba(255,150,120,.45)');
    const smokeTex = glowTexture('rgba(235,230,240,.9)', 'rgba(220,215,230,.35)');
    const parts = [];
    for (let i = 0; i < 90; i++) {
      const smoke = i % 3 === 0;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smoke ? smokeTex : fireTex, transparent: true, depthWrite: false, blending: smoke ? THREE.NormalBlending : THREE.AdditiveBlending, toneMapped: false }));
      s.visible = false; scene.add(s);
      parts.push({ s, smoke, life: 0, vel: new THREE.Vector3() });
    }
    let partIdx = 0;

    const streaks = makeStreaks(isSmall ? 260 : 520, 36);
    scene.add(streaks.lines);

    // Flight path: off the pad, up through the sky, across space, down onto the Moon.
    const start = new THREE.Vector3(0, R_EARTH + 0.24 + BASE, 0);
    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(0.1, 13, -0.6),
      new THREE.Vector3(2.5, 20, -12),
      new THREE.Vector3(9, 25, -48),
      new THREE.Vector3(20, 22, -100),
      L.clone().add(N.clone().multiplyScalar(10)).add(AWAY.clone().multiplyScalar(-4)),
      L.clone().add(N.clone().multiplyScalar(1.6)),
      L.clone().add(N.clone().multiplyScalar(BASE + 0.03)),
    ], false, 'centripetal');

    // Camera keyframes: [progress, position(rocket), lookAt(rocket)].
    const v = (x, y, z) => new THREE.Vector3(x, y, z);
    const camLand = L.clone().add(N.clone().multiplyScalar(0.55)).add(AWAY.clone().multiplyScalar(4.2));
    const lookLand = camLand.clone().add(AWAY.clone().multiplyScalar(-10)).add(N.clone().multiplyScalar(0.9));
    const KEYS = [
      [0.0, () => v(5.2, 13.2, 8.8), () => v(1.9, 10.7, 0)],
      [0.1, (r) => r.clone().add(v(2.1, 0.25, 3.6)), (r) => r.clone().add(v(0, 0.55, 0))],
      [0.2, (r) => r.clone().add(v(2.2, 0.9, -3.8)), (r) => r.clone().lerp(E, 0.1)],
      [0.4, (r) => r.clone().add(v(-8, 2.5, 4)), (r) => r.clone().add(v(6, 0.2, -6))],
      [0.62, (r) => r.clone().add(v(1.2, 1.8, 7)), () => M.clone()],
      [0.84, () => M.clone().add(v(10, 17, 34)), () => M.clone().add(v(0, 5, 0))],
      [1.0, () => camLand, () => lookLand],
    ];
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
    const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
    const prevCam = new THREE.Vector3(), vel = new THREE.Vector3(), velSm = new THREE.Vector3();

    let baseFov = 46;
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      baseFov = w / h < 0.8 ? 64 : 46;
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let target = 0, cur = 0, visible = true, raf = 0, lastP = -1, first = true;
    const st = ScrollTrigger.create({ trigger: section.current, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { target = self.progress; } });
    target = cur = st.progress || 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const up = new THREE.Vector3(0, 1, 0);
    // Orientation helpers: the car's nose is +z and its roof is +y.
    const basisQ = (fwd, upv, out) => {
      const z = fwd.clone().normalize();
      const x = new THREE.Vector3().crossVectors(upv, z).normalize();
      const y = new THREE.Vector3().crossVectors(z, x).normalize();
      return out.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    };
    const H0 = new THREE.Vector3(M.x, 0, M.z).normalize(); // heading towards the Moon
    const q = new THREE.Quaternion(), qId = basisQ(H0, up, new THREE.Quaternion());
    const qLand = basisQ(new THREE.Vector3().crossVectors(N, AWAY), N, new THREE.Quaternion());
    const heading = new THREE.Vector3(), fwd = new THREE.Vector3();
    const clock = new THREE.Clock();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { clock.getDelta(); return; }
      const rawDt = Math.min(0.25, clock.getDelta());
      const dt = Math.max(0.001, Math.min(0.05, rawDt));
      const t = clock.elapsedTime;
      cur += (target - cur) * (1 - Math.exp(-rawDt * 4.5));
      if (Math.abs(target - cur) < 0.0004) cur = target;
      const pr = cur;
      const u = smooth(clamp01((pr - LAUNCH_AT) / (LAND_AT - LAUNCH_AT)));

      // Rocket position and heading.
      const rp = curve.getPointAt(u);
      rocket.root.position.copy(rp);
      const tan = curve.getTangentAt(Math.min(0.999, u));
      // Fly nose-first, but keep the car's pitch gentle like a real car-plane (never nose-straight-up).
      heading.set(tan.x, 0, tan.z);
      const hl = heading.length();
      heading.normalize().lerp(H0, 1 - smooth(clamp01((hl - 0.1) / 0.35))).normalize();
      const pitch = Math.max(-0.38, Math.min(0.42, tan.y * 0.5));
      fwd.copy(heading).multiplyScalar(Math.cos(pitch)).addScaledVector(up, Math.sin(pitch));
      basisQ(fwd, up, q);
      const landBlend = smooth(clamp01((u - 0.82) / 0.16));
      const padBlend = 1 - smooth(clamp01(u / 0.05));
      rocket.root.quaternion.copy(q).slerp(qLand, landBlend);
      if (padBlend > 0) rocket.root.quaternion.slerp(qId, padBlend);
      const flying = u > 0.0015 && u < 0.997;
      const thrust = flying ? (0.85 + Math.sin(t * 45) * 0.15) * (1 - landBlend * 0.75) * (1 - padBlend * 0.8) : 0.04;
      rocket.flame.scale.set(1, 1, thrust);
      rocket.flame.visible = thrust > 0.06;
      // Hover jets blaze for liftoff and touchdown, and idle softly in between.
      const hover = flying ? Math.max(padBlend, landBlend, 0.25) : 0.15;
      rocket.glows.forEach((g, gi) => { g.scale.set(1, 0.5 + hover * (0.9 + Math.sin(t * 30 + gi) * 0.1), 1); g.material.opacity = 0.35 + hover * 0.6; });
      if (flying) rocket.root.rotateZ(Math.sin(t * 2.2) * 0.04);

      // Exhaust sparks while flying; big smoke billows right at liftoff.
      if (flying) {
        const spawn = u < 0.05 ? 3 : 1;
        for (let k = 0; k < spawn; k++) {
          const pt = parts[partIdx++ % parts.length];
          const lift = u < 0.05;
          const nozzle = lift ? tmpA.set(0, -BASE * 1.4, 0) : tmpA.copy(fwd).multiplyScalar(-CAR_S * 1.25);
          pt.s.position.copy(rp).add(nozzle);
          pt.vel.copy(lift ? up : fwd).multiplyScalar(-(pt.smoke ? 0.4 : 1.2)).add(tmpB.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(pt.smoke ? (u < 0.05 ? 1.4 : 0.3) : 0.35));
          pt.life = 1; pt.s.visible = true;
        }
      }
      parts.forEach((pt) => {
        if (pt.life <= 0) return;
        pt.life -= dt * (pt.smoke ? 0.55 : 1.8);
        pt.s.position.addScaledVector(pt.vel, dt);
        const k = 1 - Math.max(0, pt.life);
        pt.s.scale.setScalar(pt.smoke ? 0.25 + k * 1.4 : 0.22 * (1 - k * 0.6));
        pt.s.material.opacity = Math.max(0, pt.life) * (pt.smoke ? 0.55 : 0.9);
        if (pt.life <= 0) pt.s.visible = false;
      });

      // Camera between keyframes, with a rumble during liftoff.
      let k = 0;
      while (k < KEYS.length - 2 && pr > KEYS[k + 1][0]) k++;
      const [p0, pos0, look0] = KEYS[k], [p1, pos1, look1] = KEYS[k + 1];
      const f = smooth(clamp01((pr - p0) / (p1 - p0)));
      camPos.copy(pos0(rp)).lerp(tmpA.copy(pos1(rp)), f);
      camLook.copy(look0(rp)).lerp(tmpB.copy(look1(rp)), f);
      if (first) { camera.position.copy(camPos); prevCam.copy(camPos); first = false; }
      camera.position.lerp(camPos, 1 - Math.exp(-rawDt * 10));
      const rumble = flying && u < 0.07 ? (1 - u / 0.07) * 0.035 : 0;
      if (rumble) camera.position.add(tmpA.set(Math.sin(t * 61), Math.sin(t * 53), Math.sin(t * 47)).multiplyScalar(rumble));
      camera.lookAt(camLook);
      const fovT = baseFov - smooth(clamp01((pr - 0.9) / 0.1)) * (baseFov * 0.22);
      if (Math.abs(camera.fov - fovT) > 0.01) { camera.fov = fovT; camera.updateProjectionMatrix(); }

      // Velocity drives the speed streaks.
      vel.copy(camera.position).sub(prevCam).divideScalar(dt);
      prevCam.copy(camera.position);
      velSm.lerp(vel, 1 - Math.exp(-rawDt * 6));
      streaks.update(camera.position, velSm, dt);

      // Keep the sky and sun "infinitely" far away.
      sky.position.copy(camera.position);
      sunFlare.position.copy(camera.position).addScaledVector(SUN_DIR, 800);

      earth.body.rotation.y = t * 0.01;
      earth.clouds.rotation.y = t * 0.016;
      mars.rotation.y = t * 0.02;
      jupiter.rotation.y = t * 0.04;
      const flagS = smooth(clamp01((pr - 0.975) / 0.02));
      flag.scale.setScalar(Math.max(0.001, flagS));
      cloth.rotation.y = Math.sin(t * 2.4) * 0.12;
      shadow.material.opacity = smooth(clamp01((u - 0.9) / 0.1));

      renderer.render(scene, camera);
      if (Math.abs(pr - lastP) > 0.002 || (pr === target && lastP !== pr)) {
        lastP = pr;
        setP(pr);
        const kmps = flying ? Math.min(11.2, Math.max(0.4, velSm.length() * 0.18)) : 0;
        setHud({ km: Math.round((384400 * (1 - u)) / 100) * 100, speed: Math.round(kmps * 10) / 10 });
      }
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      st.kill(); io.disconnect();
      window.removeEventListener('resize', resize);
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => { Object.values(m).forEach((val) => val && val.isTexture && val.dispose()); m.uniforms && Object.values(m.uniforms).forEach((un) => un.value?.isTexture && un.value.dispose()); m.dispose(); });
      });
      renderer.dispose();
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
      talk('Mission complete! Hi, Moon! I missed you!');
      addStamp('journey');
    }
  }, [p, celebrate, talk, addStamp]);

  const active = CHAPTERS.filter((c) => p >= c.from && p < c.to);

  return (
    <section className="journey" ref={section}>
      <div className="journey__sticky">
        <div className="journey__stage" ref={stage} />
        <div className="journey__vignette" aria-hidden="true" />
        <div className="journey__hud" aria-live="off">
          <div className="journey__hudrow">
            <div><span className="label">To the Moon</span><strong>{hud.km.toLocaleString('en-US')} km</strong></div>
            <div><span className="label">Speed</span><strong>{hud.speed.toFixed(1)} km/s</strong></div>
          </div>
          <div className="journey__bar"><span style={{ transform: `scaleX(${p})` }} /></div>
        </div>
        <AnimatePresence>
          {active.map((c) => (
            <motion.div key={`${c.kind}-${c.i ?? ''}`} className={`journey__card journey__card--${c.side} journey__card--${c.kind}`}
              initial={{ opacity: 0, y: 40, scale: 0.96, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -30, filter: 'blur(6px)' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              {c.kind === 'title' && (<><span className="label">Chapter 4 · My big mission</span><h2>Moonbolt-1: Earth to Moon</h2><p>My first sky-car that can fly to space. Today's test flight: Cloudport to the Moon. Scroll to launch!</p><span className="journey__scroll">Scroll ↓</span></>)}
              {c.kind === 'liftoff' && (<h2 className="journey__big">3… 2… 1… Liftoff!</h2>)}
              {c.kind === 'scene' && (<><span className="label">Mission log {c.i + 1} · {SCENES[c.i].km} to go</span><h3>{SCENES[c.i].title}</h3><p>{SCENES[c.i].copy}</p></>)}
              {c.kind === 'approach' && (<><span className="label">Almost home</span><h3>There it is. The Moon!</h3><p>My first home. Same craters, same sleepy glow. Hover jets on… gently… gently…</p></>)}
              {c.kind === 'landed' && (<><h2>We landed on the Moon!!</h2><p>Mission complete. A sky-car built by a baby just flew to space. Planting my pink flag!</p>
                <button className="btn" type="button" onClick={() => goTo('/dreams', 'The Dream Observatory')}>Chapter 5: What's next →</button></>)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
