import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/session.routes.js';
import { loadJson } from './services/dataLoader.js';
import { warmPreviewCache } from './services/preview.service.js';

const app = express();

// MVP: allow all browser origins (Vercel previews, custom domains, localhost)
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'spotify-moment', hint: 'Use /api/health or /api/session/start' });
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'spotify-moment',
    tracks: loadJson<unknown[]>('tracks.json').length,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'spotify-moment',
    tracks: loadJson<unknown[]>('tracks.json').length,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.use('/api/session', sessionRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST ?? '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
  warmPreviewCache();
});
