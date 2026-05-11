"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const transcription_1 = require("./transcription");
const ffmpeg_1 = require("./ffmpeg");
const renderer_1 = require("./renderer");
const ai_pipeline_1 = require("@shipreel/ai-pipeline");
async function runPipeline(project, videoPath, onStatus) {
    try {
        onStatus('processing');
        const metadata = (0, ffmpeg_1.getVideoMetadata)(videoPath);
        console.log(`[pipeline] Video: ${metadata.duration}s, ${metadata.fps}fps, ${metadata.width}x${metadata.height}`);
        // Audio extraction + transcription (skipped if FFmpeg unavailable)
        onStatus('processing');
        const audioPath = (0, ffmpeg_1.extractAudio)(videoPath);
        onStatus('transcribing');
        const transcription = await (0, transcription_1.transcribeAudio)(audioPath ?? videoPath, metadata.duration);
        onStatus('transcribing');
        const sceneDetection = await (0, ffmpeg_1.detectScenes)(videoPath);
        console.log(`[pipeline] Detected ${sceneDetection.scenes.length} scene events`);
        onStatus('generating');
        const hook = await (0, ai_pipeline_1.generateHook)({
            transcription: transcription.text,
            changelog: project.changelog,
        });
        console.log(`[pipeline] Hook: "${hook}"`);
        onStatus('generating');
        const scenePlan = await (0, ai_pipeline_1.generateScenePlan)({
            transcription: transcription.text,
            words: transcription.words,
            detectedScenes: sceneDetection.scenes,
            changelog: project.changelog,
            outputDuration: Math.min(metadata.duration, 60),
        });
        scenePlan.hook = hook;
        onStatus('generating', { scenePlan, words: transcription.words });
        onStatus('rendering');
        const outputDir = path_1.default.resolve(__dirname, '../../output');
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
        const outputPath = path_1.default.join(outputDir, `${project.id}.mp4`);
        const screenRecordingUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${path_1.default.basename(videoPath)}`;
        await (0, renderer_1.renderReel)(scenePlan, screenRecordingUrl, outputPath);
        const renderedVideoUrl = `/output/${project.id}.mp4`;
        onStatus('complete', {
            scenePlan,
            renderedVideoUrl,
            transcription: transcription.text,
            words: transcription.words,
        });
    }
    catch (err) {
        console.error('[pipeline] Error:', err);
        onStatus('error', {
            transcription: `Pipeline error: ${err instanceof Error ? err.message : String(err)}`,
        });
    }
}
