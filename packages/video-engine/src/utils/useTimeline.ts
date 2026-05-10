import type { Scene, ScenePlan } from '@shipreel/shared-types'

interface TimelineResult {
  currentScene: Scene
  sceneIndex: number
  progress: number
}

/**
 * Given a ScenePlan and current frame, determines which scene
 * is active and returns its configuration.
 *
 * Designed to be used inside a Remotion <Sequence> or <useCurrentFrame()>.
 * For non-Remotion usage (preview), accepts an optional frame param.
 */
export function useTimeline(
  scenePlan: ScenePlan,
  currentTime?: number
): TimelineResult {
  const time = currentTime ?? 0
  const sceneIndex = scenePlan.scenes.findIndex(
    (s) => time >= s.start && time < s.end
  )

  const safeIndex = sceneIndex >= 0 ? sceneIndex : 0
  const currentScene = scenePlan.scenes[safeIndex] ?? scenePlan.scenes[0]

  const sceneDuration = currentScene.end - currentScene.start
  const sceneElapsed = time - currentScene.start
  const progress = sceneDuration > 0 ? sceneElapsed / sceneDuration : 0

  return { currentScene, sceneIndex: safeIndex, progress }
}
