import { Router } from 'express';
import {
  createSession,
  getLatestSession,
  toResponse,
  updateSession,
} from '../services/sessionStore.js';
import { startSession, handleSignal, handleRefine } from '../services/sessionEngine.js';

const router = Router();

router.post('/start', async (req, res) => {
  const session = createSession(req.body?.deviceType ?? 'desktop');
  await startSession(session);
  updateSession(session);
  res.json(toResponse(session));
});

router.post('/signal', async (req, res) => {
  const session = getLatestSession();
  if (!session) {
    return res.status(400).json({ error: 'No session. POST /start first.' });
  }

  await handleSignal(session, {
    type: req.body.type,
    trackId: req.body.trackId,
    skipAtSec: req.body.skipAtSec ?? 0,
  });
  updateSession(session);
  res.json(toResponse(session));
});

router.post('/refine', async (req, res) => {
  const session = getLatestSession();
  if (!session) {
    return res.status(400).json({ error: 'No session.' });
  }

  await handleRefine(session, req.body.text ?? '');
  updateSession(session);
  res.json(toResponse(session));
});

router.get('/', (_req, res) => {
  const session = getLatestSession();
  if (!session) {
    return res.status(404).json({ error: 'No session.' });
  }
  res.json(toResponse(session));
});

export default router;
