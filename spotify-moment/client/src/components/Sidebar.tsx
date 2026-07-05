import { ContextCard } from './ContextCard';
import { ExplorationMeter } from './ExplorationMeter';
import { FamiliarityBar } from './FamiliarityBar';
import { InsightBanner } from './InsightBanner';
import { RefinePanel } from './RefinePanel';
import type { SessionResponse } from '../types/session';

interface Props {
  state: SessionResponse;
  onRefine: (text: string) => void;
}

export function Sidebar({ state, onRefine }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-mark" aria-hidden="true" />
        <span className="logo-text">Spotify Moment</span>
      </div>

      <ContextCard
        label={state.contextLabel}
        confidence={state.contextConfidence}
        deviceType={state.deviceType}
        isAnalyzing={state.isAnalyzing}
      />

      <div className="card meters-card">
        <ExplorationMeter level={state.explorationLevel} />
        <FamiliarityBar score={state.familiarityScore} />
        <InsightBanner message={state.insightBanner} />
      </div>

      <RefinePanel onRefine={onRefine} sessionMessage={state.sessionMessage} />
    </aside>
  );
}
