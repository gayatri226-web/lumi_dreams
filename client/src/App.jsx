import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
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
import Garage from './pages/Garage.jsx';
import Journey from './pages/Journey.jsx';
import Dreams from './pages/Dreams.jsx';
import NotFound from './pages/NotFound.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TITLES = { '/': 'Lumi · Junior Sky-Car Engineer', '/garage': 'The Garage · Lumi', '/journey': 'My journey · Lumi', '/dreams': 'Dreams · Lumi' };

export default function App() {
  const { visits, talk } = useApp();
  const [entered, setEntered] = useState(false);
  const { pathname, hash } = useLocation();
  const greeted = useRef(new Set());

  // Lock scrolling while the preloader is up.
  useEffect(() => { document.body.classList.toggle('loading', !entered); }, [entered]);

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
    if (!hash) window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    if (entered && ARRIVALS[pathname] && !greeted.current.has(pathname)) {
      greeted.current.add(pathname);
      setTimeout(() => talk(ARRIVALS[pathname]), 900);
    }
    return () => clearTimeout(t);
  }, [pathname, hash, entered, talk]);

  const enter = () => {
    window.scrollTo(0, 0);
    setEntered(true);
    talk(visits > 1 ? 'Welcome back! I missed you. Click me for a fun fact!' : "Hi! Click me, I don't bite. I don't even have teeth yet.", { voice: false });
  };

  return (
    <>
      <StarSky id="spaceSky" className="starsky space-sky" density={0.9} />
      <CrawlTransition />
      {!entered && <Preloader onEnter={enter} />}
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home entered={entered} />} />
          <Route path="/garage" element={<Garage />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/dreams" element={<Dreams />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
      <RainbowRocket />
      <SparkleTrail />
      <div className="tuck-dim" aria-hidden="true" />
    </>
  );
}
