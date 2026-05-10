'use client'

import { useState } from 'react'
import type { Scene } from '@shipreel/shared-types'

interface CaptionEditorProps {
  scenes: Scene[]
  onSave: (scenes: Scene[]) => void
}

/**
 * Inline caption editor that lets users tweak AI-generated captions
 * before re-rendering. Each scene shows the time range + editable text.
 */
export function CaptionEditor({ scenes, onSave }: CaptionEditorProps) {
  const [editableScenes, setEditableScenes] = useState(
    scenes.map((s) => ({ ...s }))
  )

  const handleChange = (index: number, caption: string) => {
    const updated = [...editableScenes]
    updated[index] = { ...updated[index], caption }
    setEditableScenes(updated)
  }

  return (
    <div className="space-y-3">
      {editableScenes.map((scene, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-700 bg-slate-900/50 p-3"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Scene {i + 1}
            </span>
            <span className="text-xs text-slate-600">
              {scene.start}s &ndash; {scene.end}s
            </span>
          </div>
          <input
            type="text"
            value={scene.caption}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-shipreel-500"
          />
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={scene.zoom}
                onChange={() => {
                  const updated = [...editableScenes]
                  updated[i] = { ...updated[i], zoom: !updated[i].zoom }
                  setEditableScenes(updated)
                }}
              />
              Auto-zoom
            </label>
          </div>
        </div>
      ))}
      <button
        onClick={() => onSave(editableScenes)}
        className="w-full rounded-lg bg-shipreel-600 py-2 text-sm font-medium text-white hover:bg-shipreel-500 transition-colors"
      >
        Save Changes & Re-render
      </button>
    </div>
  )
}
