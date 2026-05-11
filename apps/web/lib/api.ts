const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

async function retryFetch(input: RequestInfo, init?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(input, init)
      return res
    } catch (err) {
      if (i === retries - 1) throw err
      console.warn(`[api] fetch failed, retrying (${i + 1}/${retries})...`, err)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Unreachable')
}

export const api = {
  async createProject(data: {
    title: string
    changelog?: string
    screenRecordingUrl?: string
  }) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create project')
    return res.json()
  },

  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`)
    if (!res.ok) throw new Error('Failed to fetch projects')
    return res.json()
  },

  async getProject(id: string) {
    const res = await fetch(`${API_BASE}/projects/${id}`)
    if (!res.ok) throw new Error('Project not found')
    return res.json()
  },

  async updateProject(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update project')
    return res.json()
  },

  async uploadScreenRecording(file: File, title?: string, changelog?: string) {
    const form = new FormData()
    form.append('file', file)
    if (title) form.append('title', title)
    if (changelog) form.append('changelog', changelog)
    const res = await retryFetch(`${API_BASE}/upload/screen-recording`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },
}
