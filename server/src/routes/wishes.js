import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createWish, listWishes } from '../store.js';

const router = Router();

// Strip control characters and squash whitespace. React escapes on render, so no HTML stripping is needed.
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

const postLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Whoa, lots of wishes! Wait a minute and try again.' },
});

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 50);
    res.json({ wishes: await listWishes(limit) });
  } catch (err) { next(err); }
});

router.post('/', postLimiter, async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 24);
    const wish = clean(req.body?.wish, 120);
    if (!name || !wish) return res.status(400).json({ error: 'Add your name and a wish first.' });
    const saved = await createWish({ name, wish });
    res.status(201).json({ wish: saved });
  } catch (err) { next(err); }
});

export default router;
