import { NextRequest, NextResponse } from 'next/server'

const EXPRESS_URL = process.env.EXPRESS_URL || 'http://localhost:4000'

export async function POST(request: NextRequest) {
  const expressUrl = `${EXPRESS_URL}/api/upload/screen-recording`

  if (!request.body) {
    return NextResponse.json({ error: 'No request body' }, { status: 400 })
  }

  try {
    const init: RequestInit & { duplex: string } = {
      method: 'POST',
      headers: {
        'content-type': request.headers.get('content-type') || '',
      },
      body: request.body,
      duplex: 'half',
    }

    const res = await fetch(expressUrl, init)

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[route] upload proxy failed:', err)
    return NextResponse.json(
      { error: 'Upload proxy failed' },
      { status: 502 }
    )
  }
}
