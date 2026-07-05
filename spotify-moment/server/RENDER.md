# Deploy backend on Render

Frontend stays on **Vercel**. Backend on **Render**.

---

## Option A — Blueprint (uses `render.yaml` at repo root)

1. [render.com](https://render.com) → **New** → **Blueprint**
2. Connect **Spotify-Moments-MVP** GitHub repo
3. **Blueprint path:** `render.yaml` (default — repo root)
4. Apply → enter `OPENAI_API_KEY` when prompted
5. After deploy, copy service URL: `https://spotify-moment-api.onrender.com`

---

## Option B — Manual Web Service (if Blueprint asks for payment)

1. **New** → **Web Service** → connect GitHub repo
2. Settings:

| Setting | Value |
|---------|-------|
| **Name** | `spotify-moment-api` |
| **Root Directory** | `spotify-moment/server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

3. **Environment Variables:**

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | your key |
| `CLIENT_URL` | your Vercel URL (after frontend deploy) |
| `NODE_VERSION` | `20` |

4. Create → wait for deploy → copy URL

---

## Verify Render

Open in browser:

```text
https://YOUR-SERVICE.onrender.com/health
https://YOUR-SERVICE.onrender.com/api/health
```

Expected:

```json
{"ok":true,"service":"spotify-moment","tracks":24,"hasOpenAiKey":true}
```

> Free tier **cold starts** after ~15 min idle — first request may take 30–60s.

---

## Connect Vercel

1. Vercel → **Settings** → **Environment Variables**
2. `VITE_API_URL` = `https://YOUR-SERVICE.onrender.com` (no trailing slash, no `/api`)
3. **Redeploy** Vercel

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot GET /health` | Wrong Root Directory — must be `spotify-moment/server` |
| Blank / JSON error on Vercel | Redeploy Vercel after setting `VITE_API_URL` |
| Slow first load | Render free tier cold start — click Retry |
| Build fails | Set `NODE_VERSION=20` in Render env |
