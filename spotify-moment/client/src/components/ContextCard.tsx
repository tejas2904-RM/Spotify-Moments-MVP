interface Props {
  label: string;
  confidence: number;
  deviceType: string;
  isAnalyzing: boolean;
}

export function ContextCard({ label, confidence, deviceType, isAnalyzing }: Props) {
  return (
    <div className={`card context-card ${isAnalyzing ? 'pulse' : ''}`}>
      <p className="label">Current Context</p>
      <h2 className="context-title">{label}</h2>
      <p className="confidence">Confidence {confidence}%</p>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${confidence}%` }} />
      </div>
      <p className="meta">Session energy · {deviceType}</p>
    </div>
  );
}
