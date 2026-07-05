# Backend deployment (free alternatives)

Frontend stays on **Vercel**. Pick one backend host below.

---

## Recommended: Koyeb (easiest Railway replacement)

**Free tier:** 1 nano web service · no cold-start sleep · GitHub deploy · [koyeb.com](https://www.koyeb.com)

### Setup

1. [koyeb.com](https://www.koyeb.com) → **Create App** → **GitHub** → select **Spotify-Moments-MVP**
2. **Service type:** Web service
3. **Builder:** Dockerfile
4. **Dockerfile path:** `spotify-moment/server/Dockerfile`
5. **Root directory / work directory:** `spotify-moment/server` *(if Koyeb asks)*
6. **Port:** `8000` *(Koyeb default — app reads `process.env.PORT` automatically)*
7. **Environment variables:**

   | Key | Value |
   |-----|-------|
   | `OPENAI_API_KEY` | your key |
   | `CLIENT_URL` | your Vercel URL |

8. Deploy → copy public URL, e.g. `https://your-app.koyeb.app`

### Verify

```text
https://YOUR-APP.koyeb.app/health
https://YOUR-APP.koyeb.app/api/session/start   (POST)
```

### Vercel

Set `VITE_API_URL` = `https://YOUR-APP.koyeb.app` → **Redeploy**

---

## Option 2: Fly.io

**Free tier:** small shared VM · may require card for verification · very reliable · [fly.io](https://fly.io)

### Setup

```bash
# Install flyctl: https://fly.io/docs/flyctl/install/
cd spotify-moment/server
fly launch          # follow prompts, use existing fly.toml
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set CLIENT_URL=https://your-app.vercel.app
fly deploy
```

URL: `https://spotify-moment-api.fly.dev` (or your chosen app name)

Set `VITE_API_URL` on Vercel to that URL → redeploy.

---

## Option 3: All-in on Vercel (no separate backend)

Keep frontend on Vercel and move the API to Vercel Serverless — requires refactoring Express into serverless handlers. Not set up in this repo yet; use Koyeb or Fly.io for the fastest path.

---

## Platform comparison

| Platform | Free tier | Ease | Notes |
|----------|-----------|------|-------|
| **Koyeb** | 1 nano service | ⭐ Easiest | Dockerfile + GitHub, similar to Railway |
| **Fly.io** | Small VM | Medium | CLI deploy, very stable |
| Railway | Trial / limited | Medium | Config-sensitive (see RAILWAY.md) |
| Render | Often asks for payment | Easy | Manual Web Service (not Blueprint) may work |

---

## Docker (local test)

```bash
cd spotify-moment/server
docker build -t spotify-moment-api .
docker run -p 3001:3001 -e OPENAI_API_KEY=sk-... spotify-moment-api
curl http://localhost:3001/health
```
