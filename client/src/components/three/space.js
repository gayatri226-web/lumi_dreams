// Realistic space pieces for the Journey: a day/night Earth with clouds and atmosphere, a NASA-textured
// Moon with close-up landing terrain, distant planets, a painted Milky Way, a sun with lens flare,
// and speed streaks that stretch with velocity. Textures are real planetary maps (public-domain NASA
// imagery via the three.js and threex.planets example sets), compressed to WebP.
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import earthDayUrl from '../../assets/space/earth-day.webp';
import earthNightUrl from '../../assets/space/earth-night.webp';
import earthSpecUrl from '../../assets/space/earth-spec.webp';
import earthNormalUrl from '../../assets/space/earth-normal.webp';
import earthCloudsUrl from '../../assets/space/earth-clouds.webp';
import moonUrl from '../../assets/space/moon.webp';
import marsUrl from '../../assets/space/mars.webp';
import jupiterUrl from '../../assets/space/jupiter.webp';
import saturnUrl from '../../assets/space/saturn.webp';
import ringUrl from '../../assets/space/saturn-ring.png';

const loader = new THREE.TextureLoader();
function tex(url, srgb = true, aniso = 8) {
  const t = loader.load(url);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}

function canvasTex(size, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function glowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,220,180,.35)') {
  return canvasTex(128, (g, s) => {
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, inner); grd.addColorStop(0.25, mid); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  });
}

const EARTH_VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vT;
void main(){
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec3 t = normalize(vec3(-position.z, 0.0, position.x));
  vT = normalize(mat3(modelMatrix) * t);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const EARTH_FRAG = `
uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D specMap; uniform sampler2D normalMap;
uniform vec3 sunDir;
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vT;
void main(){
  vec3 N = normalize(vN);
  vec3 T = normalize(vT - N * dot(vT, N));
  vec3 B = cross(N, T);
  vec3 nm = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
  vec3 Nn = normalize(T * nm.x * 0.6 + B * nm.y * 0.6 + N * nm.z);
  vec3 V = normalize(cameraPosition - vP);
  float d = dot(Nn, sunDir);
  float dayMix = smoothstep(-0.12, 0.28, dot(N, sunDir));
  vec3 day = texture2D(dayMap, vUv).rgb;
  vec3 night = texture2D(nightMap, vUv).rgb;
  vec3 lit = day * (max(d, 0.0) * 1.25 + 0.035);
  vec3 col = mix(night * vec3(1.6, 1.25, 0.8), lit, dayMix);
  float spec = texture2D(specMap, vUv).r;
  vec3 R = reflect(-sunDir, Nn);
  col += vec3(1.0, 0.92, 0.8) * pow(max(dot(R, V), 0.0), 28.0) * spec * dayMix * 0.75;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += vec3(0.35, 0.6, 1.0) * fres * (dayMix * 0.9 + 0.08);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const ATMO_FRAG = `
uniform vec3 sunDir; varying vec3 vN; varying vec3 vP;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vP);
  float i = pow(smoothstep(0.0, 0.36, -dot(N, V)), 2.2);
  float sun = smoothstep(-0.35, 0.6, dot(N, sunDir));
  vec3 c = mix(vec3(0.25, 0.45, 1.0), vec3(0.55, 0.78, 1.0), sun);
  gl_FragColor = vec4(c * i * (0.25 + sun * 1.4), i * (0.2 + sun));
  #include <colorspace_fragment>
}`;
const ATMO_VERT = `varying vec3 vN; varying vec3 vP;
void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;

export function makeEarth(radius, sunDir, segs = 96) {
  const group = new THREE.Group();
  const uniforms = {
    dayMap: { value: tex(earthDayUrl) },
    nightMap: { value: tex(earthNightUrl) },
    specMap: { value: tex(earthSpecUrl, false) },
    normalMap: { value: tex(earthNormalUrl, false) },
    sunDir: { value: sunDir.clone() },
  };
  const body = new THREE.Mesh(new THREE.SphereGeometry(radius, segs, segs * 0.75), new THREE.ShaderMaterial({ uniforms, vertexShader: EARTH_VERT, fragmentShader: EARTH_FRAG }));
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.012, segs, segs * 0.75),
    new THREE.MeshLambertMaterial({ color: 0xffffff, alphaMap: tex(earthCloudsUrl, false), transparent: true, depthWrite: false, opacity: 0.95 }),
  );
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.07, 64, 48),
    new THREE.ShaderMaterial({ uniforms: { sunDir: uniforms.sunDir }, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  group.add(body, clouds, atmo);
  group.rotation.z = 0.41; // axial tilt
  return { group, body, clouds, atmo };
}

export function makeMoon(radius) {
  const map = tex(moonUrl);
  const bump = tex(moonUrl, false);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 160, 120),
    new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.6, roughness: 1, metalness: 0, color: new THREE.Color(1.35, 1.33, 1.3) }),
  );
  return mesh;
}

