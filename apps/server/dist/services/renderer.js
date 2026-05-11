"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderReel = renderReel;
const path_1 = __importDefault(require("path"));
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const REEL_WIDTH = 393;
const REEL_HEIGHT = 698;
const FPS = 30;
async function renderReel(scenePlan, screenRecordingSrc, outputPath) {
    const entryPoint = path_1.default.resolve(__dirname, '../../../../packages/video-engine/src/Root.tsx');
    console.log(`[renderer] Bundling entry point: ${entryPoint}`);
    const serveUrl = await (0, bundler_1.bundle)({
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
    const composition = await (0, renderer_1.selectComposition)({
        serveUrl,
        id: 'ReelComposition',
        inputProps,
    });
    composition.width = REEL_WIDTH;
    composition.height = REEL_HEIGHT;
    composition.fps = FPS;
    composition.durationInFrames = Math.ceil(scenePlan.totalDuration * FPS);
    console.log(`[renderer] Rendering ${composition.durationInFrames} frames to: ${outputPath}`);
    await (0, renderer_1.renderMedia)({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps,
        chromiumOptions: {
            enableMultiProcessOnLinux: false,
            gl: 'swangle',
        },
    });
    console.log(`[renderer] Done: ${outputPath}`);
    return outputPath;
}
