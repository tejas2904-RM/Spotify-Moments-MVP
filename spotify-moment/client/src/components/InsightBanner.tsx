import { IconInsight } from './PlayerIcons';

export function InsightBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="insight-banner" role="status">
      <IconInsight size={18} />
      <span>{message}</span>
    </div>
  );
}
