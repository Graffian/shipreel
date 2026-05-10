'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Film, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { Project } from '@shipreel/shared-types'

const statusColors: Record<string, string> = {
  uploading: 'text-yellow-400',
  processing: 'text-blue-400',
  transcribing: 'text-purple-400',
  generating: 'text-cyan-400',
  rendering: 'text-orange-400',
  complete: 'text-green-400',
  error: 'text-red-400',
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProjects().then(setProjects).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/upload"
          className="flex items-center gap-2 rounded-lg bg-shipreel-600 px-4 py-2 text-sm font-medium hover:bg-shipreel-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 pt-16 text-center">
          <Film className="h-16 w-16 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-300">No projects yet</h2>
          <p className="text-slate-500">Create your first reel to see it here</p>
          <Link
            href="/upload"
            className="mt-4 rounded-lg bg-shipreel-600 px-6 py-3 font-medium hover:bg-shipreel-500 transition-colors"
          >
            Create Your First Reel
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-slate-700 hover:bg-slate-900"
            >
              <h3 className="font-semibold text-white group-hover:text-shipreel-300 transition-colors">
                {project.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`text-xs font-medium capitalize ${statusColors[project.status] || 'text-slate-400'}`}
                >
                  ● {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
