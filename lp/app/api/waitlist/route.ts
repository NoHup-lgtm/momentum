import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'node:crypto'

// Persiste na tabela `waitlist` do Neon (mesma do app). Requer DATABASE_URL
// configurada nas env vars do projeto lp na Vercel.
export async function POST(req: NextRequest) {
  const { email, source } = await req.json().catch(() => ({}))

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('[waitlist] DATABASE_URL não configurada')
    return NextResponse.json({ error: 'Configuração ausente.' }, { status: 500 })
  }

  const normalized = email.trim().toLowerCase()

  try {
    const sql = neon(dbUrl)
    const rows = await sql`
      INSERT INTO waitlist (id, email, source)
      VALUES (${randomUUID()}, ${normalized}, ${source ?? null})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `
    // 0 linhas = email já existia (conflito ignorado)
    return NextResponse.json({ ok: true, already: rows.length === 0 })
  } catch (e) {
    console.error('[waitlist] insert failed:', e)
    return NextResponse.json({ error: 'Erro ao salvar.' }, { status: 500 })
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return NextResponse.json({ count: 0 })
  try {
    const sql = neon(dbUrl)
    const rows = await sql`SELECT count(*)::int AS count FROM waitlist`
    return NextResponse.json({ count: rows[0]?.count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
