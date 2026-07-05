export type SignalType =
  | 'PLAY'
  | 'SKIP'
  | 'LIKE'
  | 'SAVE'
  | 'REPLAY'
  | 'LISTEN_COMPLETE';

export interface SessionConstraints {
  minEnergy?: number;
  maxEnergy?: number;
  excludeGenres?: string[];
  includeGenres?: string[];
  lessMainstream?: boolean;
  preferFemaleArtists?: boolean;
  lockEnergyBand?: number;
}

export interface RecommendationItem {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  energy: number;
  isDiscovery: boolean;
  isSwap: boolean;
  reason: string;
}

export interface SessionResponse {
  sessionId: string;
  deviceType: string;
  contextLabel: string;
  contextConfidence: number;
  explorationLevel: number;
  familiarityScore: number;
  sessionConstraints: SessionConstraints;
  recommendations: RecommendationItem[];
  nowPlaying: { trackId: string; progress: number } | null;
  artistPlayCounts: Record<string, number>;
  toast?: string;
  insightBanner?: string;
  sessionMessage?: string;
  isAnalyzing: boolean;
}
