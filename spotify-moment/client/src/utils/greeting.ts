export function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

export const SESSION_HINTS = [
  'Skip early — watch session energy rise',
  'Finish a preview — exploration adjusts on discovery tracks',
  'Try Refine: “Something upbeat but not EDM”',
  'Like a track — the queue reshapes for this session only',
] as const;
