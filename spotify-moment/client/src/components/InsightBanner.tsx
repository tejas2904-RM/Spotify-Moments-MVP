export function InsightBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="insight-banner" role="status">
      {message}
    </div>
  );
}
