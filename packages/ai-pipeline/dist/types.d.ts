import type { WordTimestamp } from '@shipreel/shared-types';
export interface ScenePlanInput {
    transcription: string;
    words: WordTimestamp[];
    detectedScenes: Array<{
        start: number;
        end: number;
        type: 'scene_change' | 'cursor_move' | 'click' | 'quiet';
    }>;
    changelog?: string;
    outputDuration: number;
    /** Per-scene visual descriptions from vision model */
    sceneDescriptions?: SceneDescription[];
}
export interface SceneDescription {
    sceneIndex: number;
    start: number;
    end: number;
    description: string;
    /** Detected UI elements or features visible */
    visibleFeatures: string[];
    /** Where the cursor/action is focused (normalized 0-1) */
    attentionX?: number;
    attentionY?: number;
    /** Whether this scene contains an important UI interaction */
    hasInteraction: boolean;
}
export interface HookGenerationInput {
    transcription: string;
    changelog?: string;
    features?: string[];
}
