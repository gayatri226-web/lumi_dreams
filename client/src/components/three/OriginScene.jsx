import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { Sound } from '../../lib/sound.js';
import { speak } from '../../lib/voice.js';
import { PROFILE } from '../../data/content.js';
import { makeLumi, makeSkyCar, part, toon } from './models.js';
import { glowTexture, makeEarth, makeMoon, makeSky, makeSun } from './space.js';

// Origin: Lumi's backstory as a pinned, scroll-driven Three.js film.
// Act 1 (space): the Moon sneezes, a crumb of moonlight tumbles 384,400 km towards a real Earth.
// Act 2 (Cloudport): the crumb punches through the clouds, lands in a space-garage scrapyard and
// becomes baby Lumi, who builds her first sky-car piece by piece and points it at the Moon.
// It ends on Lumi's full profile card.

const SUN_DIR = new THREE.Vector3(-0.6, 0.5, 0.45).normalize();
const MOON_R = 8;
const EARTH = new THREE.Vector3(40, -70, -160), EARTH_R = 26;
const C0 = new THREE.Vector3(0.2, 1, 0.35).normalize().multiplyScalar(MOON_R + 0.06);
const CUT = 0.42; // the moment we fly through the clouds into Cloudport
const CAR_AT = new THREE.Vector3(2.1, 0, 0.5);
const LUMI_AT = new THREE.Vector3(-0.2, 0, 1.0);

const CHAPTERS = [
  { from: 0.0, to: 0.1, side: 'right', kind: 'title' },
  { from: 0.115, to: 0.2, side: 'center', kind: 'sneeze' },
  { from: 0.21, to: 0.37, side: 'right', kind: 'fall' },
  { from: 0.45, to: 0.56, side: 'left', kind: 'bonk' },
  { from: 0.575, to: 0.685, side: 'right', kind: 'scrap' },
  { from: 0.7, to: 0.795, side: 'left', kind: 'build' },
  { from: 0.81, to: 0.905, side: 'right', kind: 'space' },
  { from: 0.925, to: 1.01, side: 'left', kind: 'profile' },
];

const smooth = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (p, a, b) => smooth(clamp01((p - a) / (b - a)));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

function labelTexture(lines, w = 512, h = 128, bg = '#4A2C3A', fg = '#FFF5F2') {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill();
  g.strokeStyle = '#FF8FB8'; g.lineWidth = 8; g.stroke();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => { g.font = `800 ${i ? 34 : 46}px "Baloo 2", system-ui, sans-serif`; g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * 44); });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Twilight sky dome for Cloudport: deep indigo overhead melting into pink at the horizon.
