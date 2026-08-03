import path from 'path'
import { mkdirSync, unlinkSync, renameSync } from 'fs'
import type { Project, ProjectStatus } from '@shipreel/shared-types'
import { transcribeAudio } from './transcription'
import { extractAudio, getVideoMetadata, detectScenes, addSoundEffects } from './ffmpeg'
import { renderReel } from './renderer'
import { generateScenePlan, generateHook, analyzeVideoScenes } from '@shipreel/ai-pipeline'

type StatusUpdate = (status: ProjectStatus, data?: Partial<Project>) => void

export async function runPipeline(
  project: Project,
  videoPath: string,
  onStatus: StatusUpdate
): Promise<void> {
  try {
    onStatus('processing')
    const metadata = getVideoMetadata(videoPath)
    console.log(
      `[pipeline] Video: ${metadata.duration}s, ${metadata.fps}fps, ${metadata.width}x${metadata.height}`
    )

    // Audio extraction + transcription (skipped if FFmpeg unavailable)
    onStatus('processing')
    const audioPath = extractAudio(videoPath)

    onStatus('transcribing')
    const transcription = await transcribeAudio(
      audioPath ?? videoPath,
      metadata.duration
    )

    onStatus('transcribing')
    const sceneDetection = await detectScenes(videoPath)
    console.log(`[pipeline] Detected ${sceneDetection.scenes.length} scene events`)

    // Video understanding — extract frames and analyze with vision model
    onStatus('generating')
    console.log(`[pipeline] Analyzing video scenes with vision model...`)
    const sceneDescriptions = await analyzeVideoScenes(videoPath, sceneDetection.scenes)
    if (sceneDescriptions.length > 0) {
      console.log(`[pipeline] Got ${sceneDescriptions.length} scene descriptions`)
      sceneDescriptions.forEach((sd) => console.log(`  Scene ${sd.sceneIndex}: ${sd.description.slice(0, 60)}...`))
    }

    onStatus('generating')
    const hook = await generateHook({
      transcription: transcription.text,
      changelog: project.changelog,
    })
    console.log(`[pipeline] Hook: "${hook}"`)

    onStatus('generating')
    const scenePlan = await generateScenePlan({
      transcription: transcription.text,
      words: transcription.words,
      detectedScenes: sceneDetection.scenes,
      changelog: project.changelog,
      outputDuration: Math.min(metadata.duration, 60),
      sceneDescriptions: sceneDescriptions.length > 0 ? sceneDescriptions : undefined,
    })
    scenePlan.hook = hook

    // Update scene descriptions on the plan from vision analysis
    if (sceneDescriptions.length > 0) {
      for (const sd of sceneDescriptions) {
        const scene = scenePlan.scenes[sd.sceneIndex]
        if (scene) {
          scene.sceneDescription = sd.description
          if (sd.attentionX !== undefined) scene.cursorX ??= sd.attentionX
          if (sd.attentionY !== undefined) scene.cursorY ??= sd.attentionY
        }
      }
    }

    onStatus('generating', { scenePlan, words: transcription.words })

    onStatus('rendering')
    const outputDir = path.resolve(__dirname, '../../output')
    mkdirSync(outputDir, { recursive: true })

    const outputPath = path.join(outputDir, `${project.id}.mp4`)
    const screenRecordingUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${path.basename(videoPath)}`

    await renderReel(scenePlan, screenRecordingUrl, outputPath)

    // Add sound effects — click sounds and transition swooshes
    onStatus('rendering')
    const sfxPath = addSoundEffects(outputPath, scenePlan.scenes, outputPath)
    if (sfxPath && sfxPath !== outputPath) {
      unlinkSync(outputPath)
      renameSync(sfxPath, outputPath)
    }

    const renderedVideoUrl = `/output/${project.id}.mp4`
    onStatus('complete', {
      scenePlan,
      renderedVideoUrl,
      transcription: transcription.text,
      words: transcription.words,
    })
  } catch (err) {
    console.error('[pipeline] Error:', err)
    onStatus('error', {
      transcription: `Pipeline error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
