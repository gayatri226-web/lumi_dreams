import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connect, usingMongo } from './store.js';
import wishes from './routes/wishes.js';
import visits from './routes/visits.js';

const PORT = process.env.PORT || 5000;
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean);
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../../client/dist');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, db: usingMongo ? 'mongo' : 'memory' }));
app.use('/api/wishes', wishes);
app.use('/api/visits', visits);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// In production the same server also hosts the built React app (one deploy on Render).
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[api]', err.message);
  if (err.name === 'ValidationError') return res.status(400).json({ error: 'That wish is too long or empty.' });
  res.status(500).json({ error: 'Something went wrong on the launchpad.' });
});

connect(process.env.MONGODB_URI)
  .catch((err) => console.error('[store] MongoDB connection failed, using in-memory store:', err.message))
  .finally(() => app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`)));
