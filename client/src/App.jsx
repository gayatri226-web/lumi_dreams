import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useApp } from './context/AppContext.jsx';
import { Sound } from './lib/sound.js';
import { prefersReducedMotion } from './lib/util.js';
import SvgDefs from './components/art/SvgDefs.jsx';
import StarSky from './components/StarSky.jsx';
import Preloader from './components/Preloader.jsx';
import CrawlTransition from './components/CrawlTransition.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Workshop from './components/Workshop.jsx';
import Levels from './components/Levels.jsx';
import Story from './components/Story.jsx';
import DreamOrbits from './components/DreamOrbits.jsx';
import Guestbook from './components/Guestbook.jsx';
import Footer from './components/Footer.jsx';
import { RainbowRocket, SparkleTrail, Toast } from './components/Effects.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function App() {
  const { visits, setSay } = useApp();
  const [entered, setEntered] = useState(false);
  const main = useRef(null);

  // Lock scrolling while the preloader is up.
  useEffect(() => {
    document.body.classList.toggle('loading', !entered);
  }, [entered]);

  // A soft click on every button and link that doesn't make its own sound.
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('button, a');
      if (el && !el.hasAttribute('data-nosfx')) Sound.click();
    };
    document.addEventListener('click', onClick);
    console.log('%c🍼🚗 hi from Anew! psst: my parked car has a very honkable horn.', 'color:#C93D78;font-weight:bold;font-size:13px');
    return () => document.removeEventListener('click', onClick);
  }, []);

  const enter = () => {
    window.scrollTo(0, 0);
    setEntered(true);
    setSay(visits > 1 ? 'Welcome back! I missed watching your cursor.' : "Move your cursor. I'm watching (nicely).");
  };

  // Sections lift in as they scroll into view.
  useGSAP(() => {
    if (!entered || prefersReducedMotion()) return;
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, duration: 0.7, ease: 'back.out(1.4)', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    ScrollTrigger.refresh();
  }, { scope: main, dependencies: [entered] });

  return (
    <>
      <SvgDefs />
      <StarSky id="spaceSky" density={0.9} />
      <CrawlTransition />
      {!entered && <Preloader onEnter={enter} />}
      <Header />
      <main ref={main}>
        <Hero entered={entered} />
        <Workshop />
        <Levels />
        <Story />
        <DreamOrbits />
        <Guestbook />
      </main>
      <Footer />
      <Toast />
      <RainbowRocket />
      <SparkleTrail />
    </>
  );
}
