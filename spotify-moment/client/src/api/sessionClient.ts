import type { SessionResponse } from '../types/session';

/** Dev: empty → Vite proxy `/api`. Prod: set VITE_API_URL on Vercel (Render backend URL). */
const API_ROOT = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const BASE = `${API_ROOT}/api/session`;

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function startSession(deviceType = 'desktop'): Promise<SessionResponse> {
  const res = await fetch(`${BASE}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceType }),
  });
  return parseJson<SessionResponse>(res);
}

export async function sendSignal(body: {
  type: string;
  trackId?: string;
  skipAtSec?: number;
}): Promise<SessionResponse> {
  const res = await fetch(`${BASE}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson<SessionResponse>(res);
}

export async function refineSession(text: string): Promise<SessionResponse> {
  const res = await fetch(`${BASE}/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return parseJson<SessionResponse>(res);
}

export async function getSession(): Promise<SessionResponse> {
  const res = await fetch(`${BASE}/`);
  return parseJson<SessionResponse>(res);
}
