import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Simple file-based waitlist — swap for Resend/Brevo/etc in production
const WAITLIST_FILE = path.join(process.cwd(), 'waitlist.json')

function readList(): string[] {
  try {
    return JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf-8'))
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()
  const list = readList()

  if (list.includes(normalized)) {
    return NextResponse.json({ ok: true, already: true })
  }

  list.push(normalized)
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2))

  console.log(`[waitlist] +1: ${normalized} (total: ${list.length})`)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  // Basic count endpoint — protect in production
  return NextResponse.json({ count: readList().length })
}
