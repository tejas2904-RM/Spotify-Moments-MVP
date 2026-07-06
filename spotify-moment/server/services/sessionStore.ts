import { v4 as uuid } from 'uuid';
import type { SessionState, SessionResponse } from '../types/session.types.js';

const sessions = new Map<string, SessionState>();

export function createSession(deviceType = 'desktop'): SessionState {
  const session: SessionState = {
    sessionId: uuid(),
    deviceType,
    contextLabel: 'Starting session',
    contextConfidence: 40,
    sessionEnergy: 3,
    explorationLevel: 0.5,
    familiarityScore: 0.5,
    sessionConstraints: {},
    recommendations: [],
    nowPlaying: null,
    artistPlayCounts: {},
    recentSignals: [],
    isAnalyzing: false,
    pendingLlm: false,
  };
  sessions.set(session.sessionId, session);
  return session;
}

export function getSession(sessionId: string): SessionState | undefined {
  return sessions.get(sessionId);
}

export function getLatestSession(): SessionState | undefined {
  const all = [...sessions.values()];
  return all[all.length - 1];
}

export function updateSession(session: SessionState): void {
  sessions.set(session.sessionId, session);
}

export function toResponse(session: SessionState): SessionResponse {
  const { sessionEnergy, pendingLlm, lastFatigueArtist, ...rest } = session;
  return {
    ...rest,
    recentSignals: session.recentSignals.slice(-5),
  };
}
