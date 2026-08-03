"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeVideoScenes = analyzeVideoScenes;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function extractFrames(videoPath, scenes, outputDir) {
    const frames = [];
    for (let i = 0; i < scenes.length; i++) {
        const mid = (scenes[i].start + scenes[i].end) / 2;
        const out = path_1.default.join(outputDir, `scene-${i}.jpg`);
        try {
            (0, child_process_1.execSync)(`ffmpeg -ss ${mid} -i "${videoPath}" -vframes 1 -q:v 2 "${out}" -y`, { timeout: 10000, stdio: 'pipe' });
            frames.push({ sceneIndex: i, filePath: out });
        }
        catch {
            console.warn(`[video-understanding] Failed to extract frame at ${mid}s`);
        }
    }
    return frames;
}
function encodeFrame(filePath) {
    try {
        const buf = (0, fs_1.readFileSync)(filePath);
        return buf.toString('base64');
    }
    catch {
        return null;
    }
}
async function queryVisionModel(base64Images) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn('[video-understanding] No OPENROUTER_API_KEY, using placeholder descriptions');
        return base64Images.map(() => 'Screen recording scene');
    }
    const results = [];
    for (let i = 0; i < base64Images.length; i++) {
        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.0-flash-lite-preview',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Describe what is happening in this screen recording frame. What UI elements, features, or actions are visible? Where is the user\'s attention focused? Reply in 1-2 sentences.',
                                },
                                {
                                    type: 'image_url',
                                    image_url: { url: `data:image/jpeg;base64,${base64Images[i]}` },
                                },
                            ],
                        },
                    ],
                    max_tokens: 256,
                }),
            });
            if (!res.ok) {
                console.warn(`[video-understanding] Vision API error (${res.status}), using placeholder`);
                results.push('Screen recording scene');
                continue;
            }
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            results.push(text?.trim() || 'Screen recording scene');
        }
        catch (err) {
            console.warn(`[video-understanding] Vision call failed: ${err}`);
            results.push('Screen recording scene');
        }
    }
    return results;
}
function parseDescriptions(scenes, descriptions) {
    return scenes.map((scene, i) => {
        const desc = descriptions[i] || '';
        return {
            sceneIndex: i,
            start: scene.start,
            end: scene.end,
            description: desc,
            visibleFeatures: desc ? [desc] : [],
            hasInteraction: desc.toLowerCase().includes('click') || desc.toLowerCase().includes('button'),
            attentionX: desc.toLowerCase().includes('left') ? 0.3 : desc.toLowerCase().includes('right') ? 0.7 : undefined,
            attentionY: desc.toLowerCase().includes('top') ? 0.3 : desc.toLowerCase().includes('bottom') ? 0.7 : undefined,
        };
    });
}
async function analyzeVideoScenes(videoPath, scenes, tmpDir) {
    const workDir = tmpDir || path_1.default.dirname(videoPath);
    const frameDir = path_1.default.join(workDir, 'frames');
    (0, fs_1.mkdirSync)(frameDir, { recursive: true });
    const frames = extractFrames(videoPath, scenes, frameDir);
    if (frames.length === 0) {
        console.warn('[video-understanding] No frames extracted');
        return [];
    }
    const base64Images = [];
    for (const f of frames) {
        const encoded = encodeFrame(f.filePath);
        if (encoded)
            base64Images.push(encoded);
    }
    const descriptions = await queryVisionModel(base64Images);
    // Cleanup temp frames
    try {
        (0, fs_1.rmSync)(frameDir, { recursive: true, force: true });
    }
    catch { /* ignore */ }
    return parseDescriptions(scenes, descriptions);
}
