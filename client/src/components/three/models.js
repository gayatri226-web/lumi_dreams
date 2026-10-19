// 3D versions of Lumi and the rocket, built from simple shapes with cel shading and ink outlines
// (an inverted-hull outline: a slightly larger back-facing copy of each mesh drawn in ink).
import * as THREE from 'three';
import { lumiFaceTexture, toonRamp } from './textures.js';

const INK = 0x4a2c3a;
let ramp = null;
const getRamp = () => (ramp ||= toonRamp());

export function toon(color, extra = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: getRamp(), ...extra });
}
const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

export function part(geo, mat, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], outline = 0.045 } = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mat);
  g.add(m);
  if (outline) {
    const o = new THREE.Mesh(geo, inkMat);
    o.scale.setScalar(1 + outline);
    g.add(o);
  }
  g.position.set(...pos);
  g.rotation.set(...rot);
  g.scale.set(...scale);
  return g;
}

function starShape(outer = 0.22, inner = 0.1) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i) s.lineTo(x, y); else s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

export function makeLumi() {
  const PINK = toon(0xff8fb8), FACE = toon(0xfff6e8), PALE = toon(0xffd3e4), DARK = toon(0x4a2c3a), YEL = toon(0xffe38a);
  const WHITE = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const CHEEK = new THREE.MeshBasicMaterial({ color: 0xff8fb8, transparent: true, opacity: 0.75 });
  const ROSE = new THREE.MeshBasicMaterial({ color: 0xc93d78, side: THREE.DoubleSide });
  const root = new THREE.Group();

  // Head
  const head = new THREE.Group();
  head.position.y = 0.62;
  head.add(part(new THREE.SphereGeometry(1.18, 48, 32), PINK, { pos: [0, 0, -0.1], outline: 0.035 }));
  head.add(part(new THREE.SphereGeometry(1, 48, 32), FACE, { pos: [0, -0.06, 0.2], scale: [1, 0.94, 0.9], outline: 0 }));
  [-1, 1].forEach((sx) => {
    head.add(part(new THREE.SphereGeometry(0.34, 24, 16), PINK, { pos: [sx * 0.84, 0.86, -0.18] }));
    head.add(part(new THREE.SphereGeometry(0.18, 20, 12), PALE, { pos: [sx * 0.86, 0.88, 0.08], scale: [1, 1, 0.5], outline: 0 }));
  });
  head.add(part(new THREE.TorusGeometry(0.15, 0.055, 10, 24, Math.PI * 1.35), YEL, { pos: [0.02, 1.2, 0.18], rot: [0.3, 0, 2.2] }));
  head.add(part(new THREE.TorusGeometry(0.09, 0.025, 8, 16, Math.PI * 1.4), DARK, { pos: [0.02, 0.84, 0.93], rot: [-0.5, 0, 1], outline: 0 }));
  const eyes = [];
  [-1, 1].forEach((sx) => {
    const eye = new THREE.Group();
    eye.position.set(sx * 0.36, 0.0, 1.0);
    eye.add(part(new THREE.SphereGeometry(0.16, 24, 16), DARK, { scale: [0.82, 1, 0.45], outline: 0 }));
    eye.add(part(new THREE.SphereGeometry(0.055, 12, 8), WHITE, { pos: [0.05, 0.07, 0.06], outline: 0 }));
    eye.add(part(new THREE.SphereGeometry(0.024, 8, 6), WHITE, { pos: [-0.04, -0.06, 0.06], outline: 0 }));
    head.add(eye);
    eyes.push(eye);
    head.add(part(new THREE.SphereGeometry(0.15, 16, 12), CHEEK, { pos: [sx * 0.62, -0.26, 0.86], scale: [1, 0.55, 0.3], outline: 0 }));
  });
  head.add(part(new THREE.SphereGeometry(0.035, 10, 8), toon(0xe7a0b5), { pos: [0, -0.16, 1.06], outline: 0 }));
  const mouth = new THREE.Group();
  mouth.position.set(0, -0.31, 1.04);
  const m1 = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24, Math.PI, Math.PI), ROSE);
  mouth.add(m1);
  const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff8fb8 }));
  tongue.position.set(0, -0.05, 0.002);
  mouth.add(tongue);
  mouth.rotation.x = -0.25;
  head.add(mouth);
  root.add(head);

  // Body
  const body = new THREE.Group();
  body.position.y = -0.95;
  body.add(part(new THREE.CapsuleGeometry(0.56, 0.42, 8, 24), PINK));
  body.add(part(new THREE.ExtrudeGeometry(starShape(), { depth: 0.06, bevelEnabled: false }), YEL, { pos: [0, -0.05, 0.53], outline: 0.08 }));
  body.add(part(new THREE.TorusGeometry(0.4, 0.06, 10, 32), PALE, { pos: [0, 0.48, 0], rot: [Math.PI / 2, 0, 0], outline: 0 }));
  body.add(part(new THREE.CapsuleGeometry(0.17, 0.38, 6, 12), PINK, { pos: [-0.66, 0.02, 0], rot: [0, 0, -0.55] }));
  body.add(part(new THREE.SphereGeometry(0.17, 16, 12), FACE, { pos: [-0.86, -0.26, 0.04] }));
  const arm = new THREE.Group();
  arm.position.set(0.5, 0.32, 0);
  arm.add(part(new THREE.CapsuleGeometry(0.17, 0.38, 6, 12), PINK, { pos: [0.22, 0.24, 0], rot: [0, 0, -2.4 + Math.PI] }));
  arm.add(part(new THREE.SphereGeometry(0.18, 16, 12), FACE, { pos: [0.4, 0.52, 0.04] }));
  body.add(arm);
  [-1, 1].forEach((sx) => body.add(part(new THREE.SphereGeometry(0.26, 20, 14), PINK, { pos: [sx * 0.3, -0.66, 0.12], scale: [1, 0.6, 1.3] })));
  root.add(body);

  return { root, head, eyes, mouth, arm, body };
}

