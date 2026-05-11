"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHook = generateHook;
async function generateHook(input) {
    const prompt = buildHookPrompt(input);
    const result = await queryHookLLM(prompt);
    return result;
}
function buildHookPrompt(input) {
    return `Generate a short, punchy viral hook (max 8 words) for a product launch video.

Transcription: "${input.transcription}"
${input.changelog ? `Features: ${input.changelog}` : ''}

The hook should be attention-grabbing like "Your onboarding just became instant" or "Stop wasting time on manual workflows".

Return ONLY the hook text, no quotes, no explanation.`;
}
async function queryHookLLM(prompt) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn('[hook-generator] No OPENROUTER_API_KEY set, using placeholder');
        return 'Your onboarding just became instant';
    }
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'google/gemini-3-flash-preview',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.9,
            }),
        });
        if (!res.ok) {
            const errText = await res.text();
            console.warn(`[hook-generator] OpenRouter API error (${res.status}): ${errText}`);
            return 'Your onboarding just became instant';
        }
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text) {
            console.warn('[hook-generator] Empty OpenRouter response, using placeholder');
            return 'Your onboarding just became instant';
        }
        return text.trim().replace(/^["']|["']$/g, '');
    }
    catch (err) {
        console.warn(`[hook-generator] OpenRouter call failed: ${err}, using placeholder`);
        return 'Your onboarding just became instant';
    }
}
