'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Project } from '@shipreel/shared-types'

const statusMessages: Record<string, string> = {
  uploading: 'Uploading your video...',
  processing: 'Processing video...',
  transcribing: 'Transcribing audio...',
  generating: 'AI is generating your scene plan...',
  rendering: 'Rendering your reel...',
  complete: 'Your reel is ready!',
  error: 'Something went wrong',
}

export default function ProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    if (!params.id) return
    try {
      const data = await api.getProject(params.id as string)
      setProject(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }, [params.id])

  // Initial fetch
  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  // Poll every 2s while project is processing
  useEffect(() => {
    if (!project) return
    if (project.status === 'complete' || project.status === 'error') return

    const interval = setInterval(fetchProject, 2000)
    return () => clearInterval(interval)
  }, [project?.status, fetchProject])

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center gap-4 pt-24">
        <p className="text-xl text-slate-400">Project not found</p>
        <Link
          href="/dashboard"
          className="text-shipreel-400 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const videoUrl = project.renderedVideoUrl
    ? `http://localhost:4000${project.renderedVideoUrl}`
    : null

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Preview */}
        <div>
          <div className="aspect-[9/16] max-w-[400px] rounded-2xl bg-slate-900 shadow-xl">
            {project.status === 'complete' && videoUrl ? (
              <video
                src={videoUrl}
                className="h-full w-full rounded-2xl object-cover"
                controls
                autoPlay
                loop
                muted
              />
            ) : project.status === 'error' ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-lg font-medium text-red-400">Processing Error</p>
                <p className="text-sm text-slate-500">
                  {project.transcription || 'An unexpected error occurred'}
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-shipreel-400" />
                  <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-yellow-400" />
                </div>
                <p className="text-lg font-medium text-slate-300">
                  {statusMessages[project.status] || 'Processing...'}
                </p>
                <p className="text-sm text-slate-500">
                  This may take a minute or two
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-slate-400">Status</h3>
            <p className="font-medium capitalize text-shipreel-300">
              {project.status === 'complete' ? '✅ ' : ''}
              {project.status}
            </p>
          </div>

          {project.scenePlan && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="mb-3 text-sm font-medium text-slate-400">
                Edit Captions
              </h3>
              <div className="space-y-3">
                {project.scenePlan.scenes.map((scene, i) => (
                  <div key={i}>
                    <label className="mb-1 block text-xs text-slate-500">
                      Scene {i + 1} ({scene.start}s - {scene.end}s)
                    </label>
                    <input
                      type="text"
                      defaultValue={scene.caption}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-shipreel-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-shipreel-600 px-6 py-3 font-medium text-white hover:bg-shipreel-500 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Regenerate with AI
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 hover:border-slate-500 transition-colors"
              disabled={project.status !== 'complete'}
              onClick={() => {
                if (videoUrl) window.open(videoUrl, '_blank')
              }}
            >
              <Download className="h-4 w-4" />
              Export MP4
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
