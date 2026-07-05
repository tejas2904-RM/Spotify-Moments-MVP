import { useCallback, useEffect, useRef, useState } from 'react';
import { resolvePreviewUrl } from '../api/previewClient';

interface Options {
  trackId: string;
  artist: string;
  title: string;
  previewUrl?: string;
  onPreviewComplete?: () => void;
}

export function useAudioPreview({
  trackId,
  artist,
  title,
  previewUrl,
  onPreviewComplete,
}: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onCompleteRef = useRef(onPreviewComplete);
  onCompleteRef.current = onPreviewComplete;

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'unavailable'>('idle');

  useEffect(() => {
    let cancelled = false;
    let audio: HTMLAudioElement | null = null;

    const cleanup = () => {
      audio?.pause();
      audio = null;
      audioRef.current = null;
    };

    setProgress(0);
    setStatus('loading');

    void (async () => {
      const url = await resolvePreviewUrl(artist, title, previewUrl);
      if (cancelled) return;

      if (!url) {
        setStatus('unavailable');
        return;
      }

      audio = new Audio(url);
      audioRef.current = audio;

      const onTime = () => {
        const duration = audio?.duration && Number.isFinite(audio.duration) ? audio.duration : 30;
        setProgress(Math.min(1, (audio?.currentTime ?? 0) / duration));
      };
      const onEnded = () => {
        setProgress(1);
        onCompleteRef.current?.();
      };

      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('ended', onEnded);

      try {
        await audio.play();
        if (!cancelled) setStatus('playing');
      } catch {
        if (!cancelled) setStatus('unavailable');
      }

      if (cancelled) {
        audio.pause();
        audio.removeEventListener('timeupdate', onTime);
        audio.removeEventListener('ended', onEnded);
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [trackId, artist, title, previewUrl]);

  const getCurrentSec = useCallback(() => Math.floor(audioRef.current?.currentTime ?? 0), []);

  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
    setStatus('playing');
  }, []);

  return { progress, status, getCurrentSec, replay };
}