function twilightDome() {
  return new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vP;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
      void main(){
        vec3 d = normalize(vP);
        float t = clamp(d.y * 1.4 + 0.15, 0.0, 1.0);
        vec3 col = mix(vec3(1.0, 0.70, 0.80), vec3(0.42, 0.30, 0.66), smoothstep(0.0, 0.55, t));
        col = mix(col, vec3(0.13, 0.10, 0.30), smoothstep(0.5, 1.0, t));
        vec3 cell = floor(d * 160.0);
        float s = step(0.996, h(cell)) * smoothstep(0.35, 0.9, t);
        col += vec3(s);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
}

export default function OriginScene() {
  const { goTo, talk } = useApp();
  const section = useRef(null);
  const stage = useRef(null);
  const [p, setP] = useState(0);
  const fired = useRef({});

  useEffect(() => {
    const el = stage.current;
    const isSmall = window.innerWidth < 720;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x020208);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.03, 2500);

    // ---------- Act 1: space ----------
    const space = new THREE.Group();
    scene.add(space);
    const sun = new THREE.DirectionalLight(0xfff6ea, 3.2);
    sun.position.copy(SUN_DIR).multiplyScalar(100);
    space.add(sun, new THREE.AmbientLight(0x6a6a9a, 0.08));
    const flare = makeSun(SUN_DIR.clone().multiplyScalar(800));
    space.add(flare);
    const sky = makeSky(1000, isSmall ? 3000 : 6000);
    space.add(sky);
    const moon = makeMoon(MOON_R);
    moon.rotation.y = 1.4;
    space.add(moon);
    const earth = makeEarth(EARTH_R, SUN_DIR, isSmall ? 64 : 96);
    earth.group.position.copy(EARTH);
    space.add(earth.group);

    // The crumb of moonlight (baby Lumi before she was Lumi) with a glow and sparkle trail.
    const glowTex = glowTexture('rgba(255,240,250,1)', 'rgba(255,143,184,.55)');
    const crumb = new THREE.Group();
    const crumbCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), new THREE.MeshBasicMaterial({ color: 0xfff0f6, toneMapped: false }));
    const crumbGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    crumbGlow.scale.setScalar(0.9);
    crumb.add(crumbCore, crumbGlow);
    scene.add(crumb);
    const trail = [];
    for (let i = 0; i < 70; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      s.visible = false; scene.add(s); trail.push({ s, life: 0 });
    }
    let trailIdx = 0;

    const toEarth = C0.clone().sub(EARTH).normalize();
    const fallCurve = new THREE.CatmullRomCurve3([
      C0.clone(),
      C0.clone().add(v3(1.2, 2.2, 1.6)),
      v3(7, 1, -22),
      v3(22, -30, -88),
      EARTH.clone().add(toEarth.clone().multiplyScalar(EARTH_R + 2.5)),
    ], false, 'centripetal');

    // ---------- Act 2: Cloudport ----------
    const port = new THREE.Group();
    port.visible = false;
    scene.add(port);
    const dome = twilightDome();
    port.add(dome);
    port.add(new THREE.HemisphereLight(0xffeef6, 0x9c88d6, 0.85));
    const warm = new THREE.DirectionalLight(0xffe6d6, 1.25); warm.position.set(6, 10, 8); port.add(warm);
    const rimL = new THREE.DirectionalLight(0xc9b6ff, 0.6); rimL.position.set(-8, 4, -6); port.add(rimL);
    // The Moon, hanging in Cloudport's sky: the place Lumi wants to get back to.
    const skyMoon = makeMoon(7);
    skyMoon.position.set(-26, 34, -70);
    skyMoon.material = skyMoon.material.clone();
    skyMoon.material.emissive = new THREE.Color(0x3a3550);
    port.add(skyMoon);

    const WHITE = toon(0xfff3f8), CLOUDSH = toon(0xe9ddff), CLOUDPK = toon(0xffd9e8);
    const cloud = (x, y, z, s = 1, mat = WHITE) => {
      const g = new THREE.Group();
      [[0, 0, 0, 1], [0.9, -0.15, 0.2, 0.75], [-0.95, -0.2, 0.1, 0.8], [0.35, 0.45, -0.1, 0.7], [-0.4, 0.35, 0.2, 0.6]].forEach(([dx, dy, dz, r]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat); m.position.set(dx, dy, dz); g.add(m);
      });
      g.position.set(x, y, z); g.scale.setScalar(s); return g;
    };
    // The cloud island.
    const island = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, rr = i % 2 ? 3.6 : 2.2;
      const m = new THREE.Mesh(new THREE.SphereGeometry(1.6 + (i % 3) * 0.3, 20, 14), [WHITE, CLOUDSH, CLOUDPK][i % 3]);
      m.position.set(Math.cos(a) * rr, -1.25, Math.sin(a) * rr); m.scale.y = 0.55; island.add(m);
    }
    const top = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.0, 0.6, 40), toon(0xfbeaf3)); top.position.y = -0.3; island.add(top);
    // Launch pad where the first sky-car gets built, with landing lights.
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.06, 40), toon(0xffe38a)); pad.position.set(CAR_AT.x, 0.03, CAR_AT.z); island.add(pad);
    const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.04, 8, 40), new THREE.MeshBasicMaterial({ color: 0xc93d78 })); padRing.rotation.x = Math.PI / 2; padRing.position.set(CAR_AT.x, 0.07, CAR_AT.z); island.add(padRing);
    const padLights = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
      l.position.set(CAR_AT.x + Math.cos(a) * 1.18, 0.1, CAR_AT.z + Math.sin(a) * 1.18); island.add(l); padLights.push(l);
    }
    // String lights from the garage roof to a little pole.
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.2, 8), toon(0xe3d6ff)); pole.position.set(3.4, 1.1, -1.6); island.add(pole);
    const bulbColors = [0xff8fb8, 0xffe38a, 0x9fe8ff, 0xc9a8ff];
    const wireFrom = new THREE.Vector3(-1.2, 2.1, -0.6), wireTo = new THREE.Vector3(3.4, 2.2, -1.6);
    for (let i = 1; i < 12; i++) {
      const k = i / 12;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: bulbColors[i % 4] }));
      b.position.copy(wireFrom).lerp(wireTo, k); b.position.y -= Math.sin(k * Math.PI) * 0.35; island.add(b); padLights.push(b);
    }
    port.add(island);
    const floaters = [];
    [[-12, -3, -8, 2.2], [13, -4, -6, 2.6], [-8, -6, 8, 1.8], [10, -2, 10, 1.5], [0, -7, -18, 3.2], [-20, 2, -26, 3], [22, 4, -30, 3.4], [6, 7, -20, 1.4]].forEach(([x, y, z, s], i) => {
      const c = cloud(x, y, z, s, [WHITE, CLOUDSH, CLOUDPK][i % 3]); port.add(c); floaters.push({ c, ph: i });
    });

    // The space garage: pink walls, a roof, a glowing window and a sign.
    const garage = new THREE.Group();
    garage.add(part(new THREE.BoxGeometry(2.8, 1.9, 2.1), toon(0xffd3e4), { pos: [0, 0.95, 0], outline: 0.02 }));
    const roofGeo = new THREE.CylinderGeometry(1.4, 1.4, 3.0, 3);
    roofGeo.rotateX(-Math.PI / 2); roofGeo.rotateY(Math.PI / 2); roofGeo.scale(1, 0.55, 1);
    const roof = part(roofGeo, toon(0xc93d78), { pos: [0, 1.9 + 0.385, 0], outline: 0.02 });
    garage.add(roof);
    garage.add(part(new THREE.BoxGeometry(1.2, 1.25, 0.06), toon(0x4a2c3a), { pos: [0.3, 0.63, 1.06], outline: 0 }));
    for (let i = 0; i < 4; i++) garage.add(part(new THREE.BoxGeometry(1.2, 0.04, 0.07), toon(0x6b4a5a), { pos: [0.3, 0.25 + i * 0.3, 1.08], outline: 0 }));
    garage.add(new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), new THREE.MeshBasicMaterial({ color: 0xffe38a })).translateX(-0.85).translateY(0.8).translateZ(1.06));
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.52), new THREE.MeshBasicMaterial({ map: labelTexture(['CLOUDPORT', 'SPACE GARAGE']), transparent: true }));
    sign.position.set(0, 1.6, 1.09);
    garage.add(sign);
    garage.add(part(new THREE.BoxGeometry(2.9, 0.12, 2.2), toon(0xff8fb8), { pos: [0, 1.9, 0], outline: 0 }));
    garage.add(part(new THREE.BoxGeometry(2.9, 0.14, 2.2), toon(0xe3d6ff), { pos: [0, 0.07, 0], outline: 0 }));
    garage.position.set(-2.4, 0, -1.3); garage.rotation.y = 0.35;
    port.add(garage);

    // Scrapyard: tyres, springs, a teacup and a spoon.
    const scrap = new THREE.Group();
    const tyreMat = toon(0x5a4a5e);
    [[1.6, 0.12, -1.8, 0], [2.3, 0.12, -1.3, 0.4], [1.9, 0.36, -1.6, 0.2]].forEach(([x, y, z, r]) => scrap.add(part(new THREE.TorusGeometry(0.28, 0.12, 10, 24), tyreMat, { pos: [x, y, z], rot: [Math.PI / 2, r, 0] })));
    const cupPts = [v3(0, 0, 0), v3(0.22, 0, 0), v3(0.32, 0.12, 0), v3(0.36, 0.38, 0), v3(0.33, 0.38, 0), v3(0.29, 0.14, 0), v3(0.2, 0.05, 0)].map((q) => new THREE.Vector2(q.x, q.y));
    const cup = part(new THREE.LatheGeometry(cupPts, 28), toon(0xcfe6ff), { pos: [3.1, 0, -0.4], rot: [0.3, 0, 0.9] });
    scrap.add(cup);
    const helix = new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => v3(Math.cos(i * 0.8) * 0.12, i * 0.012, Math.sin(i * 0.8) * 0.12)));
    scrap.add(part(new THREE.TubeGeometry(helix, 120, 0.02, 6), toon(0xffe38a), { pos: [2.8, 0.05, -2.1], outline: 0 }));
    const spoon = new THREE.Group();
    spoon.add(part(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), toon(0xdcdce8), { pos: [0, 0.25, 0], outline: 0.1 }));
    spoon.add(part(new THREE.SphereGeometry(0.08, 12, 8), toon(0xdcdce8), { pos: [0, 0.52, 0], scale: [1, 1.3, 0.4], outline: 0.1 }));
    scrap.add(spoon);
    spoon.position.set(0.9, 0.05, 1.5); spoon.rotation.z = 1.4;
    port.add(scrap);

    // Baby Lumi (appears when the crumb lands) and her first sky-car (assembles piece by piece).
    const lumi = makeLumi();
    lumi.root.scale.setScalar(0.001);
    lumi.root.position.copy(LUMI_AT).setY(0.97 * 0.55);
    port.add(lumi.root);
    const car = makeSkyCar();
    car.root.position.copy(CAR_AT);
    car.root.rotation.y = -0.5;
    car.lumi.root.visible = false;
    port.add(car.root);
    const CAR_S = 0.78;
    car.root.scale.setScalar(CAR_S);
    const carRest = CAR_AT.clone().setY(0.46 * CAR_S);
    car.root.position.copy(carRest);
    // Each car part starts scattered around the scrapyard and flies into place.
    const assembly = Object.entries(car.parts).map(([name, obj], i) => {
      const a = i * 1.9;
      return { obj, home: obj.position.clone(), homeR: obj.rotation.clone(), from: v3(Math.cos(a) * 2.6, 0.2 + (i % 3) * 0.5 - 0.6, Math.sin(a) * 2.6 - 1), spin: v3(i * 0.7, i * 1.3, i * 0.4), name, at: i / Object.keys(car.parts).length };
    });
    car.flame.visible = false;
    port.traverse((o) => { if (o.material) o.material.toneMapped = false; });
    skyMoon.material.toneMapped = true;

    // Sparkle burst when the crumb lands.
    const burst = [];
    for (let i = 0; i < 36; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      s.visible = false; port.add(s);
      burst.push({ s, dir: new THREE.Vector3().randomDirection().setY(Math.abs(Math.random()) * 0.8 + 0.2).normalize(), sp: 1.5 + Math.random() * 2.5 });
    }

    // ---------- Camera keyframes ----------
    // Act 1 (progress 0 → CUT) follows the crumb; act 2 is fixed shots around Cloudport.
    const camA = (pr, cp) => {
      const startPos = C0.clone().add(v3(2.6, 1.0, 4.4)), startLook = C0.clone().add(v3(0, -0.5, 0));
      const follow = cp.clone().add(v3(-1.8, 2.0, 6.2)), followLook = cp.clone().lerp(EARTH, 0.25);
      const f = seg(pr, 0.15, 0.27);
      return [startPos.lerp(follow, f), startLook.lerp(followLook, f)];
    };
    const carFly = (pr) => carRest.clone().add(v3(-7, 9, -16).multiplyScalar(Math.pow(seg(pr, 0.86, 1.0), 1.6)));
    const KEYS = [
      [CUT, () => v3(5, 7, 11), () => v3(0, 2.2, 0)],
      [0.5, () => v3(2.4, 1.7, 5.4), () => v3(-0.2, 0.9, 0.8)],
      [0.6, () => v3(3.6, 2.4, 6.2), () => v3(1.0, 0.7, -0.4)],
      [0.72, () => v3(-0.4, 2.7, 7.6), () => v3(1.5, 0.6, 0.3)],
      [0.82, () => v3(5.6, 1.9, 5.4), () => v3(1.4, 0.8, 0.6)],
      [0.92, () => v3(6.5, 3.2, 8.5), (pr) => carFly(pr).add(v3(0, 1, 0))],
      [1.0, () => v3(5, 2.5, 11), (pr) => carFly(pr).lerp(v3(-26, 34, -70), 0.15)],
    ];
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 66 : 48;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let target = 0, cur = 0, visible = true, raf = 0, lastP = -1, first = true;
    const st = ScrollTrigger.create({ trigger: section.current, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { target = self.progress; } });
    target = cur = st.progress || 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
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
      const inSpace = pr < CUT;
      space.visible = inSpace;
      port.visible = !inSpace;
      renderer.toneMapping = inSpace ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;

      // Crumb position.
      if (inSpace) {
        const sneeze = seg(pr, 0.12, 0.16);
        const fall = seg(pr, 0.16, CUT);
        const cp = sneeze < 1 && fall === 0 ? C0.clone().lerp(fallCurve.getPointAt(0.03), sneeze) : fallCurve.getPointAt(Math.max(0.03, fall));
        crumb.position.copy(cp);
        crumb.visible = true;
        crumbGlow.scale.setScalar(0.7 + Math.sin(t * 6) * 0.08 + fall * 1.2);
        if (pr > 0.13 && Math.random() < 0.8) {
          const tr = trail[trailIdx++ % trail.length];
          tr.s.position.copy(cp).add(new THREE.Vector3().randomDirection().multiplyScalar(0.08)); tr.s.visible = true; tr.life = 1;
        }
        const [cpos, clook] = camA(pr, cp);
        camPos.copy(cpos); camLook.copy(clook);
        if (pr > 0.115 && pr < 0.16) camPos.add(v3(Math.sin(t * 50), Math.sin(t * 43), 0).multiplyScalar(0.06)); // the sneeze shake
        sky.position.copy(camera.position);
        flare.position.copy(camera.position).addScaledVector(SUN_DIR, 800);
        earth.body.rotation.y = t * 0.01; earth.clouds.rotation.y = t * 0.016;
      } else {
        // Act 2: crumb drops onto the island, Lumi pops out of the sparkle.
        const drop = seg(pr, CUT, 0.495);
        crumb.position.copy(LUMI_AT).setY(0.6 + (1 - drop) * 12);
        crumb.visible = drop < 1;
        const pop = clamp01((pr - 0.495) / 0.045);
        const elastic = pop === 0 ? 0 : pop === 1 ? 1 : Math.pow(2, -10 * pop) * Math.sin((pop * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
        const boarded = seg(pr, 0.8, 0.84);
        lumi.root.scale.setScalar(Math.max(0.001, 0.55 * elastic * (1 - boarded)));
        lumi.root.position.copy(LUMI_AT).setY(0.97 * 0.55 * Math.max(elastic, 0.001)).lerp(carRest.clone().setY(1), boarded);
        lumi.head.rotation.y = Math.sin(t * 0.8) * 0.25;
        lumi.arm.rotation.z = pr > 0.6 && pr < 0.8 ? Math.sin(t * 9) * 0.5 : Math.sin(t * 3) * 0.3;
        lumi.eyes.forEach((e) => { e.scale.y = Math.sin(t * 1.3) > 0.97 ? 0.1 : 1; });
        burst.forEach((b) => {
          const k = clamp01((pr - 0.495) / 0.06);
          b.s.visible = k > 0 && k < 1;
          b.s.position.copy(LUMI_AT).setY(0.6).addScaledVector(b.dir, k * b.sp);
          b.s.scale.setScalar(0.35 * (1 - k));
        });
        // Car assembly: each part flies in at its turn between 0.6 and 0.77.
        assembly.forEach((a) => {
          const k = seg(pr, 0.6 + a.at * 0.15, 0.62 + a.at * 0.15 + 0.03);
          a.obj.position.copy(a.from).lerp(a.home, k);
          a.obj.rotation.set(a.homeR.x + a.spin.x * (1 - k), a.homeR.y + a.spin.y * (1 - k), a.homeR.z + a.spin.z * (1 - k));
          a.obj.visible = pr > 0.58;
        });
        car.lumi.root.visible = boarded > 0.6;
        // Lift off towards the Moon.
        const fly = seg(pr, 0.86, 1.0);
        car.root.position.copy(carFly(pr));
        car.root.position.y += pr > 0.77 ? Math.sin(t * 2.4) * 0.05 : 0;
        car.root.rotation.set(-fly * 0.5, -0.5 + fly * 0.9, Math.sin(t * 2) * 0.04 * (pr > 0.77 ? 1 : 0));
        car.glows.forEach((g) => { g.material.opacity = pr > 0.77 ? 0.6 + Math.sin(t * 30) * 0.2 : 0; });
        car.flame.visible = fly > 0.02;
        car.flame.scale.set(1, 1, 0.6 + Math.sin(t * 40) * 0.1);
        floaters.forEach(({ c, ph }) => { c.position.y += Math.sin(t * 0.5 + ph) * 0.003; });
        padLights.forEach((l, li) => { l.scale.setScalar(0.8 + Math.max(0, Math.sin(t * 4 - li * 0.7)) * 0.6); });

        let k = 0;
        while (k < KEYS.length - 2 && pr > KEYS[k + 1][0]) k++;
        const [p0, pos0, look0] = KEYS[k], [p1, pos1, look1] = KEYS[k + 1];
        const f = smooth(clamp01((pr - p0) / (p1 - p0)));
        camPos.copy(pos0(pr)).lerp(pos1(pr), f);
        camLook.copy(look0(pr)).lerp(look1(pr), f);
        dome.position.copy(camera.position);
      }
      trail.forEach((tr) => {
        if (tr.life <= 0) return;
        tr.life -= dt * 1.2;
        tr.s.scale.setScalar(0.25 * Math.max(0, tr.life));
        tr.s.material.opacity = Math.max(0, tr.life);
        tr.s.visible = tr.life > 0 && inSpace;
      });

      const snap = first || Math.abs(pr - CUT) < 0.004;
      if (snap) { camera.position.copy(camPos); first = false; }
      else camera.position.lerp(camPos, 1 - Math.exp(-rawDt * 10));
      camera.lookAt(camLook);
      renderer.render(scene, camera);

      if (Math.abs(pr - lastP) > 0.002 || (pr === target && lastP !== pr)) { lastP = pr; setP(pr); }
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

  // Story beats: sounds and Lumi's lines.
  useEffect(() => {
    const once = (key, cond, fn) => { if (cond && !fired.current[key]) { fired.current[key] = true; fn(); } };
    once('sneeze', p > 0.12, () => { Sound.whoosh(); speak('Ah… ah… ACHOO!'); });
    once('bonk', p > 0.5, () => { Sound.pop(); Sound.giggle(); speak('Bonk! Hello, Cloudport!'); });
    once('built', p > 0.77, () => { Sound.arpeggio([67, 72, 76, 79], 0.08); speak('Ta-da! My very first sky-car!'); });
    once('profile', p > 0.93, () => { Sound.chime(84); talk("That's me! Now let me show you what I build."); });
  }, [p, talk]);

  const active = CHAPTERS.filter((c) => p >= c.from && p < c.to);
  const flash = Math.max(0, 1 - Math.abs(p - CUT) / 0.03);

  return (
    <section className="journey origin" ref={section}>
      <div className="journey__sticky">
        <div className="journey__stage" ref={stage} />
        <div className="journey__vignette" aria-hidden="true" />
        <div className="origin__flash" style={{ opacity: flash }} aria-hidden="true" />
        <div className="journey__hud" aria-live="off">
          <div className="journey__hudrow">
            <div><span className="label">Chapter 2 of 5</span><strong>Origin story</strong></div>
            <div><span className="label">{p < CUT ? 'Location' : 'Location'}</span><strong>{p < 0.16 ? 'The Moon' : p < CUT ? 'Falling…' : 'Cloudport'}</strong></div>
          </div>
          <div className="journey__bar"><span style={{ transform: `scaleX(${p})` }} /></div>
        </div>
        <AnimatePresence>
          {active.map((c) => (
            <motion.div key={c.kind} className={`journey__card journey__card--${c.side} journey__card--${c.kind}`}
              initial={{ opacity: 0, y: 40, scale: 0.96, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -30, filter: 'blur(6px)' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              {c.kind === 'title' && (<><span className="label">Chapter 2 · Where I come from</span><h2>The night the Moon sneezed</h2><p>Long ago, on a very sleepy night, the Moon got a tickle in its nose. Scroll to see what happened.</p><span className="journey__scroll">Scroll ↓</span></>)}
              {c.kind === 'sneeze' && (<h2 className="journey__big">AAA-CHOO!</h2>)}
              {c.kind === 'fall' && (<><span className="label">384,400 km of falling</span><h3>A crumb of moonlight</h3><p>A tiny sparkly crumb tumbled off the Moon and fell, and fell, and fell towards Earth. That crumb was me!</p></>)}
              {c.kind === 'bonk' && (<><span className="label">Bonk!</span><h3>Hello, Cloudport</h3><p>I bounced onto a cloud island called Cloudport, right into the scrapyard of an old space garage.</p></>)}
              {c.kind === 'scrap' && (<><span className="label">The scrapyard</span><h3>Broken sky-cars everywhere</h3><p>Tyres, springs, a teacup. Nobody was fixing anything. So I picked up a spoon. (It's a screwdriver.)</p></>)}
              {c.kind === 'build' && (<><span className="label">Bolt by bolt</span><h3>My very first sky-car</h3><p>I built it all by myself. Bunny says it flies mostly sideways. Bunny is wrong.</p></>)}
              {c.kind === 'space' && (<><span className="label">Sky-car… or space-car?</span><h3>The Moon is my home</h3><p>Sky-cars take sleepy creatures home. But my home is up there. So I'm teaching sky-cars to fly to space.</p></>)}
              {c.kind === 'profile' && (
                <>
                  <span className="label">Engineer profile · Cloudport ID 0003</span>
                  <h2>Lumi Moonbolt</h2>
                  <p className="origin__role">Junior Space-Car Engineer</p>
                  <dl className="origin__profile">
                    {PROFILE.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                  </dl>
                  <button className="btn" type="button" onClick={() => goTo('/garage', 'The Sky-Car Garage')}>Chapter 3: What I build →</button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
