import React from 'react'
import { OffthreadVideo } from 'remotion'

interface ZoomLayerProps {
  src: string
  start: number
  end: number
  zoom: boolean
  cursorX?: number
  cursorY?: number
}

/**
 * Wraps the screen recording video with optional auto-zoom.
 * Uses Remotion's OffthreadVideo for server-side rendering compatibility.
 * Zoom is applied via CSS transform on the wrapper div.
 */
export function ZoomLayer({
  src,
  start,
  end,
  zoom,
  cursorX = 0.5,
  cursorY = 0.5,
}: ZoomLayerProps) {
  const scale = zoom ? 1.5 : 1
  const translateX = zoom ? (0.5 - cursorX) * 50 : 0
  const translateY = zoom ? (0.5 - cursorY) * 50 : 0

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
        }}
      >
        <OffthreadVideo
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
}
