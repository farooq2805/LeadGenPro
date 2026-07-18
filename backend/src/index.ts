import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import creditRoutes from './routes/credits';
import orderRoutes from './routes/orders';

const app = express();
const PORT = process.env.PORT || 3001;

// Behind Render/nginx the client IP arrives via X-Forwarded-For.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// When a built frontend is bundled into the image (single-service deploys
// like Render), serve it with an SPA fallback for client-side routes.
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ProspectPro API running on http://localhost:${PORT}`);
});
