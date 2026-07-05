export function FamiliarityBar({ score }: { score: number }) {
  const discoveryPct = Math.round((1 - score) * 100);
  return (
    <div className="familiarity-bar">
      <div className="meter-header">
        <span>Familiar</span>
        <span>Discovery</span>
      </div>
      <div className="familiarity-track">
        <div className="familiarity-thumb" style={{ left: `calc(${discoveryPct}% - 8px)` }} />
      </div>
    </div>
  );
}
