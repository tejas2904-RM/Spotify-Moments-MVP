const previewCache = new Map<string, string>();

/** Client fallback when server cache has not warmed yet */
export async function resolvePreviewUrl(
  artist: string,
  title: string,
  existing?: string
): Promise<string | undefined> {
  if (existing) return existing;

  const key = `${artist}|${title}`.toLowerCase();
  if (previewCache.has(key)) return previewCache.get(key);

  try {
    const term = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=3`
    );
    if (!res.ok) return undefined;

    const data = (await res.json()) as {
      results?: { previewUrl?: string }[];
    };
    const url = data.results?.[0]?.previewUrl;
    if (url) previewCache.set(key, url);
    return url;
  } catch {
    return undefined;
  }
}
