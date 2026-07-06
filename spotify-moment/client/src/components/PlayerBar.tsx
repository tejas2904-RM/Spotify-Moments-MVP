import { DiscoveryBadge } from './DiscoveryBadge';
import { EnergyMeter } from './EnergyMeter';
import { IconHeart, IconReplay, IconSave, IconSkip } from './PlayerIcons';
import { TrackArt } from './TrackArt';
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

  const progressPct = Math.round(progress * 100);

  return (
    <section className="card player player--hero">
      <p className="label">Now Playing</p>
      <div className="player-inner">
        <TrackArt artist={track.artist} energy={track.energy} size="lg" />
        <div className="player-meta">
          <div className="now-playing-title">
            <h3>{track.title}</h3>
            <EnergyMeter energy={track.energy} />
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
          <div className="progress progress--hero">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            {status === 'playing' && (
              <span className="progress-thumb" style={{ left: `${progressPct}%` }} />
            )}
          </div>
          <div className="controls">
            <button type="button" className="btn-secondary btn-icon" onClick={handleReplay} title="Replay">
              <IconReplay />
            </button>
            <button type="button" className="btn-secondary btn-with-icon" onClick={handleSkip} title="Skip">
              <IconSkip />
              <span>Skip</span>
            </button>
            <button type="button" className="btn-secondary btn-with-icon" onClick={onLike} title="Like">
              <IconHeart />
              <span>Like</span>
            </button>
            <button type="button" className="btn-secondary btn-with-icon" onClick={onSave} title="Save">
              <IconSave />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
