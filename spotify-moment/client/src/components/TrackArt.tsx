import { getArtistInitials, getTrackGradient } from '../utils/trackArt';

interface Props {
  artist: string;
  energy: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TrackArt({ artist, energy, size = 'md' }: Props) {
  return (
    <div
      className={`track-art track-art--${size}`}
      style={{ background: getTrackGradient(artist, energy) }}
      aria-hidden="true"
    >
      <span className="track-art-initials">{getArtistInitials(artist)}</span>
    </div>
  );
}
