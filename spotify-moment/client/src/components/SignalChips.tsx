import { formatSignal } from '../utils/formatSignal';

interface Props {
  signals: string[];
}

export function SignalChips({ signals }: Props) {
  const chips = signals.slice(-3).reverse();
  if (!chips.length) return null;

  return (
    <div className="signal-chips">
      <p className="label">Recent signals</p>
      <div className="signal-chips-row">
        {chips.map((signal, i) => (
          <span key={`${signal}-${i}`} className="signal-chip">
            {formatSignal(signal)}
          </span>
        ))}
      </div>
    </div>
  );
}
