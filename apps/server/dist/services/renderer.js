import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
const REEL_WIDTH = 393;
const REEL_HEIGHT = 698;
const FPS = 30;
export async function renderReel(scenePlan, screenRecordingSrc, outputPath) {
    const entryPoint = path.resolve(__dirname, '../../../../packages/video-engine/src/Root.tsx');
    console.log(`[renderer] Bundling entry point: ${entryPoint}`);
    const serveUrl = await bundle({
        entryPoint,
        webpackOverride: (config) => ({
            ...config,
            resolve: {
                ...config.resolve,
                symlinks: false,
            },
        }),
    });
    const inputProps = {
        scenePlan,
        screenRecordingSrc,
    };
    console.log(`[renderer] Selecting composition`);
    const composition = await selectComposition({
        serveUrl,
        id: 'ReelComposition',
        inputProps,
    });
    composition.width = REEL_WIDTH;
    composition.height = REEL_HEIGHT;
    composition.fps = FPS;
    composition.durationInFrames = Math.ceil(scenePlan.totalDuration * FPS);
    console.log(`[renderer] Rendering ${composition.durationInFrames} frames to: ${outputPath}`);
    await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps,
    });
    console.log(`[renderer] Done: ${outputPath}`);
    return outputPath;
}
