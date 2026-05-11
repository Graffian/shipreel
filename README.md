# ShipReel

Turn product screen recordings into polished 9:16 launch reels using AI.

## Quick Start

```bash
# Install dependencies
npm install

# Terminal 1 — Backend (Express on :4000)
npm run dev:server

# Terminal 2 — Frontend (Next.js on :3000)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) → Upload a screen recording and changelog → Watch the pipeline generate your reel.

## Prerequisites

| Tool | Required? | For |
|------|-----------|-----|
| Node.js 22+ | ✅ Yes | Runtime |
| FFmpeg | ⚠️ Recommended | Audio extraction, scene detection, metadata (`winget install ffmpeg`) |
| Chrome | ⚠️ Recommended | Remotion rendering (auto-downloaded by Puppeteer) |
| OpenRouter API key | ⚠️ Recommended | AI hook + scene plan generation ([openrouter.ai/keys](https://openrouter.ai/keys)) |
| Whisper | ❌ Optional | Real transcription (`pip install openai-whisper`) |

Without FFmpeg/Whisper/OpenRouter, the pipeline runs with **mock data** — you can still test the full UI flow.

## Project Structure

```
shipreel/
├── apps/
│   ├── web/              # Next.js 16 App Router (port 3000)
│   │   ├── app/          # Pages: /, /upload, /dashboard, /projects/[id]
│   │   ├── components/   # CaptionEditor, ProcessingStatus
│   │   └── lib/          # API client
│   └── server/           # Express.js API (port 4000)
│       ├── src/
│       │   ├── routes/   # upload, projects, render
│       │   └── services/ # pipeline, ffmpeg, transcription, renderer
│       ├── uploads/      # Uploaded videos
│       └── output/       # Rendered MP4s
├── packages/
│   ├── shared-types/     # TypeScript types (Scene, ScenePlan, Project, etc.)
│   ├── ai-pipeline/      # scene-plan, hook-generator, scene-detection
│   └── video-engine/     # Remotion compositions (ReelComposition, HookIntro, etc.)
└── .opencode/rules/      # Architecture documentation
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start Next.js frontend |
| `npm run dev:server` | Start Express backend |
| `npm run build` | Build shared-types + web app |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project by ID |
| PATCH | `/api/projects/:id` | Update project |
| POST | `/api/upload/screen-recording` | Upload video + start pipeline |
| POST | `/api/upload/inspiration-video` | Upload reference video |
| POST | `/api/render/start` | Start render job |
| GET | `/api/render/progress/:id` | Render progress |
| GET | `/uploads/:file` | Served uploaded videos |
| GET | `/output/:file` | Served rendered MP4s |

## Configuration

Copy `.env.example` → `apps/server/.env`:

```env
PORT=4000
OPENROUTER_API_KEY=sk-or-v1-...
```

Get a free OpenRouter key at [openrouter.ai/keys](https://openrouter.ai/keys).

## Deploy to Render (free tier)

1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect your repo
3. Settings:
   - **Runtime**: Docker
   - **Health Check Path**: `/api/health`
   - **Env Var**: `OPENROUTER_API_KEY` — your key from [openrouter.ai/keys](https://openrouter.ai/keys)
4. Deploy — first build takes ~5 minutes (installing Chrome + FFmpeg)
5. Open the Render URL — upload a screen recording and the pipeline runs in the same container

> **Cold starts:** The free tier sleeps after 15min of inactivity. First request after sleep takes ~30s to wake up (Chrome starts on demand during rendering).