export function makeRocket() {
  const PINK = toon(0xff8fb8), DEEP = toon(0xc93d78), LILAC = toon(0xe3d6ff), YEL = toon(0xffe38a);
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.42, 0.48, 1.5, 32), PINK, { outline: 0.05 }));
  g.add(part(new THREE.ConeGeometry(0.42, 0.75, 32), DEEP, { pos: [0, 1.12, 0] }));
  g.add(part(new THREE.SphereGeometry(0.1, 12, 8), YEL, { pos: [0, 1.5, 0] }));
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.26, 32), new THREE.MeshBasicMaterial({ map: lumiFaceTexture() }));
  face.position.set(0, 0.2, 0.46);
  g.add(face);
  g.add(part(new THREE.TorusGeometry(0.27, 0.05, 10, 32), YEL, { pos: [0, 0.2, 0.45], outline: 0 }));
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Shape();
    fin.moveTo(0, 0); fin.lineTo(0.45, -0.35); fin.lineTo(0.45, -0.7); fin.lineTo(0, -0.45); fin.closePath();
    const f = part(new THREE.ExtrudeGeometry(fin, { depth: 0.07, bevelEnabled: false }), LILAC, { outline: 0.06 });
    const holder = new THREE.Group();
    f.position.set(0.4, -0.25, -0.035);
    holder.add(f);
    holder.rotation.y = (i / 3) * Math.PI * 2 + Math.PI / 2;
    g.add(holder);
  }
  g.add(part(new THREE.CylinderGeometry(0.3, 0.36, 0.2, 24), LILAC, { pos: [0, -0.84, 0] }));
  const flame = new THREE.Group();
  flame.position.y = -0.95;
  const outer = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.1, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  outer.rotation.x = Math.PI; outer.position.y = -0.55;
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.7, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  inner.rotation.x = Math.PI; inner.position.y = -0.35;
  flame.add(outer, inner);
  g.add(flame);
  return { root: g, flame };
}

