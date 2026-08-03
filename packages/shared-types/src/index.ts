// ─── Core Domain Types ───────────────────────────────────────────

export interface Scene {
  /** Start time in seconds */
  start: number
  /** End time in seconds */
  end: number
  /** Caption text for this scene */
  caption: string
  /** Whether to apply auto-zoom effect */
  zoom: boolean
  /** Cursor position during this scene (normalized 0-1) */
  cursorX?: number
  cursorY?: number
  /** Whether a click happened in this scene */
  click?: boolean
  /** Transition type from previous scene */
  transition?: 'fade' | 'slide' | 'cut' | 'zoom'
  /** AI description of what's happening visually in this scene */
  sceneDescription?: string
}

export interface ScenePlan {
  /** Viral hook text for intro card */
  hook: string
  /** Ordered list of scenes */
  scenes: Scene[]
  /** Total target duration in seconds */
  totalDuration: number
  /** Pacing description */
  pacing?: string
}

export type ProjectStatus =
  | 'uploading'
  | 'processing'
  | 'transcribing'
  | 'generating'
  | 'rendering'
  | 'complete'
  | 'error'

export interface Project {
  id: string
  title: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  /** Path to uploaded screen recording */
  screenRecordingUrl?: string
  /** Path to optional inspiration video */
  inspirationVideoUrl?: string
  /** User-provided changelog / feature description */
  changelog?: string
  /** AI-generated scene plan */
  scenePlan?: ScenePlan
  /** Path to rendered output */
  renderedVideoUrl?: string
  /** Raw transcription text */
  transcription?: string
  /** Per-word transcription with timestamps */
  words?: WordTimestamp[]
}

export interface WordTimestamp {
  word: string
  start: number
  end: number
  confidence: number
}

// ─── API Types ──────────────────────────────────────────────────

export interface UploadResponse {
  projectId: string
  uploadUrl: string
}

export type ProcessingEvent =
  | { type: 'uploading'; progress: number }
  | { type: 'transcribing'; progress: number }
  | { type: 'generating_scene_plan' }
  | { type: 'rendering'; progress: number }
  | { type: 'complete'; projectId: string }
  | { type: 'error'; message: string }

// ─── Video Engine Types ─────────────────────────────────────────

export interface RenderRequest {
  projectId: string
  scenePlan: ScenePlan
  screenRecordingPath: string
  outputPath: string
  fps?: number
  width?: number
  height?: number
}

export interface RenderProgress {
  frames: number
  totalFrames: number
  percentage: number
}

// ─── AI Pipeline Types ──────────────────────────────────────────

export interface TranscriptionResult {
  text: string
  words: WordTimestamp[]
  language: string
}

export interface SceneDetectionResult {
  scenes: Array<{
    start: number
    end: number
    type: 'scene_change' | 'cursor_move' | 'click' | 'quiet'
  }>
}

export interface HookGenerationInput {
  transcription: string
  changelog?: string
  features?: string[]
}

export interface ScenePlanInput {
  transcription: string
  words: WordTimestamp[]
  detectedScenes: SceneDetectionResult['scenes']
  changelog?: string
  outputDuration: number
}
