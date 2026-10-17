import { useRef } from 'react';
import { motion } from 'framer-motion';
import PuddleJumper from './workshop/PuddleJumper.jsx';
import StarCharger from './workshop/StarCharger.jsx';
import CometCourier from './workshop/CometCourier.jsx';

const cardMotion = {
  whileHover: { y: -6, rotate: -0.6 },
  transition: { type: 'spring', stiffness: 300, damping: 18 },
};

export default function Workshop() {
  const routeCard = useRef(null);
  return (
    <section className="section" id="workshop">
      <div className="wrap">
        <div className="section__head reveal">
          <div><span className="label eyebrow">What I do</span><h2>The Workshop</h2></div>
          <p>Three machines I'm proud of. Every one of them works. Go on, take one for a spin.</p>
        </div>
        <div className="projects">
          <motion.article className="card card--sky reveal" {...cardMotion}>
            <div className="card__top"><span className="tag">Project 01</span><span>Mini-game</span></div>
            <PuddleJumper />
          </motion.article>
          <motion.article className="card card--pink reveal" {...cardMotion}>
            <div className="card__top"><span className="tag">Project 02</span><span>Star toy</span></div>
            <StarCharger />
          </motion.article>
          <motion.article ref={routeCard} className="card card--butter reveal" {...cardMotion}>
            <div className="card__top"><span className="tag">Project 03</span><span>Scroll map</span></div>
            <CometCourier cardRef={routeCard} />
          </motion.article>
        </div>
      </div>
    </section>
  );
}
