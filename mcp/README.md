# Momentum MCP

Gerencie o status do seu projeto direto de qualquer AI IDE que suporte MCP — Claude Code, Cursor, Windsurf, etc.

## O que é

Um MCP server que lê e escreve `.momentum.json` no seu repositório. A IA do editor sabe em qual milestone você está, quais tarefas estão pendentes e pode marcar progresso sem você sair do código.

## Setup rápido

### 1. Build

```bash
cd mcp
npm install
npm run build
```

### 2. Variável de ambiente

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # necessário só para criar projetos
```

### 3. Configurar no Claude Code

Adicione ao `~/.claude.json` (global) ou `.claude.json` (projeto):

```json
{
  "mcpServers": {
    "momentum": {
      "command": "node",
      "args": ["/caminho/para/momentum/mcp/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

### 4. Configurar no Cursor / Windsurf

Em **Settings → MCP Servers → Add**:

```json
{
  "name": "momentum",
  "command": "node /caminho/para/momentum/mcp/dist/index.js"
}
```

---

## Ferramentas disponíveis

| Ferramenta | O que faz |
|---|---|
| `momentum_status` | Milestone ativo, tarefas pendentes e % geral |
| `momentum_next_task` | Qual é a próxima tarefa a focar |
| `momentum_complete_task` | Marca uma tarefa como concluída |
| `momentum_checkin` | Registra nota de progresso (o que fiz, bloqueios) |
| `momentum_milestones` | Lista todos os milestones com status detalhado |
| `momentum_create_project` | Gera `.momentum.json` via Agente Arquiteto (requer API key) |

---

## Fluxo típico

```
[início de sessão]
→ momentum_status             # o que está pendente?
→ momentum_next_task          # foca na próxima tarefa

[após implementar algo]
→ momentum_complete_task      # marca como feito

[fim de sessão]
→ momentum_checkin            # registra o que foi feito hoje
```

## Estado do projeto

O arquivo `.momentum.json` fica na raiz do seu repositório. Você pode commitá-lo — é o estado canônico do projeto, legível por humanos e pela IA.

```json
{
  "project_name": "MEI Finance",
  "milestones": [
    {
      "title": "Setup & infraestrutura",
      "estimated_days": 7,
      "tasks": [
        { "title": "Criar repo Next.js + Supabase", "done": true },
        { "title": "Configurar Prisma", "done": false }
      ]
    }
  ],
  "checkins": [
    {
      "at": "2025-05-24T10:00:00Z",
      "note": "Configurei o Next.js, próximo: Prisma schema",
      "milestone_index": 0
    }
  ],
  "created_at": "2025-05-20T..."
}
```
