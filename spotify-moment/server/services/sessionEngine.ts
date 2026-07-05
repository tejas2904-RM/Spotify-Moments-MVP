import type {
  RecommendationItem,
  SessionState,
  SignalType,
  Track,
} from '../types/session.types.js';
import { analyzeSession, fallbackAnalysis, parseRefineKeywords } from './llm.service.js';
import { loadJson } from './dataLoader.js';

const TRACKS = loadJson<Track[]>('tracks.json');
const TASTE = loadJson<{ preferredGenres: string[]; preferredArtists: string[] }>('taste.json');
const ADJACENCY = loadJson<Record<string, string[]>>('artist-adjacency.json');
const FATIGUE_THRESHOLD = 3;

function scoreTrack(track: Track, session: SessionState): number {
  let score = 0;

  if (TASTE.preferredArtists.includes(track.artist)) score += 3;
  if (track.genres.some((g) => TASTE.preferredGenres.includes(g))) score += 2;

  score -= Math.abs(track.energy - session.sessionEnergy) * 1.5;

  if (track.isDiscoveryCandidate) {
    score += session.explorationLevel * 2;
  } else {
    score += (1 - session.explorationLevel) * 1.5;
  }

  const c = session.sessionConstraints;
  if (c.minEnergy && track.energy < c.minEnergy) score -= 10;
  if (c.maxEnergy && track.energy > c.maxEnergy) score -= 10;
  if (c.excludeGenres?.some((g) => track.genres.includes(g))) score -= 20;
  if (c.lessMainstream && track.isMainstream) score -= 3;
  if (c.preferFemaleArtists && track.isFemaleArtist) score += 2;
  if (c.lockEnergyBand && Math.abs(track.energy - c.lockEnergyBand) <= 1) score += 3;

  const lastLike = [...session.recentSignals].reverse().find((s) => s.startsWith('LIKE'));
  if (lastLike?.includes(track.artist)) score += 4;

  const lastSave = [...session.recentSignals].reverse().find((s) => s.startsWith('SAVE'));
  if (lastSave?.includes(track.artist)) score += 3;

  return score;
}

function buildQueue(session: SessionState): RecommendationItem[] {
  return [...TRACKS]
    .map((track) => ({ track, score: scoreTrack(track, session) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ track }) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      energy: track.energy,
      isDiscovery: false,
      isSwap: false,
      reason: 'Matched to your listening taste.',
    }));
}

/** Phase 2 — every 4th slot is a discovery track */
function applyDiscoverySlots(session: SessionState): void {
  const discoveryPool = TRACKS.filter((t) => t.isDiscoveryCandidate);
  if (!discoveryPool.length) return;

  const usedDiscoveryIds = new Set<string>();

  session.recommendations = session.recommendations.map((item, index) => {
    const slotIndex = index + 1;
    if (slotIndex % 4 !== 0) return { ...item, isDiscovery: false };

    const replacement = pickDiscoveryTrack(session, discoveryPool, item, usedDiscoveryIds);
    usedDiscoveryIds.add(replacement.id);
    return {
      ...replacement,
      isDiscovery: true,
      isSwap: item.isSwap,
      reason:
        replacement.reason ||
        'Discovery Track — exploring adjacent to your current vibe.',
    };
  });
}

function pickDiscoveryTrack(
  session: SessionState,
  pool: Track[],
  current: RecommendationItem,
  usedDiscoveryIds: Set<string>
): RecommendationItem {
  const existingIds = new Set([
    ...session.recommendations.map((r) => r.id),
    ...usedDiscoveryIds,
  ]);
  const candidate = pool
    .filter((t) => !existingIds.has(t.id))
    .sort((a, b) => scoreTrack(b, session) - scoreTrack(a, session))[0];

  if (!candidate) return current;

  return {
    id: candidate.id,
    title: candidate.title,
    artist: candidate.artist,
    energy: candidate.energy,
    isDiscovery: true,
    isSwap: false,
    reason: 'Discovery Track — exploring adjacent to your current vibe.',
  };
}

