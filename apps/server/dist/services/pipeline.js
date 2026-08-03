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
        // Video understanding — extract frames and analyze with vision model
        onStatus('generating');
        console.log(`[pipeline] Analyzing video scenes with vision model...`);
        const sceneDescriptions = await (0, ai_pipeline_1.analyzeVideoScenes)(videoPath, sceneDetection.scenes);
        if (sceneDescriptions.length > 0) {
            console.log(`[pipeline] Got ${sceneDescriptions.length} scene descriptions`);
            sceneDescriptions.forEach((sd) => console.log(`  Scene ${sd.sceneIndex}: ${sd.description.slice(0, 60)}...`));
        }
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
            sceneDescriptions: sceneDescriptions.length > 0 ? sceneDescriptions : undefined,
        });
        scenePlan.hook = hook;
        // Update scene descriptions on the plan from vision analysis
        if (sceneDescriptions.length > 0) {
            for (const sd of sceneDescriptions) {
                const scene = scenePlan.scenes[sd.sceneIndex];
                if (scene) {
                    scene.sceneDescription = sd.description;
                    if (sd.attentionX !== undefined)
                        scene.cursorX ??= sd.attentionX;
                    if (sd.attentionY !== undefined)
                        scene.cursorY ??= sd.attentionY;
                }
            }
        }
        onStatus('generating', { scenePlan, words: transcription.words });
        onStatus('rendering');
        const outputDir = path_1.default.resolve(__dirname, '../../output');
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
        const outputPath = path_1.default.join(outputDir, `${project.id}.mp4`);
        const screenRecordingUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${path_1.default.basename(videoPath)}`;
        await (0, renderer_1.renderReel)(scenePlan, screenRecordingUrl, outputPath);
        // Add sound effects — click sounds and transition swooshes
        onStatus('rendering');
        const sfxPath = (0, ffmpeg_1.addSoundEffects)(outputPath, scenePlan.scenes, outputPath);
        if (sfxPath && sfxPath !== outputPath) {
            (0, fs_1.unlinkSync)(outputPath);
            (0, fs_1.renameSync)(sfxPath, outputPath);
        }
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
