import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SkyCarBody } from '../art/SkyCar.jsx';

// Reading progress: a tiny sky-car drives along the bottom of the header as you scroll the page.
export default function ScrollCar() {
  const car = useRef(null);
  const trail = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (car.current) car.current.style.left = `calc(${p * 100}% - ${p * 44}px)`;
      if (trail.current) trail.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [pathname]);

  return (
    <div className="scrollcar" aria-hidden="true">
      <div className="scrollcar__trail" ref={trail} />
      <svg className="scrollcar__car" ref={car} viewBox="0 80 420 150"><SkyCarBody /></svg>
    </div>
  );
}