function handleDiscoveryFeedback(
  session: SessionState,
  track: Track | undefined,
  type: SignalType,
  skipAtSec: number
): void {
  if (!track) return;

  const rec = session.recommendations.find((r) => r.id === track.id);
  if (!rec?.isDiscovery) return;

  if (type === 'LIKE' || type === 'SAVE' || type === 'LISTEN_COMPLETE') {
    session.explorationLevel = Math.min(1, session.explorationLevel + 0.2);
    session.toast = 'Exploration Increased';
  } else if (type === 'SKIP' && skipAtSec < 15) {
    session.explorationLevel = Math.max(0, session.explorationLevel - 0.2);
    session.toast = 'Returning to familiar music';
  }
}

function updateFamiliarityScore(session: SessionState): void {
  const repeatDensity = Object.values(session.artistPlayCounts).reduce((a, b) => a + b, 0);
  const repeatFactor = Math.min(1, repeatDensity / 10);
  session.familiarityScore = Math.max(
    0,
    Math.min(1, 1 - session.explorationLevel + repeatFactor * 0.3)
  );
}

/** Phase 3 — swap fatigued artists for adjacent alternatives */
function applyFatigueSwaps(session: SessionState): void {
  const fatiguedArtists = Object.entries(session.artistPlayCounts)
    .filter(([, count]) => count >= FATIGUE_THRESHOLD)
    .map(([artist]) => artist);

  if (!fatiguedArtists.length) return;

  const usedSwapIds = new Set<string>();

  session.recommendations = session.recommendations.map((item) => {
    if (!fatiguedArtists.includes(item.artist)) return item;

    const swapTrack = findAdjacentTrack(item.artist, session, usedSwapIds);
    if (!swapTrack) return item;

    usedSwapIds.add(swapTrack.id);
    session.lastFatigueArtist = item.artist;
    if (!session.insightBanner) {
      session.insightBanner = `You've listened to ${item.artist} several times today. Trying something similar instead.`;
    }

    return {
      id: swapTrack.id,
      title: swapTrack.title,
      artist: swapTrack.artist,
      energy: swapTrack.energy,
      isDiscovery: item.isDiscovery,
      isSwap: true,
      reason: `Similar to ${item.artist} — easing repetition.`,
    };
  });
}

function findAdjacentTrack(
  fatiguedArtist: string,
  session: SessionState,
  usedSwapIds: Set<string>
): Track | undefined {
  const adjacentNames = ADJACENCY[fatiguedArtist] ?? [];
  const usedIds = new Set([
    ...session.recommendations.map((r) => r.id),
    ...usedSwapIds,
  ]);

  return TRACKS.filter(
    (t) =>
      adjacentNames.includes(t.artist) &&
      !usedIds.has(t.id) &&
      t.artist !== fatiguedArtist
  ).sort((a, b) => scoreTrack(b, session) - scoreTrack(a, session))[0];
}

function deriveRuleLabel(session: SessionState): string {
  const base = getTimeBasedLabel();
  if (session.sessionEnergy >= 4) return 'High Energy Commute';
  if (session.sessionEnergy <= 2) return `${base} · Low Key`;
  return base;
}

function getTimeBasedLabel(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'Morning Commute';
  if (h >= 11 && h < 17) return 'Afternoon Focus';
  if (h >= 17 && h < 22) return 'Evening Wind-down';
  return 'Late Night';
}

function applyLlmResult(session: SessionState, llm: Awaited<ReturnType<typeof analyzeSession>>): void {
  if (llm.contextLabel) session.contextLabel = llm.contextLabel;
  if (llm.contextConfidence) session.contextConfidence = llm.contextConfidence;
  if (llm.sessionConstraints) {
    session.sessionConstraints = { ...session.sessionConstraints, ...llm.sessionConstraints };
  }
  if (llm.sessionMessage) session.sessionMessage = llm.sessionMessage;
  if (llm.insightBanner) session.insightBanner = llm.insightBanner;
  if (llm.explanations) {
    session.recommendations = session.recommendations.map((r) => ({
      ...r,
      reason: llm.explanations![r.id] ?? r.reason,
    }));
  }
}

