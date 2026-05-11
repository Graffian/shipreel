"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMD_TIMEOUT = void 0;
exports.extractAudio = extractAudio;
exports.getVideoMetadata = getVideoMetadata;
exports.detectScenes = detectScenes;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const CMD_TIMEOUT = 10_000;
exports.CMD_TIMEOUT = CMD_TIMEOUT;
function extractAudio(videoPath) {
    try {
        const audioPath = videoPath.replace(path_1.default.extname(videoPath), '.mp3');
        (0, child_process_1.execSync)(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 2 "${audioPath}" -y`, { stdio: 'pipe', timeout: CMD_TIMEOUT });
        return audioPath;
    }
    catch (err) {
        console.warn(`[ffmpeg] Audio extraction failed: ${err instanceof Error ? err.message : err}`);
        return null;
    }
}
function getVideoMetadata(videoPath) {
    // Primary: ffprobe
    try {
        const output = (0, child_process_1.execSync)(`ffprobe -v error -show_entries format=duration:stream=avg_frame_rate,width,height -of json "${videoPath}"`, { stdio: 'pipe', timeout: CMD_TIMEOUT }).toString();
        const data = JSON.parse(output);
        const stream = data.streams?.[0] || {};
        const fpsParts = (stream.avg_frame_rate || '30/1').split('/');
        const fps = Number(fpsParts[0]) / Number(fpsParts[1]) || 30;
        return {
            duration: Number(data.format?.duration) || 30,
            fps,
            width: Number(stream.width) || 1920,
            height: Number(stream.height) || 1080,
        };
    }
    catch {
        console.warn('[ffmpeg] ffprobe failed, trying ffmpeg -i fallback');
    }
    // Fallback: ffmpeg -i (works with just ffmpeg.exe, no ffprobe needed)
    try {
        const output = (0, child_process_1.execSync)(`ffmpeg -i "${videoPath}" 2>&1`, { stdio: 'pipe', timeout: CMD_TIMEOUT }).toString();
        const durationMatch = output.match(/Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/);
        const duration = durationMatch
            ? Number(durationMatch[1]) * 3600 +
                Number(durationMatch[2]) * 60 +
                Number(durationMatch[3]) +
                Number(durationMatch[4]) / 100
            : 30;
        const streamMatch = output.match(/(\d+)x(\d+).*?(\d+(?:\.\d+)?)\s*fps/);
        if (streamMatch) {
            return {
                duration,
                fps: Number(streamMatch[3]) || 30,
                width: Number(streamMatch[1]),
                height: Number(streamMatch[2]),
            };
        }
        // Fallback stream parse without fps
        const resMatch = output.match(/(\d+)x(\d+)/);
        return {
            duration,
            fps: 30,
            width: resMatch ? Number(resMatch[1]) : 1920,
            height: resMatch ? Number(resMatch[2]) : 1080,
        };
    }
    catch (err) {
        console.warn(`[ffmpeg] ffmpeg not available either: ${err instanceof Error ? err.message : err}`);
        return { duration: 30, fps: 30, width: 1920, height: 1080 };
    }
}
function detectScenes(videoPath) {
    const scenes = [];
    try {
        const output = (0, child_process_1.execSync)(`ffmpeg -i "${videoPath}" -filter:v "select='gt(scene,0.4)',showinfo" -f null - 2>&1`, { stdio: 'pipe', maxBuffer: 10 * 1024 * 1024, timeout: CMD_TIMEOUT }).toString();
        const regex = /pts_time:\s*([\d.]+)/g;
        const times = [];
        let match;
        while ((match = regex.exec(output)) !== null) {
            times.push(parseFloat(match[1]));
        }
        for (let i = 0; i < times.length; i++) {
            const start = times[i];
            const end = i < times.length - 1 ? times[i + 1] : start + 5;
            scenes.push({ start, end, type: 'scene_change' });
        }
    }
    catch {
        console.warn('[ffmpeg] Scene detection unavailable, using mock data');
    }
    if (scenes.length === 0) {
        scenes.push({ start: 0, end: 4, type: 'scene_change' }, { start: 4, end: 8, type: 'scene_change' }, { start: 8, end: 12, type: 'scene_change' });
    }
    return Promise.resolve({ scenes });
}
