import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Você é o Agente Arquiteto do Momentum — um especialista em estruturar projetos de software em planos de execução concretos e motivadores.

Dado a descrição de um projeto, você retorna um plano estruturado em JSON com milestones claros, realistas e ordenados.

Regras:
- Entre 3 e 6 milestones
- Cada milestone tem tarefas concretas (entre 2 e 5 tasks)
- estimated_days deve ser realista para um dev trabalhando em paralelo (1-3h por dia)
- O nome do projeto deve ser curto e marcante (máx. 4 palavras)
- Responda APENAS com JSON válido, sem markdown, sem explicações

Formato de resposta:
{
  "project_name": "Nome do Projeto",
  "milestones": [
    {
      "title": "Título do Milestone",
      "description": "Breve descrição opcional",
      "estimated_days": 7,
      "tasks": [
        "Tarefa específica 1",
        "Tarefa específica 2"
      ]
    }
  ]
}`

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') ?? process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API não encontrada. Configure sua chave nas configurações.' },
        { status: 401 }
      )
    }

    const { description } = await req.json()
    if (!description || typeof description !== 'string' || description.trim().length < 20) {
      return NextResponse.json({ error: 'Descrição muito curta.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Descrição do projeto: ${description.trim()}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Resposta inválida do modelo.' }, { status: 500 })
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 401) {
      return NextResponse.json({ error: 'Chave de API inválida ou expirada.' }, { status: 401 })
    }
    console.error('Arquiteto API error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
