import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/sessionClient';
import type { SessionResponse } from '../types/session';

export function useSession() {
  const [state, setState] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (fn: () => Promise<SessionResponse>) => {
    const next = await fn();
    setState(next);
    return next;
  }, []);

  useEffect(() => {
    api
      .startSession('desktop')
      .then((session) => {
        setState(session);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const nowPlayingId =
    state?.nowPlaying?.trackId ?? state?.recommendations[0]?.id ?? '';

  const skip = (trackId: string, skipAtSec = 8) =>
    refresh(() => api.sendSignal({ type: 'SKIP', trackId, skipAtSec }));

  const like = (trackId: string) =>
    refresh(() => api.sendSignal({ type: 'LIKE', trackId }));

  const save = (trackId: string) =>
    refresh(() => api.sendSignal({ type: 'SAVE', trackId }));

  const replay = (trackId: string) =>
    refresh(() => api.sendSignal({ type: 'REPLAY', trackId }));

  const play = (trackId: string) =>
    refresh(() => api.sendSignal({ type: 'PLAY', trackId }));

  const refine = (text: string) => refresh(() => api.refineSession(text));

  return {
    state,
    loading,
    error,
    nowPlayingId,
    skip,
    like,
    save,
    replay,
    play,
    refine,
  };
}
