import type { SceneDescription } from './types';
export declare function analyzeVideoScenes(videoPath: string, scenes: {
    start: number;
    end: number;
}[], tmpDir?: string): Promise<SceneDescription[]>;
