import { useApp } from '../context/AppContext.jsx';

const TICKER = '★ now boarding: Cloudport Express ★ please keep tiny hands inside the sky-car ★ best viewed past bedtime ★ honk if you love starlight ';

export default function Footer() {
  const { chaos, setChaos, showToast, celebrate } = useApp();
  const toggle = () => {
    const on = !chaos;
    setChaos(on);
    if (on) { showToast('✺ CHAOS MODE ✺ welcome to 1999'); celebrate(); }
  };
  return (
    <footer>
      <div className="ticker" aria-hidden="true"><div>{TICKER.repeat(2)}&nbsp;</div></div>
      <div className="foot wrap">
        <div className="badges" aria-hidden="true">
          <span className="b88">best viewed<br />in space</span>
          <span className="b88 b88--pink">made with<br />♥ &amp; gsap</span>
          <span className="b88">🚧 under<br />construction</span>
        </div>
        <button className="pill" type="button" aria-pressed={chaos} onClick={toggle}>✺ Chaos mode</button>
        <p className="credits">
          Anew and friends are original characters drawn in SVG for Baby's First Website (haX.baby). Built with React, Express and MongoDB.
          Animation: GSAP + ScrollTrigger and Framer Motion. Confetti: canvas-confetti. Font: Baloo 2. Every sound is synthesized live with the Web Audio API.
        </p>
      </div>
    </footer>
  );
}
