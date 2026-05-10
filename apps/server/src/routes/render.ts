import { Router } from 'express'
import type { RenderRequest, RenderProgress } from '@shipreel/shared-types'

export const renderRouter = Router()

const renderJobs = new Map<string, RenderProgress>()

renderRouter.post('/start', async (req, res) => {
  const renderReq = req.body as RenderRequest
  if (!renderReq.projectId || !renderReq.scenePlan) {
    res.status(400).json({ error: 'Missing projectId or scenePlan' })
    return
  }

  renderJobs.set(renderReq.projectId, {
    frames: 0,
    totalFrames: 100,
    percentage: 0,
  })

  res.json({ message: 'Render started', projectId: renderReq.projectId })
})

renderRouter.get('/progress/:projectId', (req, res) => {
  const progress = renderJobs.get(req.params.projectId)
  if (!progress) {
    res.status(404).json({ error: 'No render job found' })
    return
  }
  res.json(progress)
})
