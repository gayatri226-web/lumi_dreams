import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { makeLumi } from './models.js';

// A 3D, cel-shaded Lumi you can drag to spin. Lumi's head follows your pointer, the arm waves,
// and the parent can make Lumi bounce or "talk" (mouth moves) through the ref.
const Lumi3D = forwardRef(function Lumi3D({ onPoke, className }, ref) {
  const wrap = useRef(null);
  const api = useRef({ bounce: () => {}, talk: () => {} });
  const poke = useRef(onPoke);
  poke.current = onPoke;
  useImperativeHandle(ref, () => ({ bounce: (...a) => api.current.bounce(...a), talk: (...a) => api.current.talk(...a) }));

  useEffect(() => {
    const el = wrap.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.2, 9);
    scene.add(new THREE.HemisphereLight(0xfff5f2, 0xffb3cf, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(3, 4, 5);
    scene.add(sun);

    const lumi = makeLumi();
    scene.add(lumi.root);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x4a2c3a, transparent: true, opacity: 0.12 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.95; shadow.scale.set(1.2, 0.5, 1);
    scene.add(shadow);

    const state = { rotY: -0.35, targetY: -0.35, dragging: false, lastX: 0, moved: 0, look: new THREE.Vector2(), bounceT: 0, talkUntil: 0, visible: true };
    api.current.bounce = () => { state.bounceT = 1; };
    api.current.talk = (ms = 1800) => { state.talkUntil = performance.now() + ms; };

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const canvas = renderer.domElement;
    canvas.style.touchAction = 'pan-y';
    const down = (e) => { state.dragging = true; state.lastX = e.clientX; state.moved = 0; canvas.setPointerCapture?.(e.pointerId); };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      state.look.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
      if (!state.dragging) return;
      const dx = e.clientX - state.lastX;
      state.lastX = e.clientX;
      state.moved += Math.abs(dx);
      state.targetY += dx * 0.012;
    };
    const up = () => {
      if (state.dragging && state.moved < 6) { state.bounceT = 1; poke.current?.(); }
      state.dragging = false;
    };
    const winMove = (e) => {
      const r = el.getBoundingClientRect();
      state.look.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)), Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointermove', winMove, { passive: true });
    const io = new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; });
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!state.visible || document.hidden) return;
      const t = clock.getElapsedTime();
      if (!state.dragging) state.targetY += (Math.sin(t * 0.5) * 0.35 - 0.2 - state.targetY) * 0.01;
      state.rotY += (state.targetY - state.rotY) * 0.12;
      lumi.root.rotation.y = state.rotY;
      lumi.head.rotation.y += (state.look.x * 0.5 - lumi.head.rotation.y) * 0.1;
      lumi.head.rotation.x += (state.look.y * 0.3 - lumi.head.rotation.x) * 0.1;
      lumi.arm.rotation.z = Math.sin(t * 6) * 0.35;
      const bob = Math.sin(t * 2) * 0.06;
      let jump = 0;
      if (state.bounceT > 0) { jump = Math.sin((1 - state.bounceT) * Math.PI) * 0.6; state.bounceT = Math.max(0, state.bounceT - 0.035); }
      lumi.root.position.y = bob + jump;
      lumi.root.scale.set(1 + jump * 0.06, 1 - jump * 0.04, 1 + jump * 0.06);
      shadow.scale.set(1.2 - jump * 0.5, 0.5 - jump * 0.2, 1);
      const talking = performance.now() < state.talkUntil;
      lumi.mouth.scale.y = talking ? 0.6 + Math.abs(Math.sin(t * 18)) * 0.9 : 1;
      const blink = (t % 4) < 0.12;
      lumi.eyes.forEach((e) => { e.scale.y = blink ? 0.12 : 1; });
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointermove', winMove);
      renderer.dispose();
      scene.traverse((o) => { o.geometry?.dispose?.(); });
      canvas.remove();
    };
  }, []);

  return <div ref={wrap} className={className} role="img" aria-label="A 3D Lumi. Drag to spin Lumi around, tap to make Lumi jump." />;
});

export default Lumi3D;
