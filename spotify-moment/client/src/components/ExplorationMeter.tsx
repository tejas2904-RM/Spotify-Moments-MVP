export function ExplorationMeter({ level }: { level: number }) {
  const pct = Math.round(level * 100);
  return (
    <div className="exploration-meter">
      <div className="meter-header">
        <span>Exploration</span>
        <span>{pct}%</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
