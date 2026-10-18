import { lazy, Suspense, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

// Journey: Lumi's story as a scroll-driven 3D flight from Earth to the Moon (Three.js, loaded lazily).
// The whole page lives in space: the night theme switches on while you're here.
const JourneyScene = lazy(() => import('../components/three/JourneyScene.jsx'));

export default function Journey() {
  const { space } = useApp();
  useEffect(() => {
    document.body.classList.add('space', 'journey-page');
    return () => {
      document.body.classList.remove('journey-page');
      if (!space) document.body.classList.remove('space');
    };
  }, [space]);

  return (
    <>
      <h1 className="sr-only">Fly with Lumi to the Moon</h1>
      <Suspense fallback={<div className="journey journey--loading"><p>Fueling the rocket…</p></div>}>
        <JourneyScene />
      </Suspense>
    </>
  );
}
