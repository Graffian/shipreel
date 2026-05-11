import path from 'path';
import { mkdirSync } from 'fs';
import { transcribeAudio } from './transcription';
import { extractAudio, getVideoMetadata, detectScenes } from './ffmpeg';
import { renderReel } from './renderer';
import { generateScenePlan, generateHook } from '@shipreel/ai-pipeline';
export async function runPipeline(project, videoPath, onStatus) {
    try {
        onStatus('processing');
        const metadata = getVideoMetadata(videoPath);
        console.log(`[pipeline] Video: ${metadata.duration}s, ${metadata.fps}fps, ${metadata.width}x${metadata.height}`);
        // Audio extraction + transcription (skipped if FFmpeg unavailable)
        onStatus('processing');
        const audioPath = extractAudio(videoPath);
        onStatus('transcribing');
        const transcription = await transcribeAudio(audioPath ?? videoPath, metadata.duration);
        onStatus('transcribing');
        const sceneDetection = await detectScenes(videoPath);
        console.log(`[pipeline] Detected ${sceneDetection.scenes.length} scene events`);
        onStatus('generating');
        const hook = await generateHook({
            transcription: transcription.text,
            changelog: project.changelog,
        });
        console.log(`[pipeline] Hook: "${hook}"`);
        onStatus('generating');
        const scenePlan = await generateScenePlan({
            transcription: transcription.text,
            words: transcription.words,
            detectedScenes: sceneDetection.scenes,
            changelog: project.changelog,
            outputDuration: Math.min(metadata.duration, 60),
        });
        scenePlan.hook = hook;
        onStatus('generating', { scenePlan, words: transcription.words });
        onStatus('rendering');
        const outputDir = path.resolve(__dirname, '../../output');
        mkdirSync(outputDir, { recursive: true });
        const outputPath = path.join(outputDir, `${project.id}.mp4`);
        const screenRecordingUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${path.basename(videoPath)}`;
        await renderReel(scenePlan, screenRecordingUrl, outputPath);
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
