import { DiscoveryBadge } from './DiscoveryBadge';
import type { RecommendationItem } from '../types/session';

interface Props {
  track: RecommendationItem;
  onSkip: () => void;
  onLike: () => void;
  onSave: () => void;
  onReplay: () => void;
}

export function PlayerBar({ track, onSkip, onLike, onSave, onReplay }: Props) {
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
          <div className="progress">
            <div className="progress-fill" />
          </div>
          <div className="controls">
            <button type="button" className="btn-secondary btn-icon" onClick={onReplay} title="Replay">
              ↺
            </button>
            <button type="button" className="btn-secondary" onClick={onSkip} title="Skip">
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
