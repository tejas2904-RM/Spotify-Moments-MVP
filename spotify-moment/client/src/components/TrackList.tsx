import { DiscoveryBadge } from './DiscoveryBadge';
import { EnergyMeter } from './EnergyMeter';
import { TrackArt } from './TrackArt';
import type { RecommendationItem } from '../types/session';

interface Props {
  tracks: RecommendationItem[];
  nowPlayingId: string;
  listKey: string;
  onPlay: (id: string) => void;
}

export function TrackList({ tracks, nowPlayingId, listKey, onPlay }: Props) {
  return (
    <section className="card track-list-card">
      <p className="label">For You · updates live</p>
      <ul className="track-list" key={listKey}>
        {tracks.map((track, i) => (
          <li
            key={`${track.id}-${i}`}
            className={[
              track.id === nowPlayingId ? 'active' : '',
              track.isDiscovery ? 'discovery-row' : '',
              track.isSwap ? 'swap-row' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onPlay(track.id)}
          >
            <span className="rank">{i + 1}</span>
            <TrackArt artist={track.artist} energy={track.energy} size="sm" />
            <div className="track-info">
              <p className="track-title">
                {track.title}
                <EnergyMeter energy={track.energy} />
                {track.isDiscovery && <DiscoveryBadge />}
                {track.isSwap && <span className="swap-badge">Swap</span>}
              </p>
              <p className="track-artist">{track.artist}</p>
              <p className="track-reason">
                <span className="reason-label">AI</span>
                {track.reason}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
