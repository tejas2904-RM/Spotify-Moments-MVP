export type SignalType =
  | 'PLAY'
  | 'SKIP'
  | 'LIKE'
  | 'SAVE'
  | 'REPLAY'
  | 'LISTEN_COMPLETE';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  energy: number;
  genres: string[];
  isMainstream: boolean;
  isDiscoveryCandidate: boolean;
  isFemaleArtist?: boolean;
  durationSec: number;
  previewUrl?: string;
}

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
  previewUrl?: string;
}

export interface SessionState {
  sessionId: string;
  deviceType: string;
  contextLabel: string;
  contextConfidence: number;
  sessionEnergy: number;
  explorationLevel: number;
  familiarityScore: number;
  sessionConstraints: SessionConstraints;
  recommendations: RecommendationItem[];
  nowPlaying: { trackId: string; progress: number } | null;
  artistPlayCounts: Record<string, number>;
  recentSignals: string[];
  toast?: string;
  insightBanner?: string;
  sessionMessage?: string;
  isAnalyzing: boolean;
  lastFatigueArtist?: string;
  pendingLlm: boolean;
}

export type SessionResponse = Omit<
  SessionState,
  'sessionEnergy' | 'pendingLlm' | 'lastFatigueArtist'
>;
