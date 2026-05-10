import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import type { Project, ProjectStatus } from '@shipreel/shared-types'

export const projectRouter = Router()
const projects = new Map<string, Project>()

export function createProject(data: {
  title: string
  changelog?: string
  screenRecordingUrl?: string
  inspirationVideoUrl?: string
  status?: ProjectStatus
}): Project {
  const id = randomUUID()
  const project: Project = {
    id,
    title: data.title || 'Untitled Project',
    status: data.status || 'uploading',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    screenRecordingUrl: data.screenRecordingUrl,
    changelog: data.changelog,
    inspirationVideoUrl: data.inspirationVideoUrl,
  }
  projects.set(id, project)
  return project
}

projectRouter.post('/', (req, res) => {
  const { title, changelog, screenRecordingUrl, inspirationVideoUrl } = req.body
  const project = createProject({
    title,
    changelog,
    screenRecordingUrl,
    inspirationVideoUrl,
  })
  res.status(201).json(project)
})

projectRouter.get('/', (_req, res) => {
  const list = Array.from(projects.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  res.json(list)
})

projectRouter.get('/:id', (req, res) => {
  const project = projects.get(req.params.id)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  res.json(project)
})

projectRouter.patch('/:id', (req, res) => {
  const project = projects.get(req.params.id)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  Object.assign(project, req.body, { updatedAt: new Date().toISOString() })
  res.json(project)
})
