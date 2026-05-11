import type { SceneDetectionResult } from '@shipreel/shared-types';
/**
 * Analyzes video for scene changes, cursor movement, and clicks.
 *
 * Uses FFmpeg scene detection filters to identify hard cuts,
 * and parses cursor tracking data if available.
 *
 * Returns a timeline of detected events that the scene-plan
 * generator uses to build the Remotion timeline.
 */
export declare function detectScenes(videoPath: string): Promise<SceneDetectionResult>;
