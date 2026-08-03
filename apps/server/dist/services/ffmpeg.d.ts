declare const CMD_TIMEOUT = 10000;
export declare function extractAudio(videoPath: string): string | null;
export declare function getVideoMetadata(videoPath: string): {
    duration: number;
    fps: number;
    width: number;
    height: number;
};
export declare function detectScenes(videoPath: string): Promise<{
    scenes: Array<{
        start: number;
        end: number;
        type: 'scene_change' | 'cursor_move' | 'click' | 'quiet';
    }>;
}>;
export { CMD_TIMEOUT };
export declare function extractSceneFrames(videoPath: string, scenes: {
    start: number;
    end: number;
}[]): {
    sceneIndex: number;
    filePath: string;
}[];
export declare function addSoundEffects(videoPath: string, scenes: {
    start: number;
    click?: boolean;
    transition?: string;
}[], outputPath: string): string | null;
