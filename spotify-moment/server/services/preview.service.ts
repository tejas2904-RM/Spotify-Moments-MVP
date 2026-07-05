import type { RecommendationItem } from '../types/session.types.js';
import { loadJson } from './dataLoader.js';

interface CatalogTrack {
  id: string;
  title: string;
  artist: string;
  previewUrl?: string;
}

const catalog = loadJson<CatalogTrack[]>('tracks.json');
const previewByTrackId = new Map<string, string>();
const lookupCache = new Map<string, string | null>();

/** Fictional / demo artists — no iTunes lookup */
const SKIP_ARTISTS = new Set([
  'Unknown Acoustic',
  'Luna Rivers',
  'Ember Lane',
  'Calm Collective',
  'Pulse Runner',
  'Voltage',
  'Kinetic',
  'DJ Nova',
  'Synthwave DJ',
  'Bassline King',
]);

function seedFromCatalog(): void {
  for (const track of catalog) {
    if (track.previewUrl) previewByTrackId.set(track.id, track.previewUrl);
  }
}

seedFromCatalog();

async function lookupItunesPreview(artist: string, title: string): Promise<string | undefined> {
  const cacheKey = `${artist.toLowerCase()}|${title.toLowerCase()}`;
  if (lookupCache.has(cacheKey)) {
    return lookupCache.get(cacheKey) ?? undefined;
  }

  try {
    const term = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`,
      { signal: AbortSignal.timeout(5_000) }
    );
    if (!res.ok) {
      lookupCache.set(cacheKey, null);
      return undefined;
    }

    const data = (await res.json()) as {
      results?: { artistName?: string; trackName?: string; previewUrl?: string }[];
    };

    const artistToken = artist.split(' ')[0]?.toLowerCase() ?? '';
    const match =
      data.results?.find(
        (r) =>
          r.previewUrl &&
          r.artistName?.toLowerCase().includes(artistToken) &&
          r.trackName?.toLowerCase().includes(title.split(' ')[0]?.toLowerCase() ?? '')
      ) ?? data.results?.find((r) => r.previewUrl);

    const url = match?.previewUrl ?? null;
    lookupCache.set(cacheKey, url);
    return url ?? undefined;
  } catch {
    lookupCache.set(cacheKey, null);
    return undefined;
  }
}

export function getPreviewUrl(trackId: string): string | undefined {
  return previewByTrackId.get(trackId);
}

export async function resolvePreviewUrl(trackId: string): Promise<string | undefined> {
  const cached = previewByTrackId.get(trackId);
  if (cached) return cached;

  const track = catalog.find((t) => t.id === trackId);
  if (!track || SKIP_ARTISTS.has(track.artist)) return undefined;

  const url = await lookupItunesPreview(track.artist, track.title);
  if (url) previewByTrackId.set(trackId, url);
  return url;
}

/** Warm cache in background — does not block session start */
export function warmPreviewCache(): void {
  void (async () => {
    for (const track of catalog) {
      if (previewByTrackId.has(track.id) || SKIP_ARTISTS.has(track.artist)) continue;
      const url = await lookupItunesPreview(track.artist, track.title);
      if (url) previewByTrackId.set(track.id, url);
      await new Promise((r) => setTimeout(r, 120));
    }
    console.log(`Preview cache warmed (${previewByTrackId.size} tracks)`);
  })();
}

export function withPreview(item: RecommendationItem): RecommendationItem {
  const previewUrl = previewByTrackId.get(item.id);
  return previewUrl ? { ...item, previewUrl } : item;
}

export async function attachPreviews(items: RecommendationItem[]): Promise<RecommendationItem[]> {
  return Promise.all(
    items.map(async (item) => {
      const existing = previewByTrackId.get(item.id);
      if (existing) return { ...item, previewUrl: existing };
      const url = await resolvePreviewUrl(item.id);
      return url ? { ...item, previewUrl: url } : item;
    })
  );
}
