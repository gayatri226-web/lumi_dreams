import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { prefersReducedMotion } from '../lib/util.js';
import PageHero from '../components/fx/PageHero.jsx';
import ChapterNext from '../components/story/ChapterNext.jsx';
import PuddleJumper from '../components/garage/PuddleJumper.jsx';
import StarCharger from '../components/garage/StarCharger.jsx';
import CometCourier from '../components/garage/CometCourier.jsx';
import GrowthChart from '../components/garage/GrowthChart.jsx';

const cardMotion = { whileHover: { y: -6, rotate: -0.6 }, transition: { type: 'spring', stiffness: 300, damping: 18 } };

// The Garage: what Lumi does. A striped garage door rolls up as you scroll to reveal three
// playable machines, then the growth-chart level-up path.
export default function Garage() {
  const { addStamp } = useApp();
  const root = useRef(null);
  useEffect(() => { addStamp('garage'); }, [addStamp]);

  useGSAP(() => {
    if (prefersReducedMotion()) { gsap.set('.garage__door', { display: 'none' }); return; }
    // The door rolls all the way up once, as the garage comes into view (never stuck half-open).
    gsap.to('.garage__door', { yPercent: -101, duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: '.garage', start: 'top 70%', once: true } });
    gsap.from('.garage .card', { y: 90, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.garage', start: 'top 40%', once: true } });
  }, { scope: root });

  return (
    <div ref={root}>
      <PageHero kicker="Chapter 3 · What I build" title="The Sky-Car Garage" accent="Garage"
        text="Three machines I'm proud of. Every one of them works. The garage door opens as you scroll down. Then take one for a spin!"
        sign="Bay 3 · Lumi's" />
      <section className="section garage-section">
        <div className="wrap">
          <div className="garage">
            <div className="projects">
              <motion.article className="card card--sky" {...cardMotion}>
                <div className="card__top"><span className="tag">Project 01</span><span>Mini-game</span></div>
                <PuddleJumper />
              </motion.article>
              <motion.article className="card card--pink" {...cardMotion}>
                <div className="card__top"><span className="tag">Project 02</span><span>Star toy</span></div>
                <StarCharger />
              </motion.article>
              <motion.article className="card card--butter" {...cardMotion}>
                <div className="card__top"><span className="tag">Project 03</span><span>Night routes</span></div>
                <CometCourier />
              </motion.article>
            </div>
            <div className="garage__door" aria-hidden="true">
              <div className="garage__sign">Open ↑ keep scrolling</div>
              <div className="garage__handle" />
            </div>
          </div>
        </div>
      </section>
      <GrowthChart />
      <ChapterNext from="/garage" />
    </div>
  );
}
