import { registerRoot, Composition } from 'remotion'
import { ReelComposition } from './compositions/ReelComposition'

const FPS = 30
const WIDTH = 393
const HEIGHT = 698
const MAX_DURATION = 60 * FPS // 60 seconds at 30fps

/**
 * Remotion root component.
 * registerRoot() is REQUIRED for the bundler to identify the entry point.
 * Composition registers the ReelComposition by ID so selectComposition() can find it.
 * Duration/fps/dimensions are safe defaults — the server renderer overrides them.
 */
function ShipReelRoot() {
  return (
    <Composition
      id="ReelComposition"
      component={ReelComposition}
      durationInFrames={MAX_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  )
}

registerRoot(ShipReelRoot)
