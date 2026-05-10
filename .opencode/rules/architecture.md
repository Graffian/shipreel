# ShipReel Architecture

## Overview

ShipReel transforms product screen recordings into polished 9:16 vertical launch reels. The architecture follows a **JSON-driven rendering pipeline**: AI generates structured scene plans, and Remotion renders them deterministically. No AI-generated video code.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 App Router, TailwindCSS v4, lucide-react |
| Backend | Express.js 4, multer, cors |
| AI | OpenRouter API (gemini-2.0-flash-lite-preview) / Whisper |
| Rendering | Remotion 4.0, @remotion/renderer, @remotion/bundler |
| Video | FFmpeg (audio extraction, scene detection) |
| Language | TypeScript everywhere |

## Monorepo Structure

```
shipreel/
├── apps/
│   ├── web/              # Next.js 16 App Router
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── layout.tsx            # Root layout with nav
│   │   │   ├── globals.css           # Tailwind + custom theme
│   │   │   ├── upload/page.tsx       # Drag-and-drop upload form
│   │   │   ├── dashboard/page.tsx    # Project list
│   │   │   └── projects/[id]/page.tsx # Project detail + player
│   │   ├── components/
│   │   │   ├── CaptionEditor.tsx     # Scene-by-scene caption editing
│   │   │   └── ProcessingStatus.tsx  # Status indicator component
│   │   └── lib/
│   │       └── api.ts               # API client (fetch wrapper)
│   └── server/
│       ├── src/
│       │   ├── index.ts             # Express entry, static serving
│       │   ├── routes/
│       │   │   ├── upload.ts        # Multipart upload + pipeline trigger
│       │   │   ├── projects.ts      # CRUD for projects (in-memory store)
│       │   │   └── render.ts        # Render job management
│       │   └── services/
│       │       ├── pipeline.ts      # Pipeline orchestrator (7 steps)
│       │       ├── ffmpeg.ts        # FFmpeg wrappers + ffprobe fallback
│       │       ├── transcription.ts # Whisper CLI wrapper + placeholder
│       │       └── renderer.ts      # Remotion server-side renderer
│       ├── uploads/                 # Uploaded video files
│       └── output/                  # Rendered MP4 files
├── packages/
│   ├── shared-types/
│   │   └── src/index.ts            # All TypeScript interfaces
│   ├── ai-pipeline/
│   │   └── src/
│   │       ├── index.ts            # Public exports
│   │       ├── types.ts            # Internal types
│   │       ├── hook-generator.ts   # Viral hook generation (OpenRouter)
│   │       ├── scene-detection.ts  # Scene event detection
│   │       └── scene-plan.ts       # ScenePlan JSON generation (OpenRouter)
│   └── video-engine/
│       └── src/
│           ├── index.ts            # Public exports
│           ├── Root.tsx            # Remotion entry (registerRoot + Composition)
│           ├── compositions/
│           │   └── ReelComposition.tsx  # Main reel (uses useCurrentFrame)
│           ├── components/
│           │   ├── HookIntro.tsx    # Gradient intro card
│           │   ├── CaptionOverlay.tsx # Bottom-third animated captions
│           │   └── ZoomLayer.tsx    # Cursor-follow auto-zoom (OffthreadVideo)
│           └── utils/
│               └── useTimeline.ts  # Scene selection by current time
└── .opencode/rules/
    └── architecture.md             # This file
```

## Core Types (shared-types)

```typescript
Scene          { start, end, caption, zoom, cursorX?, cursorY?, click?, transition? }
ScenePlan      { hook, scenes[], totalDuration, pacing? }
Project        { id, title, status, ..., scenePlan?, renderedVideoUrl?, words? }
WordTimestamp  { word, start, end, confidence }
ProjectStatus  'uploading' | 'processing' | 'transcribing' | 'generating' | 'rendering' | 'complete' | 'error'
```

## Pipeline Flow

