import Anthropic from '@anthropic-ai/sdk'
import type { MomentumState } from './state.js'

const SYSTEM = `Você é o Agente Arquiteto do Momentum. Sua função é estruturar projetos de software em milestones concretos e entregáveis.

Dado a descrição de um projeto, retorne um JSON com:
- project_name: nome curto e direto
- milestones: array de 3 a 6 milestones, cada um com:
  - title: nome do milestone
  - description: o que representa essa fase (opcional)
  - estimated_days: estimativa em dias
  - tasks: array de 3 a 6 tarefas concretas (strings)

Responda APENAS com o JSON, sem markdown ou explicações.`

export async function generatePlan(description: string, apiKey: string): Promise<MomentumState> {
  const client = new Anthropic({ apiKey })

  const msg = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    system: SYSTEM,
    messages: [{ role: 'user', content: description }],
  })

  const text = msg.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Arquiteto did not return valid JSON')

  const raw = JSON.parse(match[0])
  return {
    project_name: raw.project_name,
    milestones: (raw.milestones ?? []).map((m: Record<string, unknown>) => ({
      title: String(m.title ?? ''),
      description: m.description ? String(m.description) : undefined,
      estimated_days: Number(m.estimated_days ?? 0),
      tasks: (m.tasks as string[] ?? []).map((t: string) => ({ title: t, done: false })),
    })),
    checkins: [],
    created_at: new Date().toISOString(),
  }
}
