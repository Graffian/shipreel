import React from 'react'

interface HookIntroProps {
  text: string
}

/**
 * Full-screen hook intro card — first 2 seconds of the reel.
 * Animated text entrance with gradient background.
 */
export function HookIntro({ text }: HookIntroProps) {
  return (
    <div style={containerStyle}>
      <div style={gradientOverlay} />
      <h1 style={textStyle}>{text}</h1>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
}

const gradientOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%)',
  opacity: 0.9,
}

const textStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 11,
  color: '#fff',
  fontSize: 32,
  fontWeight: 800,
  textAlign: 'center',
  lineHeight: 1.2,
  padding: '0 24px',
  textShadow: '0 2px 12px rgba(0,0,0,0.3)',
}
