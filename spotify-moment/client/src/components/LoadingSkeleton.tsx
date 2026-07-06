export function LoadingSkeleton() {
  return (
    <div className="app-shell skeleton-shell">
      <aside className="sidebar">
        <div className="skeleton skeleton-brand" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card skeleton-card--short" />
        <div className="skeleton skeleton-card skeleton-card--short" />
      </aside>
      <main className="main">
        <div className="skeleton skeleton-greeting" />
        <div className="skeleton skeleton-player" />
        <div className="skeleton skeleton-list" />
      </main>
    </div>
  );
}
