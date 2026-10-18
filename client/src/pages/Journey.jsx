import { lazy, Suspense } from 'react';
import PageHero from '../components/fx/PageHero.jsx';

// Journey: Lumi's story as a scroll-driven 3D flight from Earth to the Moon (Three.js, loaded lazily).
const JourneyScene = lazy(() => import('../components/three/JourneyScene.jsx'));

export default function Journey() {
  return (
    <>
      <PageHero kicker="My story" title="Fly with me to the Moon" accent="Moon"
        text="Scroll slowly. Your scroll wheel is my rocket engine. Four little chapters on the way, then a soft landing."
        sign="Launchpad →" />
      <Suspense fallback={<div className="journey journey--loading"><p>Fueling the rocket…</p></div>}>
        <JourneyScene />
      </Suspense>
    </>
  );
}