async function enrichWithLlm(session: SessionState, refineText?: string): Promise<void> {
  session.isAnalyzing = true;

  const minDelay = new Promise((r) => setTimeout(r, 800));
  const llmPromise = analyzeSession(session, {
    refineText,
    fatigueEvent: session.insightBanner,
  });

  try {
    const [llm] = await Promise.all([llmPromise, minDelay]);
    applyLlmResult(session, llm);
  } catch (err) {
    console.warn('LLM enrichment failed', err);
  } finally {
    session.isAnalyzing = false;
  }
}

export async function startSession(session: SessionState): Promise<void> {
  session.contextLabel = getTimeBasedLabel();
  session.contextConfidence = 55;
  session.recommendations = buildQueue(session);
  applyDiscoverySlots(session);
  applyFatigueSwaps(session);
  updateFamiliarityScore(session);
  session.isAnalyzing = false;
  // Instant response on start — LLM runs on first user interaction
  applyLlmResult(session, fallbackAnalysis(session));
}

export async function handleSignal(
  session: SessionState,
  payload: { type: SignalType; trackId?: string; skipAtSec?: number }
): Promise<void> {
  const track = TRACKS.find((t) => t.id === payload.trackId);
  session.toast = undefined;
  session.insightBanner = undefined;
  session.sessionMessage = undefined;

  switch (payload.type) {
    case 'SKIP': {
      const sec = payload.skipAtSec ?? 0;
      const dur = track?.durationSec ?? 200;
      if (sec < 15) {
        session.sessionEnergy = Math.min(5, session.sessionEnergy + 1);
        session.recentSignals.push(`SKIP@${sec}s early-low-tolerance`);
      } else if (sec > dur * 0.5) {
        session.sessionEnergy = Math.max(1, session.sessionEnergy - 1);
        session.recentSignals.push(`SKIP@${sec}s late-maybe-too-intense`);
      } else {
        session.recentSignals.push(`SKIP@${sec}s`);
      }
      break;
    }
    case 'LIKE':
    case 'SAVE':
      if (track) {
        session.recentSignals.push(`${payload.type} ${track.artist} ${track.genres[0]}`);
        session.artistPlayCounts[track.artist] =
          (session.artistPlayCounts[track.artist] ?? 0) + 1;
      }
      break;
    case 'REPLAY':
      if (track) session.recentSignals.push(`REPLAY energy-${track.energy}`);
      break;
    case 'PLAY':
      if (track) {
        session.nowPlaying = { trackId: track.id, progress: 0 };
        session.artistPlayCounts[track.artist] =
          (session.artistPlayCounts[track.artist] ?? 0) + 1;
        session.recentSignals.push(`PLAY ${track.title}`);
      }
      break;
    case 'LISTEN_COMPLETE':
      session.recentSignals.push('LISTEN_COMPLETE');
      break;
  }

  handleDiscoveryFeedback(session, track, payload.type, payload.skipAtSec ?? 0);

  session.recentSignals = session.recentSignals.slice(-10);
  session.contextLabel = deriveRuleLabel(session);
  session.contextConfidence = Math.min(95, session.contextConfidence + 5);

  session.recommendations = buildQueue(session);
  applyDiscoverySlots(session);
  applyFatigueSwaps(session);
  updateFamiliarityScore(session);
  await enrichWithLlm(session);
}

export async function handleRefine(session: SessionState, text: string): Promise<void> {
  session.sessionMessage = undefined;
  session.sessionConstraints = {
    ...session.sessionConstraints,
    ...parseRefineKeywords(text),
  };
  session.recommendations = buildQueue(session);
  applyDiscoverySlots(session);
  applyFatigueSwaps(session);
  updateFamiliarityScore(session);
  await enrichWithLlm(session, text);
}
