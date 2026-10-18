import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import Lumi from '../components/art/Lumi.jsx';

// 404: Lumi floats lost in space.
export default function NotFound() {
  const { goTo } = useApp();
  return (
    <section className="section lost">
      <div className="wrap lost__in">
        <motion.div className="lost__lumi" animate={{ y: [0, -18, 0], rotate: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <Lumi helmet title="Lumi floating in a space helmet" />
        </motion.div>
        <div>
          <span className="label eyebrow">Error 404 · lost in space</span>
          <h1>Uh oh. I haven't built this part of the sky yet.</h1>
          <p>Let's fly back somewhere I know.</p>
          <a className="btn" href="/" onClick={(e) => { e.preventDefault(); goTo('/', "Lumi's sky"); }}>Take me home</a>
        </div>
      </div>
    </section>
  );
}
