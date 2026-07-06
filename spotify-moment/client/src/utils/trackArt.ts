/** Deterministic gradient + initials — no external artwork API */

const ENERGY_GRADIENTS: [string, string][] = [
  ['#1a1a2e', '#252538'],
  ['#1f1f2e', '#2a2a3d'],
  ['#182218', '#1f3328'],
  ['#142a1c', '#1a3d28'],
  ['#0f2818', '#1ed76033'],
];

export function getArtistInitials(artist: string): string {
  const parts = artist.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return artist.slice(0, 2).toUpperCase();
}

export function getTrackGradient(artist: string, energy: number): string {
  const idx = Math.min(Math.max(energy, 1), 5) - 1;
  const [from, to] = ENERGY_GRADIENTS[idx];
  const shift = artist.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 12;
  return `linear-gradient(${135 + shift}deg, ${from} 0%, ${to} 100%)`;
}