// A small rocky patch of moon ground around the landing site, so the close-up looks like real regolith.
function regolith() {
  const t = canvasTex(512, (g, s) => {
    g.fillStyle = '#8b8a88'; g.fillRect(0, 0, s, s);
    const img = g.getImageData(0, 0, s, s);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 34;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * s, y = Math.random() * s, r = 2 + Math.pow(Math.random(), 3) * 26;
      g.fillStyle = 'rgba(60,58,56,.35)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.strokeStyle = 'rgba(200,198,195,.35)'; g.lineWidth = Math.max(1, r * 0.2);
      g.beginPath(); g.arc(x - r * 0.12, y - r * 0.12, r, Math.PI * 0.85, Math.PI * 1.85); g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

export function makeLandingSite(center, normal, moonCenter, moonRadius, size = 9) {
  const group = new THREE.Group();
  const plane = new THREE.PlaneGeometry(size * 2, size * 2, 140, 140);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  const pos = plane.attributes.position;
  const v = new THREE.Vector3();
  const craters = Array.from({ length: 9 }, () => ({ x: (Math.random() - 0.5) * size * 1.6, y: (Math.random() - 0.5) * size * 1.6, r: 0.5 + Math.random() * 1.6 }));
  craters.push({ x: -2.4, y: 2.8, r: 1.9 });
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const dist = Math.hypot(x, y);
    const fall = Math.max(0, 1 - dist / size);
    let h = (Math.sin(x * 1.7) * Math.cos(y * 1.3) * 0.05 + Math.sin(x * 4.1 + y * 3.3) * 0.02) * fall;
    craters.forEach((c) => {
      const d = Math.hypot(x - c.x, y - c.y) / c.r;
      if (d < 1.4) h += (d < 1 ? -(1 - d * d) * 0.28 * c.r : Math.sin((d - 1) / 0.4 * Math.PI) * 0.06 * c.r) * fall;
    });
    v.set(x, y, 0).applyQuaternion(q).add(center);
    // Project onto the moon sphere, then lift by the height.
    const dir = v.clone().sub(moonCenter).normalize();
    v.copy(moonCenter).add(dir.multiplyScalar(moonRadius + 0.03 + h));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  plane.computeVertexNormals();
  const ground = new THREE.Mesh(plane, new THREE.MeshStandardMaterial({ map: regolith(), roughness: 1, metalness: 0, color: new THREE.Color(1.3, 1.29, 1.27) }));
  group.add(ground);
  // Scattered boulders.
  const rockMat = new THREE.MeshStandardMaterial({ color: 0xa8a5a2, roughness: 1, flatShading: true });
  for (let i = 0; i < 30; i++) {
    const r = 0.03 + Math.pow(Math.random(), 2.5) * 0.16;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
    const a = Math.random() * Math.PI * 2, d = 0.9 + Math.random() * (size * 0.45);
    v.set(Math.cos(a) * d, Math.sin(a) * d, 0).applyQuaternion(q).add(center);
    const dir = v.clone().sub(moonCenter).normalize();
    rock.position.copy(moonCenter).add(dir.multiplyScalar(moonRadius + r * 0.15));
    rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    rock.scale.set(1, 0.6 + Math.random() * 0.4, 1);
    group.add(rock);
  }
  return group;
}

export function makePlanet(url, radius, segs = 64) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, segs, segs * 0.75), new THREE.MeshStandardMaterial({ map: tex(url, true, 4), roughness: 1, metalness: 0 }));
}
export const makeMars = (r) => makePlanet(marsUrl, r);
export const makeJupiter = (r) => makePlanet(jupiterUrl, r);
export function makeSaturn(r) {
  const g = new THREE.Group();
  g.add(makePlanet(saturnUrl, r));
  const ringGeo = new THREE.RingGeometry(r * 1.25, r * 2.3, 128, 1);
  const p = ringGeo.attributes.position, uv = ringGeo.attributes.uv, tmp = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { tmp.fromBufferAttribute(p, i); uv.setXY(i, (tmp.length() - r * 1.25) / (r * 1.05), 0.5); }
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ map: tex(ringUrl, true, 4), side: THREE.DoubleSide, transparent: true, roughness: 1, depthWrite: false }));
  ring.rotation.x = Math.PI / 2.3;
  g.add(ring);
  g.rotation.z = 0.35;
  return g;
}

