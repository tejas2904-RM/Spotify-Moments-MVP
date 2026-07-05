# Spotify Moment

MVP prototype for session-aware Spotify recommendations.

## Current status

### Phase 0 ✓
- Express server with session API routes
- In-memory session store
- Mock data: 24 tracks, taste profile, artist adjacency map

### Phase 1 ✓
- Context engine: signal → energy bias → re-rank queue
- LLM enrichment (OpenAI / Gemini) with keyword fallback
- Refine session: natural language → session-only constraints
- Client: player controls, track reasons, analysis overlay

### Phase 2 ✓
- Every 4th recommendation is a labelled Discovery Track
- Exploration level adjusts on like/save vs quick skip
- Toasts: "Exploration Increased" / "Returning to familiar music"
- Exploration meter + Familiar ↔ Discovery bar in UI

### Phase 3 ✓
- Artist play counts tracked; fatigue at 3+ plays
- Repeats swapped for adjacent artists (e.g. Taylor Swift → Sabrina Carpenter)
- Insight banner when fatigue triggers
- Swap rows highlighted in amber in the track list

### Phase 4 ✓
- Figma-aligned UI: sidebar `#000`, main `#121212`, cards `#181818`
- Design tokens in `client/src/styles/tokens.css`
- Component split: Sidebar, PlayerBar, TrackList, ContextCard, etc.
- Spotify green `#1ed760` for actions; pill buttons; row hover `#282828`

### Phase 5 — Deploy backend (Railway)
See [../Docs/implementation.md](../Docs/implementation.md#9-phase-5--deploy-backend-on-railway)

**Railway settings:** Root Directory `spotify-moment/server` · Variables `OPENAI_API_KEY`, `CLIENT_URL` · Generate public domain

### Phase 6 — Deploy frontend (Vercel)
See [../Docs/implementation.md](../Docs/implementation.md#10-phase-6--deploy-frontend-on-vercel)

## Quick start

**One command (recommended)** — starts backend + frontend together:

```bash
cd spotify-moment
npm run install:all   # first time only
npm run dev
```

Then open **http://localhost:5173**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api/health |
| Session API | http://localhost:3001/api/session/start |

**Or two terminals:**

```bash
# Terminal 1 — server (must run first)
cd spotify-moment/server
npm install
npm run dev

# Terminal 2 — client
cd spotify-moment/client
npm install
npm run dev
```

> The frontend proxies `/api` → `localhost:3001` in dev. If the UI shows a connection error, the backend is not running.

## API (Phase 0)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/session/start` | Create session, return state |
| POST | `/api/session/signal` | Player action (stub) |
| POST | `/api/session/refine` | NL refine (stub) |
| GET | `/api/session` | Latest session state |

## Project structure

```
spotify-moment/
├── server/          # Express + session engine
├── client/          # Vite + React
└── README.md
```

See [../Docs/architecture.md](../Docs/architecture.md) and [../Docs/implementation.md](../Docs/implementation.md).
