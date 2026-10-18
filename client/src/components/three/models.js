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

function part(geo, mat, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], outline = 0.045 } = {}) {
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