// Painted Milky Way on a huge inside-out sphere, plus three layers of stars.
const SKY_FRAG = `
varying vec3 vDir;
float hash(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
float fbm(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 6; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec3 d = normalize(vDir);
  vec3 axis = normalize(vec3(0.35, 0.85, 0.4));
  float band = 1.0 - abs(dot(d, axis));
  band = pow(band, 7.0);
  float n = fbm(d * 3.2);
  float dust = fbm(d * 9.0 + 4.0);
  vec3 col = vec3(0.0006, 0.0005, 0.0018);
  vec3 mw = mix(vec3(0.30, 0.20, 0.40), vec3(0.85, 0.70, 0.58), n);
  col += mw * band * pow(n, 1.6) * 0.16;
  col *= 1.0 - smoothstep(0.42, 0.75, dust) * band * 0.9;
  col += vec3(0.5, 0.15, 0.4) * pow(fbm(d * 2.0 + 9.0), 4.0) * 0.03;
  col += vec3(0.1, 0.2, 0.5) * pow(fbm(d * 2.4 + 2.0), 4.0) * 0.025;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function makeSky(radius = 900, count = 6000) {
  const group = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: SKY_FRAG,
  }));
  group.add(sky);
  const dot = glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,.25)');
  [[count, 1.6, 0.9], [Math.round(count / 6), 3.2, 1]].forEach(([n, size, op]) => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const axis = new THREE.Vector3(0.35, 0.85, 0.4).normalize();
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      let v = new THREE.Vector3().randomDirection();
      // Bunch half the stars into the Milky Way band.
      if (i % 2 === 0) { v.sub(axis.clone().multiplyScalar(v.dot(axis) * 0.85)).normalize(); }
      v.multiplyScalar(radius * 0.9);
      pos.set([v.x, v.y, v.z], i * 3);
      const tint = Math.random();
      c.setHSL(tint < 0.3 ? 0.6 : tint < 0.6 ? 0.08 : 0.95, tint < 0.6 ? 0.5 : 0.25, 0.75 + Math.random() * 0.25);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    group.add(new THREE.Points(g, new THREE.PointsMaterial({ size, map: dot, vertexColors: true, transparent: true, opacity: op, depthWrite: false, sizeAttenuation: false, blending: THREE.AdditiveBlending })));
  });
  return group;
}

export function makeSun(position) {
  const light = new THREE.PointLight(0xffffff, 0, 0);
  light.position.copy(position);
  const flare = new Lensflare();
  const core = glowTexture('rgba(255,255,250,1)', 'rgba(255,230,190,.5)');
  const ring = canvasTex(128, (g, s) => {
    const grd = g.createRadialGradient(s / 2, s / 2, s * 0.32, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.6, 'rgba(255,170,210,.35)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  });
  const hex = glowTexture('rgba(255,200,230,.5)', 'rgba(255,200,230,.12)');
  flare.addElement(new LensflareElement(core, 520, 0, new THREE.Color(1, 0.96, 0.9)));
  flare.addElement(new LensflareElement(ring, 160, 0.3, new THREE.Color(1, 0.8, 0.9)));
  flare.addElement(new LensflareElement(hex, 60, 0.55));
  flare.addElement(new LensflareElement(hex, 90, 0.75));
  flare.addElement(new LensflareElement(ring, 120, 1.0));
  light.add(flare);
  return light;
}

// Speed streaks: particles around the camera drawn as short lines along the travel direction.
export function makeStreaks(count = 500, box = 40) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 6);
  const col = new Float32Array(count * 6);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    seeds.set([(Math.random() - 0.5) * box, (Math.random() - 0.5) * box, (Math.random() - 0.5) * box], i * 3);
    const b = 0.5 + Math.random() * 0.5;
    col.set([b, b * 0.9, b], i * 6); col.set([0, 0, 0], i * 6 + 3);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  lines.frustumCulled = false;
  const tmp = new THREE.Vector3();
  // Seeds live in a box that scrolls past the camera opposite to the motion.
  const update = (camPos, vel, dt) => {
    const speed = vel.length();
    const half = box / 2;
    for (let i = 0; i < count; i++) {
      let x = seeds[i * 3] - vel.x * dt, y = seeds[i * 3 + 1] - vel.y * dt, z = seeds[i * 3 + 2] - vel.z * dt;
      x = ((x + half) % box + box) % box - half;
      y = ((y + half) % box + box) % box - half;
      z = ((z + half) % box + box) % box - half;
      seeds[i * 3] = x; seeds[i * 3 + 1] = y; seeds[i * 3 + 2] = z;
      tmp.set(x, y, z).add(camPos);
      pos[i * 6] = tmp.x; pos[i * 6 + 1] = tmp.y; pos[i * 6 + 2] = tmp.z;
      const k = Math.min(0.06, 0.004 + speed * 0.001);
      pos[i * 6 + 3] = tmp.x + vel.x * k; pos[i * 6 + 4] = tmp.y + vel.y * k; pos[i * 6 + 5] = tmp.z + vel.z * k;
    }
    geo.attributes.position.needsUpdate = true;
    lines.material.opacity = Math.min(0.5, speed * 0.02);
  };
  return { lines, update };
}
