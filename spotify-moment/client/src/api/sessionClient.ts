import type { SessionResponse } from '../types/session';

/** Dev: empty → Vite proxy `/api`. Prod: set VITE_API_URL on Vercel (Railway backend URL). */
function normalizeApiRoot(raw: string | undefined): string {
  return (raw ?? '').trim().replace(/^["']|["']$/g, '').replace(/\/$/, '');
}

const API_ROOT = normalizeApiRoot(import.meta.env.VITE_API_URL);

function apiBase(): string {
  if (import.meta.env.PROD && !API_ROOT) {
    throw new Error(
      'VITE_API_URL is not set. In Vercel → Project → Settings → Environment Variables, add your Railway URL (e.g. https://your-app.up.railway.app), then redeploy.'
    );
  }
  if (API_ROOT.endsWith('/api')) {
    throw new Error(
      'VITE_API_URL should be your Railway base URL only (e.g. https://your-app.up.railway.app) — do not include /api.'
    );
  }
  return `${API_ROOT}/api/session`;
}

function formatApiError(status: number, statusText: string, text: string, url: string): string {
  if (!text.trim()) {
    if (status === 502 || status === 503 || status === 504) {
      return `Backend unavailable (${status}). Railway may be waking up — wait 30s and click Retry.\n\nURL: ${url}`;
    }
    return `Backend returned ${status} ${statusText} with an empty body. Check VITE_API_URL.\n\nURL: ${url}`;
  }

  try {
    const err = JSON.parse(text) as { error?: string };
    if (err.error) return err.error;
  } catch {
    /* use raw text */
  }

  return text.slice(0, 200) || `${status} ${statusText}`;
}

async function parseJson<T>(res: Response, url: string): Promise<T> {
  const text = await res.text();

  if (!res.ok) {
    throw new Error(formatApiError(res.status, res.statusText, text, url));
  }

  if (!text.trim()) {
    throw new Error(`Backend returned an empty response. Check VITE_API_URL.\n\nURL: ${url}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Backend returned invalid JSON. VITE_API_URL may point to the wrong host.\n\nURL: ${url}`
    );
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  return parseJson<T>(res, url);
}

const RETRYABLE = new Set([502, 503, 504]);

async function requestWithRetry<T>(url: string, init?: RequestInit, attempts = 3): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok && RETRYABLE.has(res.status) && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 2500 * (i + 1)));
        continue;
      }
      const text = await res.text();
      if (!res.ok) {
        throw new Error(formatApiError(res.status, res.statusText, text, url));
      }
      if (!text.trim()) {
        if (i < attempts - 1) {
          await new Promise((r) => setTimeout(r, 2500 * (i + 1)));
          continue;
        }
        throw new Error(`Backend returned an empty response.\n\nURL: ${url}`);
      }
      return JSON.parse(text) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < attempts - 1 && lastError.message.includes('Failed to fetch')) {
        await new Promise((r) => setTimeout(r, 2500 * (i + 1)));
        continue;
      }
      if (i < attempts - 1 && lastError.message.includes('empty')) {
        await new Promise((r) => setTimeout(r, 2500 * (i + 1)));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error('Request failed');
}

export async function startSession(deviceType = 'desktop'): Promise<SessionResponse> {
  return requestWithRetry(`${apiBase()}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceType }),
  });
}

export async function sendSignal(body: {
  type: string;
  trackId?: string;
  skipAtSec?: number;
}): Promise<SessionResponse> {
  return request(`${apiBase()}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function refineSession(text: string): Promise<SessionResponse> {
  return request(`${apiBase()}/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

export async function getSession(): Promise<SessionResponse> {
  return request(`${apiBase()}/`);
}
