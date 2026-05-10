import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePlan } from '@shipreel/shared-types'
import { HookIntro } from '../components/HookIntro'
import { CaptionOverlay } from '../components/CaptionOverlay'
import { ZoomLayer } from '../components/ZoomLayer'
import { useTimeline } from '../utils/useTimeline'

interface ReelCompositionProps {
  scenePlan: ScenePlan
  screenRecordingSrc: string
}

export function ReelComposition({
  scenePlan,
  screenRecordingSrc,
}: ReelCompositionProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps
  const { currentScene, sceneIndex } = useTimeline(scenePlan, currentTime)

  return (
    <div style={containerStyle}>
      {sceneIndex === 0 && <HookIntro text={scenePlan.hook} />}
      <ZoomLayer
        src={screenRecordingSrc}
        start={currentScene.start}
        end={currentScene.end}
        zoom={currentScene.zoom}
        cursorX={currentScene.cursorX}
        cursorY={currentScene.cursorY}
      />
      <CaptionOverlay
        text={currentScene.caption}
        transition={currentScene.transition ?? 'fade'}
      />
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  width: 393,
  height: 698,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#000',
  fontFamily: 'Inter, system-ui, sans-serif',
}
