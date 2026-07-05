import { DiscoveryBadge } from './DiscoveryBadge';
import type { RecommendationItem } from '../types/session';
import { useAudioPreview } from '../hooks/useAudioPreview';

interface Props {
  track: RecommendationItem;
  onSkip: (skipAtSec: number) => void;
  onLike: () => void;
  onSave: () => void;
  onReplay: () => void;
  onPreviewComplete?: () => void;
}

export function PlayerBar({
  track,
  onSkip,
  onLike,
  onSave,
  onReplay,
  onPreviewComplete,
}: Props) {
  const { progress, status, getCurrentSec, replay } = useAudioPreview({
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    previewUrl: track.previewUrl,
    onPreviewComplete,
  });

  const handleSkip = () => onSkip(getCurrentSec());
  const handleReplay = () => {
    replay();
    onReplay();
  };

  return (
    <section className="card player">
      <p className="label">Now Playing</p>
      <div className="player-inner">
        <div className="album-art" aria-hidden="true">
          <span className="album-art-icon">♪</span>
        </div>
        <div className="player-meta">
          <div className="now-playing-title">
            <h3>{track.title}</h3>
            {track.isDiscovery && <DiscoveryBadge />}
            {track.isSwap && <span className="swap-badge">Similar swap</span>}
          </div>
          <p className="artist">{track.artist}</p>
          {status === 'playing' && (
            <p className="preview-hint">30s preview · session adapts as you listen</p>
          )}
          {status === 'unavailable' && (
            <p className="preview-hint preview-hint-muted">Preview unavailable · signals still work</p>
          )}
          <div className="progress">
            <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="controls">
            <button type="button" className="btn-secondary btn-icon" onClick={handleReplay} title="Replay">
              ↺
            </button>
            <button type="button" className="btn-secondary" onClick={handleSkip} title="Skip">
              ⏭ Skip
            </button>
            <button type="button" className="btn-secondary" onClick={onLike} title="Like">
              ♥ Like
            </button>
            <button type="button" className="btn-secondary" onClick={onSave} title="Save">
              💾 Save
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
