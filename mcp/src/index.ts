#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import {
  loadState, saveState, createState,
  activeMilestoneIndex, progressSummary,
} from './state.js'
import { generatePlan } from './arquiteto.js'

const server = new Server(
  { name: 'momentum', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

// ── Tool definitions ──────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'momentum_status',
      description: 'Returns the current project status: active milestone, pending tasks, and overall progress. Call this at the start of a session to understand what to work on.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'momentum_next_task',
      description: 'Returns the single next task to focus on in the active milestone.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'momentum_complete_task',
      description: 'Marks a task as done. Use the exact task title from momentum_status.',
      inputSchema: {
        type: 'object',
        required: ['task_title'],
        properties: {
          task_title: {
            type: 'string',
            description: 'Exact title of the task to mark as done.',
          },
          milestone_index: {
            type: 'number',
            description: 'Optional: milestone index (0-based). Defaults to the active milestone.',
          },
        },
      },
    },
    {
      name: 'momentum_checkin',
      description: 'Records a progress note — what was done, any blockers, next steps. Call this when wrapping up a coding session.',
      inputSchema: {
        type: 'object',
        required: ['note'],
        properties: {
          note: {
            type: 'string',
            description: 'What was accomplished and/or any blockers encountered.',
          },
        },
      },
    },
    {
      name: 'momentum_milestones',
      description: 'Lists all milestones with their tasks and completion status.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'momentum_create_project',
      description: 'Creates a new Momentum project by calling the Arquiteto AI agent. Writes .momentum.json in the current directory. Requires ANTHROPIC_API_KEY.',
      inputSchema: {
        type: 'object',
        required: ['description'],
        properties: {
          description: {
            type: 'string',
            description: 'Natural-language description of the project (min 20 chars).',
          },
        },
      },
    },
  ],
}))

