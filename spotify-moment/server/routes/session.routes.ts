import { Router, type Response } from 'express';
import {
  createSession,
  getLatestSession,
  toResponse,
  updateSession,
} from '../services/sessionStore.js';
import { startSession, handleSignal, handleRefine } from '../services/sessionEngine.js';
import { withPreview } from '../services/preview.service.js';
import type { SessionResponse } from '../types/session.types.js';

function sendSession(res: Response, session: SessionResponse) {
  res.json({
    ...session,
    recommendations: session.recommendations.map(withPreview),
  });
}

const router = Router();

router.post('/start', async (req, res, next) => {
  try {
    const session = createSession(req.body?.deviceType ?? 'desktop');
    await startSession(session);
    updateSession(session);
    sendSession(res, toResponse(session));
  } catch (err) {
    next(err);
  }
});

router.post('/signal', async (req, res, next) => {
  try {
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
    sendSession(res, toResponse(session));
  } catch (err) {
    next(err);
  }
});

router.post('/refine', async (req, res, next) => {
  try {
    const session = getLatestSession();
    if (!session) {
      return res.status(400).json({ error: 'No session.' });
    }

    await handleRefine(session, req.body.text ?? '');
    updateSession(session);
    sendSession(res, toResponse(session));
  } catch (err) {
    next(err);
  }
});

router.get('/', (_req, res) => {
  const session = getLatestSession();
  if (!session) {
    return res.status(404).json({ error: 'No session.' });
  }
  sendSession(res, toResponse(session));
});

export default router;
