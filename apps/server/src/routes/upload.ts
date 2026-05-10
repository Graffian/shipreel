import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { randomUUID as uuid } from 'node:crypto'
import { createProject } from './projects'
import { runPipeline } from '../services/pipeline'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'))
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuid()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.avi', '.mkv']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${ext}`))
    }
  },
})

export const uploadRouter = Router()

uploadRouter.post(
  '/screen-recording',
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    const { changelog, title } = req.body
    const project = createProject({
      title: title || 'Untitled Project',
      changelog,
      screenRecordingUrl: req.file.path,
      status: 'uploading',
    })

    // Return immediately — pipeline runs async
    res.json({
      projectId: project.id,
      filePath: req.file.path,
      fileName: req.file.originalname,
      size: req.file.size,
    })

    runPipeline(project, req.file.path, (status, data) => {
      Object.assign(project, { status, ...data }, { updatedAt: new Date().toISOString() })
    })
  }
)

uploadRouter.post('/inspiration-video', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' })
    return
  }
  res.json({
    filePath: req.file.path,
    fileName: req.file.originalname,
    size: req.file.size,
  })
})
