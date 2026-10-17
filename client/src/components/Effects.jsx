import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { prefersReducedMotion } from '../lib/util.js';

// Small global layers: toast, the rainbow rocket, and the sparkle cursor trail.

export function Toast() {
  const { toast } = useApp();
  return (
    <div role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} className="toast on" style={{ x: '-50%' }}
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RainbowRocket() {
  const { rocketFlight, setRocketFlight } = useApp();
  return (
    <AnimatePresence>
      {rocketFlight && (
        <motion.div key={rocketFlight} className="rocket-fly" aria-hidden="true"
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={{ x: window.innerWidth + 450, y: -window.innerHeight * 0.25, rotate: -8 }}
          transition={{ duration: 2.4, ease: 'easeInOut' }}
          onAnimationComplete={() => setRocketFlight(null)}>
          <svg viewBox="0 0 260 120">
            <path d="M0 60 L90 40 L90 80 Z" fill="#FF8FB8" />
            <path d="M0 60 L90 48 L90 72 Z" fill="#FFE38A" />
            <path d="M0 60 L90 54 L90 66 Z" fill="#CFE6FF" />
            <path d="M90 30 C 170 30 230 40 255 60 C 230 80 170 90 90 90 Z" fill="#FF8FB8" stroke="#4A2C3A" strokeWidth="5" />
            <circle cx="190" cy="60" r="18" fill="#CFE6FF" stroke="#4A2C3A" strokeWidth="5" />
            <path d="M110 30 L90 6 L140 30 Z M110 90 L90 114 L140 90 Z" fill="#E3D6FF" stroke="#4A2C3A" strokeWidth="4" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SPARK_COLORS = ['#FF8FB8', '#FFE38A', '#CFE6FF', '#E3D6FF', '#C93D78'];
export function SparkleTrail() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let last = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < 45 || document.body.classList.contains('loading')) return;
      last = now;
      const s = document.createElement('span');
      s.className = 'spark';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = Math.random() < 0.5 ? '✦' : '♥';
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      s.style.color = SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0];
      s.style.fontSize = `${10 + Math.random() * 10}px`;
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
      setTimeout(() => s.remove(), 1400);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return null;
}
