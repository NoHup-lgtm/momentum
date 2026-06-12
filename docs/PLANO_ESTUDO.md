# Plano Estudo — "roadmap.sh encontra Duolingo"

Modo Estudo do momentum: trilhas de aprendizado interativas (inspiração
[roadmap.sh](https://roadmap.sh)) com lições curtas e exercícios estilo
Duolingo, plugadas no motor de jogo existente (XP/coins/streak/liga/conquistas).

## Decisões de produto (Arthur, 2026-06-11)

| Decisão | Escolha |
|---|---|
| Streak | **Unificada**: dia com commit OU lição completa mantém a ofensiva |
| Navegação | **Nova tab "aprender"** na tab bar |
| Erros/vidas | **Sem punição no MVP** (errou → explicação → segue; score no final). Corações ficam pra depois como mecânica Pro (vidas ilimitadas = monetização clássica) |
| Trilhas | Frontend e Backend **completas no mapa** (espelhando roadmap.sh/frontend e /backend). Fullstack = **curadoria** de unidades das outras duas (reuso, zero conteúdo novo) |
| Free vs Pro | Free = frontend + backend + fullstack. Pro = DevOps, Mobile, IA/Dados, LeetCode, System Design… (aparecem com cadeado "Pro · em breve" desde o MVP → funil de validação) |

## Arquitetura de conteúdo

```
Trilha (frontend │ backend │ fullstack │ pro: devops, mobile, leetcode…)
 └─ Unidade (tópico: "HTML", "APIs REST"…) — REUTILIZÁVEL entre trilhas
     └─ Lição (5–8 exercícios, 3–5 min)
         └─ Exercício (6 tipos no MVP)
```

**Tipos de exercício (MVP — sem execução de código):**
1. Múltipla escolha · 2. Completar o código (lacuna) · 3. Prever o output ·
4. Verdadeiro/falso · 5. Ordenar linhas · 6. Parear conceitos

**Execução real de código ("ambientes controlados") — em fases:**
- MVP: nenhuma (tipos estáticos acima)
- Fase 2: **JS no browser** (sandbox em web worker — zero infra)
- Fase 3 (Pro/LeetCode): execução server-side (Piston/Judge0 self-hosted) com
  test cases — infra + custo, só depois de validar engajamento

## Mapa de conteúdo (unidades por trilha)

**Frontend** (espelha roadmap.sh/frontend):
1. Como a web funciona (Internet, HTTP, DNS, browsers)
2. HTML (estrutura, semântica, formulários)
3. CSS (seletores, box model, flexbox/grid, responsivo)
4. JavaScript básico (sintaxe, tipos, funções, arrays/objetos)
5. JavaScript no browser (DOM, eventos, fetch, storage)
6. JavaScript moderno (ES6+, promises/async)
7. Git & GitHub *(compartilhada com backend)*
8. Pacotes & build (npm, bundlers, Vite)
9. React (componentes, props/state, hooks)
10. TypeScript básico
11. Testes no frontend
12. Performance & Web Vitals
13. Segurança no front (XSS, CORS, CSP)
14. Acessibilidade

**Backend** (espelha roadmap.sh/backend):
1. Como a internet funciona *(compartilhada)*
2. Node.js & a linguagem do servidor
3. Git & GitHub *(compartilhada)*
4. Terminal & Linux básico
5. Bancos relacionais (SQL, modelagem, índices)
6. NoSQL (noções, quando usar)
7. APIs (REST, verbos, status codes, JSON)
8. Autenticação & autorização (sessions, JWT, OAuth)
9. Caching (HTTP cache, Redis)
10. Segurança (OWASP, hashing, injection)
11. Testes no backend
12. Docker & deploy
13. Arquitetura (MVC, monolito vs micro, filas)

**Fullstack** (curadoria, mesmas unidades): Como a web funciona → HTML → CSS →
JS básico → Git → APIs → Bancos → Auth → React → Docker & deploy.

> O mapa COMPLETO fica visível no app desde o dia 1 (aspiracional, estilo
> Duolingo). Unidades ainda sem conteúdo aparecem bloqueadas ("em breve").
> Conteúdo é escrito progressivamente.

## Schema (Prisma — novos models)

```
Track      { key @unique, isPro, order }
Unit       { key @unique }
TrackUnit  { trackId, unitId, order }      ← N:N com ordem por trilha (fullstack!)
Lesson     { key @unique, unitId, order, xpReward, coinReward }
Exercise   { lessonId, order, type, data Json, answer Json }
UserLessonProgress { userId, lessonId, score, completedAt }
           @@unique([userId, lessonId])    ← crédito idempotente, 1x por lição
enum ExerciseType { MULTIPLE_CHOICE, FILL_CODE, PREDICT_OUTPUT, TRUE_FALSE,
                    ORDER_LINES, MATCH_PAIRS }
```

- Conteúdo **seedado por key via JSON no repo** (`back/content/*.json`) — mesmo
  padrão de challenges/cosméticos. Versionado, revisável em PR. CMS só se doer.
- i18n NO CONTEÚDO: `data` carrega `{ pt, en }` por campo (prompt, opções,
  explicação). O mobile escolhe pela lang ativa.

## Anti-cheat & economia

- O GET da lição **nunca envia `answer`**. O cliente manda as respostas, o
  **servidor corrige** e credita — consistente com o resto do app (nada
  client-trusted).
- **XP: lição = 20 XP + 5 coins** (commit do dia = 50 — o commit continua rei).
  Crédito **1x por lição pra sempre** (unique constraint) → impossível farmar
  XP/liga repetindo lição. XP de lição entra no ledger → **conta na liga
  automaticamente** (a janela soma XpTransaction).
- Novos enums: `XpSource.LESSON`, `CoinSource.LESSON`,
  `ActivityType.LESSON` (streak).

## Integração com o motor existente (zero refactor)

| Sistema | Gancho |
|---|---|
| **Streak** | lição completa grava `DailyActivity(LESSON)`; cálculo da ofensiva passa a unir dias de GitHub + dias de lição. Lembrete das 20h vira "commit **ou** lição" |
| **Liga** | automático (XP no ledger) |
| **Conquistas** | novas: 1ª lição, 10/50 lições, 1ª unidade, trilha completa — auto-unlock já existe |
| **Desafio diário** | novo no catálogo: "complete 1 lição" |
| **Feed/push** | `UNIT_COMPLETED`/`TRACK_COMPLETED` + push categoria "wins" |
| **Baús** | baú ao completar unidade (raridade por tamanho) |

## Endpoints (novos, módulo `learn`)

```
GET  /learn/tracks                  → trilhas + progresso resumido (+ cadeado pro)
GET  /learn/tracks/:key             → mapa: unidades→lições com estado (feita/atual/bloqueada)
GET  /learn/lessons/:id             → exercícios SEM answers
POST /learn/lessons/:id/complete    → body: respostas → score + recompensas (idempotente)
```

## Telas mobile (módulo novo, bilíngue desde o nascimento)

1. **aprender** (tab nova) — hub: trilhas com anel de progresso, pro com cadeado
2. **trilha** — o mapa/caminho visual estilo Duolingo (unidades como "capítulos",
   lições como nós no caminho; feita ✓ / atual ⭐ / bloqueada 🔒)
3. **lição** — player: 1 exercício por vez, barra de progresso, feedback
   imediato (acertou/errou + explicação), sem punição
4. **resultado** — XP/coins ganhos, streak mantida, score, CTA próxima lição

## Fases de implementação

| Fase | Entrega | Observação |
|---|---|---|
| **F1** | Backend: schema + migration + seed pipeline + 4 endpoints + scoring + crédito + streak | migration aditiva (segura no deploy) |
| **F2** | Mobile: tab aprender + 4 telas + player com os 6 tipos | padrões existentes (i18n/skeleton/tema) |
| **F3** | Gamificação: conquistas, desafio diário, feed, push, lembrete 20h "ou lição" | |
| **F4** | Conteúdo inicial: frontend un. 1–4 + backend un. 1–3 (~25–30 lições) — resto do mapa visível bloqueado | **gargalo real**; Claude rascunha, Arthur/Moyza revisam |
| **F5** | Pro: cadeados ativos, épico Stripe, execução JS no browser, LeetCode (Piston) | depois de validar |

## Riscos / pontos de atenção

- **Conteúdo é o gargalo** — código são ~2-3 sessões; lições boas (PT+EN) são o
  trabalho contínuo. Pipeline: Claude gera JSON → revisão em PR.
- **Streak unificada** muda o texto do lembrete 20h e o `committedToday` da Home
  (vira "fez atividade hoje": commit ou lição).
- **Tab bar**: entra 6º item ou o feed sai do botão central pra dar o centro ao
  "aprender" — decidir na F2 com o layout na mão.
- Migrations: aplicadas no deploy do Render (aditivas, sem risco aos dados).
