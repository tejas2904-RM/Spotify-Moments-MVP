import type { SessionResponse } from '../types/session';

/** Dev: empty → Vite proxy `/api`. Prod: set VITE_API_URL on Vercel (Railway backend URL). */
const API_ROOT = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

function apiBase(): string {
  if (import.meta.env.PROD && !API_ROOT) {
    throw new Error(
      'VITE_API_URL is not set. In Vercel → Project → Settings → Environment Variables, add your Railway URL (e.g. https://your-app.up.railway.app), then redeploy.'
    );
  }
  return `${API_ROOT}/api/session`;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!res.ok) {
    try {
      const err = JSON.parse(text) as { error?: string };
      throw new Error(err.error ?? res.statusText);
    } catch (e) {
      if (e instanceof Error && e.message !== res.statusText) throw e;
      throw new Error(text.slice(0, 120) || res.statusText);
    }
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      'Backend returned an invalid response. Check VITE_API_URL points to your Railway API (not the Vercel site URL).'
    );
  }
}

export async function startSession(deviceType = 'desktop'): Promise<SessionResponse> {
  const res = await fetch(`${apiBase()}/start`, {
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
  const res = await fetch(`${apiBase()}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson<SessionResponse>(res);
}

export async function refineSession(text: string): Promise<SessionResponse> {
  const res = await fetch(`${apiBase()}/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return parseJson<SessionResponse>(res);
}

export async function getSession(): Promise<SessionResponse> {
  const res = await fetch(`${apiBase()}/`);
  return parseJson<SessionResponse>(res);
}
