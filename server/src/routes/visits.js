import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { bumpVisits, readVisits } from '../store.js';

const router = Router();
const bumpLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

router.get('/', async (req, res, next) => {
  try { res.json({ count: await readVisits() }); } catch (err) { next(err); }
});

// The client calls this once per browser session.
router.post('/', bumpLimiter, async (req, res, next) => {
  try { res.json({ count: await bumpVisits() }); } catch (err) { next(err); }
});

export default router;
