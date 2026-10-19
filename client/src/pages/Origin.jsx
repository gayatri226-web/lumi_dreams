import { lazy, Suspense, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import ChapterNext from '../components/story/ChapterNext.jsx';

// Origin: Lumi's backstory as a scroll-driven 3D film, from a sneezing Moon to Cloudport's scrapyard.
const OriginScene = lazy(() => import('../components/three/OriginScene.jsx'));

export default function Origin() {
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
      <h1 className="sr-only">Where Lumi comes from</h1>
      <Suspense fallback={<div className="journey journey--loading"><p>Polishing the Moon…</p></div>}>
        <OriginScene />
      </Suspense>
      <ChapterNext from="/origin" />
    </>
  );
}
