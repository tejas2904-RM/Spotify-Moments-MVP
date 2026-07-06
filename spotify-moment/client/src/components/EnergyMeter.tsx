interface Props {
  energy: number;
  max?: number;
}

export function EnergyMeter({ energy, max = 5 }: Props) {
  return (
    <span className="energy-meter" title={`Energy ${energy}/${max}`} aria-label={`Energy ${energy} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`energy-dot ${i < energy ? 'energy-dot--on' : ''}`} />
      ))}
    </span>
  );
}
