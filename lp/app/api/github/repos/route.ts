import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'GitHub API error' }, { status: res.status })
  }

  const repos = await res.json()
  return NextResponse.json(repos.map((r: Record<string, unknown>) => ({
    id: r.id,
    full_name: r.full_name,
    name: r.name,
    private: r.private,
    language: r.language,
    updated_at: r.updated_at,
  })))
}
