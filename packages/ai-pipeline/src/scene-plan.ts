import type { ScenePlan } from '@shipreel/shared-types'
import type { ScenePlanInput } from './types'
import { generateHook } from './hook-generator'

export async function generateScenePlan(
  input: ScenePlanInput
): Promise<ScenePlan> {
  const hook = await generateHook({
    transcription: input.transcription,
    changelog: input.changelog,
  })

  const prompt = buildScenePlanPrompt(input, hook)
  const llmOutput = await queryLLM(prompt, hook)
  return parseLLMResponse(llmOutput, hook)
}

function buildScenePlanPrompt(input: ScenePlanInput, hook: string): string {
  return `You are a video editing AI. Given a transcription and scene changes, generate a JSON scene plan.

HOOK: "${hook}"

TRANSCRIPTION: "${input.transcription}"

TIMELINE CUES (seconds):
${input.detectedScenes
  .map((s) => `  ${s.start}s-${s.end}s: ${s.type}`)
  .join('\n')}

${input.changelog ? `CHANGELOG/FEATURES:\n${input.changelog}` : ''}

Generate a ScenePlan JSON with:
- "hook": the viral hook text
- "scenes": array of { start, end, caption, zoom (bool), cursorX?, cursorY?, click?, transition? }
- "totalDuration": total seconds
- "pacing": brief description

Output ONLY valid JSON, no markdown, no explanation.`
}

async function queryLLM(prompt: string, hook: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.warn('[scene-plan] No OPENROUTER_API_KEY set, using placeholder')
    return fallbackResponse(hook)
  }

  try {
    const res = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`[scene-plan] OpenRouter API error (${res.status}): ${errText}`)
      return fallbackResponse(hook)
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text) {
      console.warn('[scene-plan] Empty OpenRouter response, using placeholder')
      return fallbackResponse(hook)
    }

    return text
  } catch (err) {
    console.warn(`[scene-plan] OpenRouter call failed: ${err}, using placeholder`)
    return fallbackResponse(hook)
  }
}

function fallbackResponse(hook: string): string {
  return JSON.stringify({
    hook,
    scenes: [
      { start: 0, end: 4, caption: 'Introducing the future of onboarding', zoom: true, transition: 'fade' },
      { start: 4, end: 8, caption: 'One click to get started', zoom: false, click: true },
      { start: 8, end: 12, caption: 'See the magic happen in real time', zoom: true, cursorX: 0.5, cursorY: 0.3 },
    ],
    totalDuration: 12,
    pacing: 'Fast-paced with hook intro and feature spotlight',
  })
}

function parseLLMResponse(raw: string, hook: string): ScenePlan {
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    return {
      hook: parsed.hook || hook,
      scenes: parsed.scenes || [],
      totalDuration: parsed.totalDuration || 30,
      pacing: parsed.pacing,
    }
  } catch {
    console.warn('[scene-plan] Failed to parse LLM response, using placeholder')
    return JSON.parse(fallbackResponse(hook))
  }
}
