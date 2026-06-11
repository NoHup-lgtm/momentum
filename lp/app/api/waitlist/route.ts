import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'node:crypto'

// Rate limit best-effort por IP (memória da instância). Serverless é efêmero,
// então não é à prova de tudo — a proteção forte é o WAF da Vercel —, mas corta
// burst de um mesmo cliente quente. 10 req / 10 min.
const hits = new Map<string, number[]>()
const WINDOW = 10 * 60_000
const MAX = 10
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) hits.clear() // evita crescer sem limite
  return arr.length > MAX
}

// Persiste na tabela `waitlist` do Neon (mesma do app). Requer DATABASE_URL
// configurada nas env vars do projeto lp na Vercel.
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente mais tarde.' }, { status: 429 })
  }

  const { email, source } = await req.json().catch(() => ({}))

  // RFC 5321: 254 chars máx. Regex simples só pra barrar lixo óbvio.
  if (
    !email || typeof email !== 'string' || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
  }
  const safeSource = typeof source === 'string' ? source.slice(0, 40) : null

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
      VALUES (${randomUUID()}, ${normalized}, ${safeSource})
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
