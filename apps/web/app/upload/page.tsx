'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Video, FileText, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'

export default function UploadPage() {
  const router = useRouter()
  const [screenRecording, setScreenRecording] = useState<File | null>(null)
  const [inspirationVideo, setInspirationVideo] = useState<File | null>(null)
  const [changelog, setChangelog] = useState('')
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      setter: (f: File) => void
    ) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) setter(file)
    },
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!screenRecording) return

    setUploading(true)
    setProgress('Uploading and starting pipeline...')

    try {
      const uploadRes = await api.uploadScreenRecording(
        screenRecording,
        title || 'Untitled Reel',
        changelog
      )

      setProgress('Processing started — redirecting to project...')
      router.push(`/projects/${uploadRes.projectId}`)
    } catch (err) {
      console.error(err)
      setProgress('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create New Reel</h1>
        <p className="mt-2 text-slate-400">
          Upload your screen recording and let AI do the rest
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Product Launch"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-shipreel-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Screen Recording *
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, setScreenRecording)}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-10 transition-colors hover:border-shipreel-500"
            onClick={() => document.getElementById('screen-recording')?.click()}
          >
            <Video className="h-10 w-10 text-slate-500" />
            <div className="text-center">
              <p className="font-medium text-slate-300">
                {screenRecording
                  ? screenRecording.name
                  : 'Drop screen recording here'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                MP4, MOV, or WebM — up to 500MB
              </p>
            </div>
            <input
              id="screen-recording"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setScreenRecording(file)
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Inspiration Video (optional)
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, setInspirationVideo)}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/30 p-8 transition-colors hover:border-shipreel-400"
            onClick={() =>
              document.getElementById('inspiration-video')?.click()
            }
          >
            <Upload className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">
              {inspirationVideo
                ? inspirationVideo.name
                : 'Reference video for style matching'}
            </p>
            <input
              id="inspiration-video"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setInspirationVideo(file)
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Changelog / Feature Description (optional)
          </label>
          <textarea
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            rows={4}
            placeholder={"What's new in this release?\n- Real-time collaboration\n- Dark mode\n- API access"}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-shipreel-500"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !screenRecording}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-shipreel-600 py-4 text-lg font-semibold text-white transition-all hover:bg-shipreel-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Sparkles className="h-5 w-5 animate-pulse" />
              {progress}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Reel with AI
            </>
          )}
        </button>
      </form>
    </div>
  )
}
