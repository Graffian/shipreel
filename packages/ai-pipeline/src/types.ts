import type { WordTimestamp } from '@shipreel/shared-types'

export interface ScenePlanInput {
  transcription: string
  words: WordTimestamp[]
  detectedScenes: Array<{
    start: number
    end: number
    type: 'scene_change' | 'cursor_move' | 'click' | 'quiet'
  }>
  changelog?: string
  outputDuration: number
}

export interface HookGenerationInput {
  transcription: string
  changelog?: string
  features?: string[]
}
