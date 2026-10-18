import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { useApp } from './context/AppContext.jsx';
import { Sound } from './lib/sound.js';
import { ARRIVALS } from './data/content.js';
import StarSky from './components/fx/StarSky.jsx';
import Preloader from './components/layout/Preloader.jsx';
import CrawlTransition from './components/layout/CrawlTransition.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import { RainbowRocket, SparkleTrail, Toast } from './components/layout/Effects.jsx';
import Home from './pages/Home.jsx';

// Inner pages load on demand, which keeps the first load small and fast.
const Garage = lazy(() => import('./pages/Garage.jsx'));
const Journey = lazy(() => import('./pages/Journey.jsx'));
const Dreams = lazy(() => import('./pages/Dreams.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const RoomBackground = lazy(() => import('./components/three/RoomBackground.jsx'));

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TITLES = { '/': 'Lumi · Junior Sky-Car Engineer', '/garage': 'The Garage · Lumi', '/journey': 'My journey · Lumi', '/dreams': 'Dreams · Lumi' };

export default function App() {
  const { visits, talk } = useApp();
  const [entered, setEntered] = useState(false);
  const { pathname, hash } = useLocation();
  const greeted = useRef(new Set());

  // Lock scrolling while the preloader is up.
  useEffect(() => { document.body.classList.toggle('loading', !entered); }, [entered]);

  // Buttery inertial scrolling (Lenis) that drives every ScrollTrigger from GSAP's ticker.
  const lenisRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.2, smoothWheel: true });
    lenisRef.current = lenis;
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.__lenis = null; };
  }, []);
  useEffect(() => { const l = lenisRef.current; if (!l) return; if (entered) l.start(); else l.stop(); }, [entered]);

  // A soft click on every button and link that doesn't make its own sound.
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('button, a');
      if (el && !el.hasAttribute('data-nosfx')) Sound.click();
    };
    document.addEventListener('click', onClick);
    console.log('%c🍼🚗 hi from Lumi! psst: my parked car on the home page has a very honkable horn.', 'color:#C93D78;font-weight:bold;font-size:13px');
    return () => document.removeEventListener('click', onClick);
  }, []);

  // On every page change: title, scroll position, fresh ScrollTrigger measurements, and a hello from Lumi.
  useEffect(() => {
    document.title = TITLES[pathname] || 'Lost in space · Lumi';
    if (!hash) { window.scrollTo(0, 0); window.__lenis?.scrollTo(0, { immediate: true, force: true }); }
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    if (entered && ARRIVALS[pathname] && !greeted.current.has(pathname)) {
      greeted.current.add(pathname);
      setTimeout(() => talk(ARRIVALS[pathname]), 900);
    }
    return () => clearTimeout(t);
  }, [pathname, hash, entered, talk]);

  // Scroll reveals: section headings and cards rise in with a soft 3D tilt as they enter the screen.
  useEffect(() => {
    if (!entered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setTimeout(() => {
      const els = gsap.utils.toArray('main .section__head, main .postcard, main .lvl-card, main .crew__line, main .passport, main .talk__grid > *, main .map-legend, main .gb, main .dreamsys > *')
        .filter((el) => !el.dataset.revealed);
      els.forEach((el) => { el.dataset.revealed = '1'; });
      gsap.set(els, { opacity: 0, y: 70, rotateX: -16, transformPerspective: 1000, transformOrigin: '50% 100%' });
      ScrollTrigger.batch(els, {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: 'expo.out', stagger: 0.12, overwrite: true, clearProps: 'transform,transformPerspective' }),
      });
      ScrollTrigger.refresh();
    }, 400);
    return () => clearTimeout(t);
  }, [pathname, entered]);

  // Once the visitor is in, quietly fetch the other pages so the crawl transition never waits.
  useEffect(() => {
    if (!entered) return undefined;
    const t = setTimeout(() => { import('./pages/Garage.jsx'); import('./pages/Journey.jsx'); import('./pages/Dreams.jsx'); import('./components/three/JourneyScene.jsx'); }, 2500);
    return () => clearTimeout(t);
  }, [entered]);

  const enter = () => {
    window.scrollTo(0, 0);
    setEntered(true);
    talk(visits > 1 ? 'Welcome back! I missed you. Click me for a fun fact!' : "Hi! Click me, I don't bite. I don't even have teeth yet.", { voice: false });
  };

  return (
    <>
      {entered && pathname !== '/journey' && <Suspense fallback={null}><RoomBackground /></Suspense>}
      <StarSky id="spaceSky" className="starsky space-sky" density={0.9} />
      <CrawlTransition />
      {!entered && <Preloader onEnter={enter} />}
      <Header />
      <main>
        <Suspense fallback={<div className="page-loading">Crawling over…</div>}>
        <Routes>
          <Route path="/" element={<Home entered={entered} />} />
          <Route path="/garage" element={<Garage />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/dreams" element={<Dreams />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toast />
      <RainbowRocket />
      <SparkleTrail />
      <div className="tuck-dim" aria-hidden="true" />
    </>
  );
}