// ── Tool handlers ─────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params
  const a = (args ?? {}) as Record<string, unknown>

  // ── momentum_status ──
  if (name === 'momentum_status') {
    const result = loadState()
    if (!result) return noProject()
    const summary = progressSummary(result.state)
    return ok(
      `# ${summary.project_name}\n\n` +
      `**Progresso geral:** ${summary.overall_pct}% (${summary.overall_progress} tarefas)\n` +
      `**Milestones:** ${summary.total_milestones} total\n\n` +
      `## Milestone ativo: ${String(summary.active_milestone_index + 1).padStart(2, '0')} — ${summary.active_milestone}\n` +
      `Progresso: ${summary.active_milestone_progress} · ~${summary.estimated_days_remaining} dias estimados\n\n` +
      `### Tarefas pendentes:\n` +
      summary.pending_tasks.map(t => `- [ ] ${t}`).join('\n')
    )
  }

  // ── momentum_next_task ──
  if (name === 'momentum_next_task') {
    const result = loadState()
    if (!result) return noProject()
    const { state } = result
    const idx = activeMilestoneIndex(state)
    const ms = state.milestones[idx]
    const next = ms.tasks.find(t => !t.done)
    if (!next) return ok(`Todas as tarefas do milestone "${ms.title}" estão concluídas! Passe para o próximo milestone.`)
    return ok(
      `**Próxima tarefa:** ${next.title}\n` +
      `Milestone: ${ms.title} (${idx + 1}/${state.milestones.length})`
    )
  }

  // ── momentum_complete_task ──
  if (name === 'momentum_complete_task') {
    const result = loadState()
    if (!result) return noProject()
    const { state, filePath } = result
    const taskTitle = String(a.task_title ?? '')
    const msIdx = a.milestone_index !== undefined
      ? Number(a.milestone_index)
      : activeMilestoneIndex(state)

    const ms = state.milestones[msIdx]
    if (!ms) return err(`Milestone index ${msIdx} não encontrado.`)

    const task = ms.tasks.find(t => t.title.toLowerCase() === taskTitle.toLowerCase())
    if (!task) {
      const suggestions = ms.tasks.filter(t => !t.done).map(t => `"${t.title}"`).join(', ')
      return err(`Tarefa "${taskTitle}" não encontrada no milestone "${ms.title}".\nPendentes: ${suggestions || 'nenhuma'}`)
    }
    if (task.done) return ok(`Tarefa "${task.title}" já estava marcada como concluída.`)

    task.done = true
    saveState(state, filePath)

    const doneTasks = ms.tasks.filter(t => t.done).length
    const msComplete = doneTasks === ms.tasks.length

    let msg = `✓ "${task.title}" concluída.\n`
    msg += `Milestone "${ms.title}": ${doneTasks}/${ms.tasks.length} tarefas`
    if (msComplete) {
      msg += `\n\n🎯 Milestone completo! `
      const nextMs = state.milestones[msIdx + 1]
      if (nextMs) msg += `Próximo: "${nextMs.title}"`
      else msg += `Projeto concluído!`
    }
    return ok(msg)
  }

  // ── momentum_checkin ──
  if (name === 'momentum_checkin') {
    const result = loadState()
    if (!result) return noProject()
    const { state, filePath } = result
    const note = String(a.note ?? '').trim()
    if (!note) return err('A nota não pode ser vazia.')

    const idx = activeMilestoneIndex(state)
    state.checkins.push({ at: new Date().toISOString(), note, milestone_index: idx })
    saveState(state, filePath)

    const summary = progressSummary(state)
    return ok(
      `Check-in registrado.\n` +
      `Progresso geral: ${summary.overall_pct}% · Milestone ativo: "${summary.active_milestone}"`
    )
  }

  // ── momentum_milestones ──
  if (name === 'momentum_milestones') {
    const result = loadState()
    if (!result) return noProject()
    const { state } = result
    const activeIdx = activeMilestoneIndex(state)

    const lines: string[] = [`# ${state.project_name} — Milestones\n`]
    state.milestones.forEach((ms, i) => {
      const done = ms.tasks.filter(t => t.done).length
      const isActive = i === activeIdx
      const status = done === ms.tasks.length ? '✓' : isActive ? '▶' : '○'
      lines.push(`${status} **${String(i + 1).padStart(2, '0')}. ${ms.title}** (${done}/${ms.tasks.length}) ~${ms.estimated_days}d`)
      ms.tasks.forEach(t => {
        lines.push(`   ${t.done ? '- [x]' : '- [ ]'} ${t.title}`)
      })
      lines.push('')
    })
    return ok(lines.join('\n'))
  }

  // ── momentum_create_project ──
  if (name === 'momentum_create_project') {
    const description = String(a.description ?? '').trim()
    if (description.length < 20) return err('Descrição muito curta. Detalhe mais o projeto.')

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return err('ANTHROPIC_API_KEY não definida. Adicione ao ambiente ou ao .env do projeto.')

    try {
      const state = await generatePlan(description, apiKey)
      const filePath = createState(state)
      const summary = progressSummary(state)
      return ok(
        `Projeto criado: **${state.project_name}**\n` +
        `Arquivo: ${filePath}\n\n` +
        `${summary.total_milestones} milestones gerados pelo Agente Arquiteto.\n\n` +
        state.milestones.map((m, i) =>
          `${String(i + 1).padStart(2, '0')}. ${m.title} (~${m.estimated_days}d)`
        ).join('\n')
      )
    } catch (e) {
      return err(`Erro ao gerar plano: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return err(`Ferramenta desconhecida: ${name}`)
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

function err(text: string) {
  return { content: [{ type: 'text' as const, text: `⚠ ${text}` }], isError: true }
}

function noProject() {
  return err(
    'Nenhum .momentum.json encontrado neste diretório ou nos diretórios pai.\n' +
    'Use momentum_create_project para criar um novo projeto.'
  )
}

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport()
await server.connect(transport)
