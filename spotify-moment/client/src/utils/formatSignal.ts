export function formatSignal(signal: string): string {
  if (signal.startsWith('SKIP@')) {
    const match = signal.match(/SKIP@(\d+)s/);
    if (match) return `Skipped @${match[1]}s`;
    if (signal.includes('early')) return 'Skipped early';
    return 'Skipped';
  }
  if (signal.startsWith('LIKE')) return 'Liked';
  if (signal.startsWith('SAVE')) return 'Saved';
  if (signal.startsWith('LISTEN_COMPLETE')) return 'Preview complete';
  if (signal.startsWith('REPLAY')) return 'Replayed';
  if (signal.startsWith('PLAY')) {
    const title = signal.replace(/^PLAY\s+/, '');
    return title.length > 22 ? `Play · ${title.slice(0, 20)}…` : `Play · ${title}`;
  }
  return signal.length > 28 ? `${signal.slice(0, 26)}…` : signal;
}
