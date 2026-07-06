interface IconProps {
  size?: number;
}

export function IconReplay({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M2.5 8a5.5 5.5 0 0 1 9.2-4.1H9V2h5v5h-2V4.9A4.5 4.5 0 1 0 13 8h1.5a6 6 0 1 1-1.9-4.4V1.5H8v2h1.6A5.5 5.5 0 0 0 2.5 8z" />
    </svg>
  );
}

export function IconSkip({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3 3.5v9l7-4.5L3 3.5zm8 0v9h1.5v-9H11z" />
    </svg>
  );
}

export function IconHeart({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 13.5 2.2 7.7C1 6.5 1 4.5 2.2 3.3a3.2 3.2 0 0 1 4.5 0L8 4.6l1.3-1.3a3.2 3.2 0 0 1 4.5 0c1.2 1.2 1.2 3.2 0 4.4L8 13.5z" />
    </svg>
  );
}

export function IconSave({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3 2.5h7.6L13 4.9v9.1H3V2.5zm1.5 1.5v10h7V5.4L9.9 4h-5.4zm2 6h3v3h-3v-3z" />
    </svg>
  );
}

export function IconInsight({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm-.25 3v3.5h.5V6h-.5zm0 4.5v1h.5v-1h-.5z" />
    </svg>
  );
}