```
Upload (web POST /api/upload/screen-recording)
  │
  ├─ multer saves file → apps/server/uploads/{uuid}.mp4
  ├─ createProject() → in-memory Map (status: "uploading")
  └─ runPipeline() starts ASYNC, response returns immediately
       │
       ▼
  Step 1: getVideoMetadata(videoPath)
          ├─ Primary: ffprobe → JSON parse → { duration, fps, width, height }
          ├─ Fallback: ffmpeg -i → regex parse Duration:/Stream lines
          └─ Final: return { 30, 30, 1920, 1080 }
       │
       ▼
  Step 2: extractAudio(videoPath)
          ├─ ffmpeg -i ... -vn -acodec libmp3lame → .mp3
          └─ On failure: return null (skip)
       │
       ▼
  Step 3: transcribeAudio(audioPath, duration)
          ├─ whisper CLI → JSON with words[] and timestamps
          └─ On failure: generatePlaceholder(duration) → mock words at ~2.5 words/sec
       │
       ▼
  Step 4: detectScenes(videoPath)
          ├─ ffmpeg scene detection filter → parse pts_time values
          └─ On failure: 3 mock scenes (0-4s, 4-8s, 8-12s)
       │
       ▼
  Step 5: generateHook({ transcription, changelog })
          ├─ OpenRouter (gemini-2.0-flash-lite-preview) → returns viral hook
          └─ On failure/no key: "Your onboarding just became instant"
       │
       ▼
  Step 6: generateScenePlan({ transcription, words, scenes, changelog })
          ├─ OpenRouter (gemini-2.0-flash-lite-preview) → returns ScenePlan JSON
          └─ On failure/no key: mock 3-scene plan
       │
       ▼
  Step 7: renderReel(scenePlan, videoUrl, outputPath)
          ├─ @remotion/bundler.bundle(Root.tsx) → Webpack bundle
          ├─ @remotion/renderer.selectComposition("ReelComposition")
          ├─ @remotion/renderer.renderMedia() → Puppeteer → Chrome → H.264 MP4
          └─ Output: apps/server/output/{projectId}.mp4
       │
       ▼
  Step 8: onStatus('complete', { renderedVideoUrl, scenePlan, words })
```

**Status progression:** `uploading → processing → transcribing → generating → rendering → complete` (or `error` at any step)

## Remotion Engine

### Entry Point (Root.tsx)

```typescript
registerRoot(ShipReelRoot)  // Mandatory for bundler

function ShipReelRoot() {
  return (
    <Composition
      id="ReelComposition"     // matched by selectComposition()
      component={ReelComposition}
      durationInFrames={60*30} // safe max (overridden by renderer)
      fps={30}
      width={393}              // 9:16 vertical
      height={698}
    />
  )
}
```

### Composition (ReelComposition.tsx)

Uses `useCurrentFrame()` + `useVideoConfig()` from Remotion to determine which scene is active. Renders three layers:
1. **HookIntro** — full-screen gradient card (shown during scene 0)
2. **ZoomLayer** — `<OffthreadVideo>` with CSS transform for cursor-follow zoom
3. **CaptionOverlay** — bottom-third bubble with animated text

### Renderer (renderer.ts)

The server-side rendering function that:
1. Bundles Root.tsx via `@remotion/bundler` (Webpack internally)
2. Selects the composition by ID "ReelComposition"
3. Overrides dimensions to 393x698 and duration from scenePlan
4. Calls `renderMedia()` which launches Chrome via Puppeteer
5. Outputs H.264 MP4

## AI Pipeline

### OpenRouter Integration

Both `hook-generator.ts` and `scene-plan.ts` call OpenRouter's `/v1/chat/completions` endpoint:

```typescript
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer sk-or-v1-...

{
  "model": "google/gemini-2.0-flash-lite-preview",  // free tier
  "messages": [{ role: "user", content: prompt }],
  "max_tokens": 2048,
  "temperature": 0.7
}
```

**Fallback chain:** API key missing → log warning → return mock data. API error → log warning → return mock data. Parse failure → log warning → return mock data.

### Prompt Design

Two separate prompts for separation of concerns:
- **hook-generator**: Returns a short viral hook (max 8 words)
- **scene-plan**: Receives hook + transcription + timeline cues → returns ScenePlan JSON

## Configuration

Environment variables in `apps/server/.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 4000 | Express server port |
| OPENROUTER_API_KEY | For AI | — | OpenRouter API key (free at openrouter.ai/keys) |

## Error Handling Strategy

1. **Every execSync is wrapped in try-catch** with a 10s timeout
2. **All pipeline steps have fallback data** — never crash, always produce output
3. **LLM calls have a 3-tier fallback**: valid response → empty response → API error → no key
4. **Pipeline errors are caught** at the top level and stored in `project.transcription` as error messages
5. **Frontend polls every 2s** and displays the error message when status is "error"

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| JSON-driven timeline | AI only generates structured data, Remotion does deterministic rendering |
| In-memory project store | No DB dependency for MVP — swap to Supabase Postgres later |
| Async pipeline | Upload returns immediately, frontend polls for status updates |
| FFmpeg -i fallback | Works with just ffmpeg.exe, no ffprobe needed on Windows |
| OpenRouter over Ollama | No local model download, free credits available, OpenAI-compatible |
| mock data fallbacks | Pipeline never crashes — can demo UI flow without any external tools |

## Extending

### Add a new AI provider
Swap the `fetch()` calls in `hook-generator.ts` and `scene-plan.ts` to any OpenAI-compatible API (OpenAI, Anthropic via OpenRouter, local Ollama, etc.).

### Add persistent storage
Replace the `Map<string, Project>` in `projects.ts` with Supabase queries. The `Project` type already has all fields needed.

### Add a new Remotion effect
Create a new component in `packages/video-engine/src/components/`, add it to `ReelComposition.tsx`, and add the control fields to the `Scene` type.
