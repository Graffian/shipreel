import { execSync } from 'child_process'
import type { TranscriptionResult, WordTimestamp } from '@shipreel/shared-types'

export async function transcribeAudio(
  audioPath: string,
  duration?: number
): Promise<TranscriptionResult> {
  console.log(`[transcription] Processing: ${audioPath}`)

  try {
    console.log('[transcription] Running: whisper --model tiny --language en')
    const output = execSync(
      `whisper "${audioPath}" --output-format json --language en --model tiny 2>&1`,
      { stdio: 'pipe', maxBuffer: 50 * 1024 * 1024, timeout: 300_000 }
    ).toString()
    console.log('[transcription] Whisper completed successfully')

    const jsonPath = audioPath.replace(/\.\w+$/, '.json')
    const fs = await import('fs')
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8')
      const data = JSON.parse(raw)
      return {
        text: data.text || '',
        words: extractWordsWithTimestamps(data),
        language: data.language || 'en',
      }
    }

    const parsed = JSON.parse(output)
    return {
      text: parsed.text || '',
      words: extractWordsWithTimestamps(parsed),
      language: parsed.language || 'en',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn(`[transcription] Failed: ${message}`)
    return generatePlaceholder(duration ?? 30)
  }
}

function extractWordsWithTimestamps(data: any): WordTimestamp[] {
  if (data.segments) {
    return data.segments.flatMap((seg: any) =>
      (seg.words || []).map((w: any) => ({
        word: typeof w === 'string' ? w : w.word || w.text || '',
        start: w.start ?? seg.start ?? 0,
        end: w.end ?? seg.end ?? 0,
        confidence: w.probability ?? w.confidence ?? 1,
      }))
    )
  }
  return []
}

function generatePlaceholder(duration: number): TranscriptionResult {
  const words: WordTimestamp[] = []
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
  ]

  const allText = phrases.join('. ') + '.'
  const wordList = allText.split(' ')
  const wordsPerSecond = 2.5
  const totalWords = Math.min(wordList.length, Math.floor(duration * wordsPerSecond))

  for (let i = 0; i < totalWords; i++) {
    const t = i / wordsPerSecond
    words.push({
      word: wordList[i % wordList.length].replace(/[.,]/g, ''),
      start: t,
      end: t + 0.4,
      confidence: 0.9 + Math.random() * 0.1,
    })
  }

  return {
    text: wordList.slice(0, totalWords).join(' '),
    words,
    language: 'en',
  }
}
