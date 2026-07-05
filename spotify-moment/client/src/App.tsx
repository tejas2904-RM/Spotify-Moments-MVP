import { useMemo } from 'react';
import { useSession } from './hooks/useSession';
import { AnalysisOverlay } from './components/AnalysisOverlay';
import { PlayerBar } from './components/PlayerBar';
import { SessionToast } from './components/SessionToast';
import { Sidebar } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import './App.css';

function App() {
  const {
    state,
    loading,
    error,
    nowPlayingId,
    skip,
    like,
    save,
    replay,
    play,
    refine,
    listenComplete,
  } = useSession();

  const nowPlaying = useMemo(
    () =>
      state?.recommendations.find((t) => t.id === nowPlayingId) ??
      state?.recommendations[0],
    [state, nowPlayingId]
  );

  const listKey = useMemo(
    () => state?.recommendations.map((t) => t.id).join('-') ?? '',
    [state?.recommendations]
  );

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Starting session…</p>
      </div>
    );
  }

  if (error) {
    const isProd = import.meta.env.PROD;
    return (
      <div className="app-loading">
        <h1>Spotify Moment</h1>
        <p className="error">{error}</p>
        {isProd ? (
          <>
            <p className="hint">
              <strong>VITE_API_URL</strong> = Render base URL only (no <code>/api</code> suffix).
              Example: <code>https://your-app.onrender.com</code>
            </p>
            <p className="hint">
              Test in browser: <code>{import.meta.env.VITE_API_URL || '…'}/api/health</code>
            </p>
          </>
        ) : (
          <>
            <p className="hint">
              Make sure the <strong>backend</strong> is running on port 3001.
            </p>
            <pre className="hint-code">{`cd spotify-moment
npm run dev`}</pre>
          </>
        )}
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!state?.recommendations?.length) {
    return (
      <div className="app-loading">
        <h1>Spotify Moment</h1>
        <p className="error">No tracks returned from the API.</p>
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!nowPlaying) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading queue…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AnalysisOverlay show={state.isAnalyzing} />
      <SessionToast message={state.toast} />

      <Sidebar state={state} onRefine={refine} />

      <main className="main">
        <header className="main-header">
          <div>
            <h1 className="greeting">Good afternoon</h1>
            <p className="greeting-sub">Your session adapts as you listen</p>
          </div>
          <span className="device-pill">{state.deviceType}</span>
        </header>

        <PlayerBar
          track={nowPlaying}
          onSkip={(sec) => skip(nowPlaying.id, sec)}
          onLike={() => like(nowPlaying.id)}
          onSave={() => save(nowPlaying.id)}
          onReplay={() => replay(nowPlaying.id)}
          onPreviewComplete={() => listenComplete(nowPlaying.id)}
        />

        <TrackList
          tracks={state.recommendations}
          nowPlayingId={nowPlayingId}
          listKey={listKey}
          onPlay={play}
        />
      </main>
    </div>
  );
}

export default App;