// Lumi's sky-car (the Moonbolt-1): a pink hover car with a glass bubble canopy, Lumi inside,
// little wings, four glowing hover jets and a rear starlight thruster. Forward is +z.
export function makeSkyCar({ withLumi = true } = {}) {
  const PINK = toon(0xff8fb8), DEEP = toon(0xc93d78), LILAC = toon(0xe3d6ff), YEL = toon(0xffe38a), WHITE = toon(0xfff6e8);
  const root = new THREE.Group();
  const parts = {}; // named pieces so scenes can assemble the car piece by piece

  const body = part(new THREE.CapsuleGeometry(0.55, 1.15, 10, 28), PINK, { rot: [Math.PI / 2, 0, 0], scale: [1.18, 1, 0.62], outline: 0.04 });
  parts.body = body;
  const skirt = part(new THREE.TorusGeometry(0.62, 0.11, 12, 40), DEEP, { pos: [0, -0.12, 0], rot: [Math.PI / 2, 0, 0], scale: [1.05, 1.7, 1], outline: 0 });
  parts.skirt = skirt;
  const stripe = part(new THREE.BoxGeometry(0.12, 0.05, 1.6), YEL, { pos: [0, 0.33, -0.15], outline: 0 });
  parts.stripe = stripe;

  // Canopy with Lumi inside.
  const canopy = new THREE.Group();
  canopy.position.set(0, 0.22, 0.12);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0, depthWrite: false }));
  const rim = part(new THREE.TorusGeometry(0.56, 0.05, 10, 40), YEL, { rot: [Math.PI / 2, 0, 0], outline: 0 });
  const shine = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 20, Math.PI * 0.5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
  shine.position.set(-0.1, 0.25, 0.25); shine.rotation.set(-0.4, 0.5, 1.9);
  canopy.add(rim, glass, shine);
  let lumi = null;
  if (withLumi) {
    lumi = makeLumi();
    lumi.root.scale.setScalar(0.27);
    lumi.root.position.set(0, 0.1, 0.02);
    lumi.body.visible = false;
    canopy.add(lumi.root);
  }
  parts.canopy = canopy;

  // Wings and tail fin.
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.55, 0.05, 0.75, -0.22); wingShape.lineTo(0.62, -0.32); wingShape.quadraticCurveTo(0.3, -0.22, 0, -0.3); wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  const wings = new THREE.Group();
  [-1, 1].forEach((sx) => {
    const w = part(wingGeo, LILAC, { pos: [sx * 0.6, 0.02, -0.1], rot: [Math.PI / 2, 0, sx > 0 ? 0 : Math.PI], scale: [1, 1, 1], outline: 0.06 });
    w.rotation.y = sx * 0.18;
    wings.add(w);
  });
  parts.wings = wings;
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0); finShape.lineTo(0.12, 0.5); finShape.lineTo(0.38, 0.52); finShape.lineTo(0.42, 0); finShape.closePath();
  const fin = part(new THREE.ExtrudeGeometry(finShape, { depth: 0.06, bevelEnabled: false }), DEEP, { pos: [0.03, 0.18, -0.95], rot: [0, -Math.PI / 2, 0], outline: 0.06 });
  parts.fin = fin;

  // Headlights, antenna.
  const lights = new THREE.Group();
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0 });
  [-1, 1].forEach((sx) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), lampMat); l.position.set(sx * 0.32, 0.02, 1.05); lights.add(l); });
  const antenna = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6), new THREE.MeshBasicMaterial({ color: 0x4a2c3a }));
  stick.position.y = 0.21;
  const ball = part(new THREE.SphereGeometry(0.07, 12, 8), YEL, { pos: [0, 0.44, 0], outline: 0.08 });
  antenna.add(stick, ball);
  antenna.position.set(0.2, 0.28, -0.62); antenna.rotation.z = -0.25;
  parts.lights = lights; parts.antenna = antenna;

  // Hover jets underneath, and the rear thruster.
  const jets = new THREE.Group();
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const glows = [];
  [[-0.45, 0.6], [0.45, 0.6], [-0.45, -0.6], [0.45, -0.6]].forEach(([x, z]) => {
    const pod = part(new THREE.CylinderGeometry(0.13, 0.16, 0.16, 18), WHITE, { pos: [x, -0.36, z], outline: 0.08 });
    const g = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 16, 1, true), glowMat.clone());
    g.position.set(x, -0.62, z); g.rotation.x = Math.PI;
    jets.add(pod, g); glows.push(g);
  });
  parts.jets = jets;
  const thruster = part(new THREE.CylinderGeometry(0.2, 0.26, 0.28, 20), LILAC, { pos: [0, 0, -1.02], rot: [Math.PI / 2, 0, 0], outline: 0.06 });
  parts.thruster = thruster;
  const flame = new THREE.Group();
  flame.position.set(0, 0, -1.16);
  const outer = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.9, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  outer.rotation.x = -Math.PI / 2; outer.position.z = -0.45;
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.55, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  inner.rotation.x = -Math.PI / 2; inner.position.z = -0.28;
  flame.add(outer, inner);

  Object.values(parts).forEach((p) => root.add(p));
  root.add(flame);
  return { root, flame, glows, parts, lumi };
}
