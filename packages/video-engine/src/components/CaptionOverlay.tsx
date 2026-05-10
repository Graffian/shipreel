import React from 'react'

interface CaptionOverlayProps {
  text: string
  transition: 'fade' | 'slide' | 'cut' | 'zoom'
}

/**
 * Animated caption overlay positioned at the bottom third of the reel.
 * Supports word-by-word highlighting (future: sync with word timestamps).
 *
 * Transition prop controls entrance animation between scenes.
 */
export function CaptionOverlay({ text, transition }: CaptionOverlayProps) {
  const transitionStyle = getTransitionStyle(transition)

  return (
    <div style={containerStyle}>
      <div style={{ ...bubbleStyle, ...transitionStyle }}>
        <span style={captionTextStyle}>{text}</span>
      </div>
    </div>
  )
}

function getTransitionStyle(
  transition: string
): React.CSSProperties {
  switch (transition) {
    case 'slide':
      return { transform: 'translateY(0)', opacity: 1 }
    case 'zoom':
      return { transform: 'scale(1)', opacity: 1 }
    case 'fade':
    default:
      return { opacity: 1 }
  }
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 80,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  zIndex: 20,
  padding: '0 20px',
}

const bubbleStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
  borderRadius: 16,
  padding: '12px 20px',
  maxWidth: '90%',
  transition: 'all 0.3s ease',
}

const captionTextStyle: React.CSSProperties = {
  color: '#fff',
  fontSize: 18,
  fontWeight: 600,
  textAlign: 'center',
  lineHeight: 1.4,
  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
}
