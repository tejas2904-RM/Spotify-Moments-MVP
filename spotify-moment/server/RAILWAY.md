# Railway deployment

## Option A — Root Directory empty (recommended)

| Setting | Value |
|---------|-------|
| **Root Directory** | *(leave empty)* |
| **Config file** | `railway.json` (repo root) |
| **Start command** | *(from config)* `npm start --prefix spotify-moment/server` |

## Option B — Root Directory = server folder

| Setting | Value |
|---------|-------|
| **Root Directory** | `spotify-moment/server` |
| **Config file** | `/spotify-moment/server/railway.json` |
| **Start command** | *(from config)* `npm start` |

> **Do not mix:** If Root Directory is `spotify-moment/server`, do **not** use the repo-root `railway.json` start command (`npm start --prefix ...`) — that breaks the deploy.

## Verify

```text
https://YOUR-APP.up.railway.app/health
https://YOUR-APP.up.railway.app/api/health
```

Both should return JSON with `"ok": true` and `"tracks": 24`.

If you see `Cannot GET /health`, the wrong start command is running — fix Root Directory + config file above, then redeploy.
