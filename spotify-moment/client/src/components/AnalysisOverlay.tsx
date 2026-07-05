export function AnalysisOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="overlay" role="dialog" aria-label="Analysing session">
      <div className="overlay-card">
        <div className="spinner" />
        <p>AI is analysing your session</p>
      </div>
    </div>
  );
}
