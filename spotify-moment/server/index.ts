import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/session.routes.js';

const app = express();

const allowedOrigins = new Set(
  (process.env.CLIENT_URL ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);

// Local dev: any localhost port (Vite may use 5173, 5174, etc.)
// Production: set CLIENT_URL to your Vercel URL (comma-separated for previews)
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(null, false);
    },
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'spotify-moment' });
});

app.use('/api/session', sessionRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
