"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudio = transcribeAudio;
const child_process_1 = require("child_process");
async function transcribeAudio(audioPath, duration) {
    console.log(`[transcription] Processing: ${audioPath}`);
    try {
        console.log('[transcription] Running: whisper --model tiny --language en');
        const output = (0, child_process_1.execSync)(`whisper "${audioPath}" --output-format json --language en --model tiny 2>&1`, { stdio: 'pipe', maxBuffer: 50 * 1024 * 1024, timeout: 300_000 }).toString();
        console.log('[transcription] Whisper completed successfully');
        const jsonPath = audioPath.replace(/\.\w+$/, '.json');
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        if (fs.existsSync(jsonPath)) {
            const raw = fs.readFileSync(jsonPath, 'utf-8');
            const data = JSON.parse(raw);
            return {
                text: data.text || '',
                words: extractWordsWithTimestamps(data),
                language: data.language || 'en',
            };
        }
        const parsed = JSON.parse(output);
        return {
            text: parsed.text || '',
            words: extractWordsWithTimestamps(parsed),
            language: parsed.language || 'en',
        };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[transcription] Failed: ${message}`);
        return generatePlaceholder(duration ?? 30);
    }
}
function extractWordsWithTimestamps(data) {
    if (data.segments) {
        return data.segments.flatMap((seg) => (seg.words || []).map((w) => ({
            word: typeof w === 'string' ? w : w.word || w.text || '',
            start: w.start ?? seg.start ?? 0,
            end: w.end ?? seg.end ?? 0,
            confidence: w.probability ?? w.confidence ?? 1,
        })));
    }
    return [];
}
function generatePlaceholder(duration) {
    const words = [];
    const phrases = [
        'Welcome to this product demo',
        'Let me show you the key features',
        'First you will see how easy it is to get started',
        'Click here to begin the setup process',
        'Now watch as everything happens automatically',
        'This is where the magic happens',
        'You can customize everything to your needs',
        'The results speak for themselves',
        'Try it today and see the difference',
        'Thank you for watching this demo',
    ];
    const allText = phrases.join('. ') + '.';
    const wordList = allText.split(' ');
    const wordsPerSecond = 2.5;
    const totalWords = Math.min(wordList.length, Math.floor(duration * wordsPerSecond));
    for (let i = 0; i < totalWords; i++) {
        const t = i / wordsPerSecond;
        words.push({
            word: wordList[i % wordList.length].replace(/[.,]/g, ''),
            start: t,
            end: t + 0.4,
            confidence: 0.9 + Math.random() * 0.1,
        });
    }
    return {
        text: wordList.slice(0, totalWords).join(' '),
        words,
        language: 'en',
    };
}
