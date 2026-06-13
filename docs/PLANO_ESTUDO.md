# Plano Estudo — "roadmap.sh encontra Duolingo"

Modo Estudo do momentum: o usuário **monta seu perfil de aprendizado** escolhendo
trilhas e linguagens (catálogo inspirado em [roadmap.sh](https://roadmap.sh)) e
estuda com lições curtas e exercícios estilo Duolingo, tudo plugado no motor de
jogo que já existe (XP/coins/streak/liga/conquistas).

## ⚠️ Identidade & feel — é o MESMO jogo (não um app de curso)
**Princípio inegociável (Arthur, 2026-06-11):** estudar **não** é uma tela de
catálogo/curso colada por cima. É o momentum que já existe — pixel-art, ofensiva,
ranks, baús, liga, squad — agora também alimentado por aprender. Nada de cara de
roadmap.sh (listas, barrinhas clínicas); o roadmap.sh é só a **fonte do conteúdo**.

Os 4 pilares que dão a vibe (todos escolhidos pelo Arthur):
1. **Lição mantém a ofensiva 🔥** — dia sem commit? uma lição segura o fogo. O
   estudo entra na MESMA streak → é o gancho de retenção diária.
2. **Baús + cosméticos pixel exclusivos de estudo** — terminar unidade solta baú
   e itens pro avatar que só quem estuda ganha (liga ao colecionável que já amam).
3. **PixelDev (o mascote da LP) como tutor** — reage a acerto/erro, comemora,
   provoca quando some. Dá voz e alma.
4. **Mapa pixel-art, não lista** — a trilha é um mundinho pixel pra percorrer (na
   arte do app), lições como nós no caminho, baú no fim da unidade.

Tudo no espresso + terracota, Lora/JetBrains, com a espiral e o boneco pixel.

## Modelo central (estilo Duolingo de idiomas)

No Duolingo você adiciona vários **idiomas** ao perfil e cada um tem sua árvore e
progresso. Aqui é igual, com **dois tipos de curso** (as duas famílias do
roadmap.sh):

- **Trilhas (role-based):** Frontend, Backend, Full Stack, DevOps, Android, iOS,
  Data Analyst, AI Engineer, Game Dev, QA, Cyber Security… — jornadas completas
  de uma função.
- **Linguagens/Skills (skill-based):** JavaScript, TypeScript, Python, React,
  Node.js, SQL, Docker, Go, Rust, System Design, DSA (LeetCode)… — focos
  específicos.

O usuário **matricula em quantas quiser** (trilha E/OU linguagem), e o **perfil
mostra** as que ele está estudando (tipo as bandeirinhas do Duolingo), cada uma
com seu anel de progresso. Trocar entre elas é instantâneo.

## Decisões de produto (Arthur, 2026-06-11)

| Decisão | Escolha |
|---|---|
| Catálogo | Espelha roadmap.sh: **role-based** (trilhas) + **skill-based** (linguagens). Um só model `Track` com `kind: ROLE \| SKILL` |
| Matrícula | **Múltipla** — adiciona N trilhas/linguagens ao perfil, cada uma com progresso. Exibidas no **perfil** (estilo Duolingo) |
| Streak | **Unificada**: dia com commit OU lição completa mantém a ofensiva |
| Navegação | **Nova tab "aprender"** + as trilhas do user aparecem no **perfil** |
| Erros/vidas | **Sem punição no MVP** (errou → explicação → segue). Corações = mecânica Pro futura (vidas ilimitadas) |
| Free vs Pro | **Free** = Frontend + Backend + Full Stack (role). **Pro** = todas as outras trilhas (DevOps, Android, iOS, AI/Dados, Game…) + **todas as linguagens skill-based** + System Design + DSA/LeetCode + AI Tutor. No MVP aparecem com cadeado "Pro · em breve" → funil de validação pré-Stripe |
| Fullstack | **Curadoria**: reusa unidades de front+back numa sequência própria (zero conteúdo novo) |

## Arquitetura de conteúdo

```
Track (kind: ROLE|SKILL · isPro)         ex.: frontend, backend, javascript
 └─ TrackUnit (N:N, ordem por track)     ← reuso entre tracks (fullstack, skills)
     └─ Unit (tópico)                     ex.: "Internet", "HTML", "APIs REST"
         └─ Lesson (5–8 exercícios, 3–5 min)
             └─ Exercise (6 tipos no MVP)
```

**Reuso é o coração do modelo.** Unidades como *Internet*, *Git & GitHub*,
*Web Security*, *Authentication*, *Testing*, *GraphQL* aparecem em frontend E
backend — escrevemos **uma vez**, referenciamos em várias trilhas via `TrackUnit`.
Uma linguagem skill-based (ex. "JavaScript") reusa as unidades de JS do frontend.

**Tipos de exercício (MVP — sem execução de código):**
1. Múltipla escolha · 2. Completar o código (lacuna) · 3. Prever o output ·
4. Verdadeiro/falso · 5. Ordenar linhas · 6. Parear conceitos

**Execução real de código ("ambientes controlados") — em fases:**
- MVP: nenhuma (tipos estáticos)
- Fase 2: **JS no browser** (sandbox em web worker — zero infra)
- Fase 3 (Pro/LeetCode): execução server-side (Piston/Judge0 self-hosted) + test
  cases — infra + custo, só depois de validar engajamento

## Mapa de conteúdo — fiel ao roadmap.sh

### Trilha FRONTEND (unidades, na ordem do roadmap)
1. **Internet** (como funciona, HTTP, DNS, hosting, browsers)
2. **HTML** (basics, semântica, forms & validação, acessibilidade, SEO)
3. **CSS** (basics, layouts, responsivo)
4. **JavaScript** (basics, DOM, fetch/Ajax) *(reusada pela skill JavaScript)*
5. **Git & Controle de versão** + hosting (GitHub/GitLab) *(compartilhada c/ backend)*
6. **Package Managers** (npm/pnpm/yarn)
7. **Frameworks** (React/Vue/Angular/Svelte/Solid/Qwik — escolher 1)
8. **Escrevendo CSS** (Tailwind, BEM, arquitetura, Sass/PostCSS)
9. **Build Tools** (linters/formatters: Prettier/ESLint; bundlers: Vite/Webpack/Rollup/Parcel)
10. **Testing** (Vitest/Jest/Playwright/Cypress) *(compartilhada)*
11. **Segurança web** (CORS, HTTPS, CSP, OWASP) + **Auth** (JWT/OAuth/SSO) *(compartilhada)*
12. **TypeScript** *(reusada pela skill TypeScript)*
13. **Web Components** (templates, custom elements, shadow DOM)
14. **SSR** (Next.js/Astro; Nuxt; Svelte Kit)
15. **GraphQL** (Apollo/Relay) *(compartilhada)*
16. **PWA & Performance** (PRPL, RAIL, Lighthouse, métricas)
17. **Static Site Generators** (Next/Astro/Eleventy)
18. **Mobile** (React Native/Flutter/Ionic) · **Desktop** (Electron/Tauri)
19. **Browser APIs** (storage, websockets, SSE, service workers, notifications…)

### Trilha BACKEND (unidades, na ordem do roadmap)
1. **Internet** *(compartilhada c/ frontend)*
2. **Linguagem** (escolher: JavaScript/Go/Python/Ruby/Java/C#/PHP/Rust)
3. **Git & Controle de versão** + hosting *(compartilhada)*
4. **Bancos relacionais** (PostgreSQL/MySQL/MariaDB/SQLite…)
5. **APIs** (REST, JSON, SOAP, gRPC, GraphQL, HATEOAS, OpenAPI)
6. **Authentication** (JWT, OAuth, Basic, Token, Cookie, OpenID, SAML) *(compartilhada)*
7. **Caching** (Redis/Memcached; server/CDN/client)
8. **Web Security** (hashing bcrypt/scrypt; HTTPS, OWASP, CORS, TLS) *(compartilhada)*
9. **Testing** (integração, unit, funcional) *(compartilhada)*
10. **CI/CD**
11. **Mais sobre bancos** (ORMs, ACID, transações, N+1, normalização, migrations)
12. **Escalando bancos** (índices, replicação, sharding, CAP)
13. **Design & Arquitetura** (monolito/micro/SOA/serverless/12-factor; GOF/DDD/TDD/CQRS)
14. **Containers** (Docker, Kubernetes, vs virtualização)
15. **Web Servers** (Nginx/Apache/Caddy)
16. **Search Engines** (Elasticsearch/Solr) · **Message Brokers** (RabbitMQ/Kafka)
17. **Real-Time** (SSE, WebSockets, polling)
18. **NoSQL** (document/key-value/time-series/column/graph)
19. **Building for Scale** (degradação graciosa, throttling, circuit breaker) + **Observabilidade**

### FULLSTACK (curadoria — reusa as unidades acima)
Internet → HTML → CSS → JS → Git → Frameworks → APIs → Bancos relacionais →
Auth → Web Security → Testing → Docker & deploy.

> O mapa **completo** de cada trilha fica visível desde o dia 1 (aspiracional,
> estilo Duolingo). Unidades sem conteúdo ainda aparecem bloqueadas ("em breve").

## Schema (Prisma — novos models)

```
enum TrackKind     { ROLE, SKILL }
enum ExerciseType  { MULTIPLE_CHOICE, FILL_CODE, PREDICT_OUTPUT, TRUE_FALSE,
                     ORDER_LINES, MATCH_PAIRS }

Track   { key @unique, kind TrackKind, isPro, icon, order }
Unit    { key @unique }                                  ← reutilizável
TrackUnit { trackId, unitId, order }  @@unique([trackId, unitId])
Lesson  { key @unique, unitId, order, xpReward, coinReward }
Exercise{ lessonId, order, type ExerciseType, data Json, answer Json }

UserTrack { userId, trackId, addedAt, isActive }  @@unique([userId, trackId])
          ← as matrículas do user (Duolingo-style), exibidas no perfil
UserLessonProgress { userId, lessonId, score, completedAt }
          @@unique([userId, lessonId])  ← crédito idempotente, 1x por lição
```

- Conteúdo **seedado por key via JSON no repo** (`back/content/*.json`) — mesmo
  padrão de challenges/cosméticos. Versionado, revisável em PR.
- i18n NO CONTEÚDO: `data` carrega `{ pt, en }` por campo (prompt, opções,
  explicação). O mobile escolhe pela lang ativa.

## Anti-cheat & economia

- O GET da lição **nunca envia `answer`**. Cliente manda respostas → **servidor
  corrige** → credita. Consistente com o resto (nada client-trusted).
- **Lição = 20 XP + 5 coins**, creditado **1x pra sempre** (unique) → impossível
  farmar repetindo. Commit do dia segue valendo mais (50 XP).
- XP de lição entra no ledger → **conta na liga automaticamente**.
- Novos enums: `XpSource.LESSON`, `CoinSource.LESSON`, `ActivityType.LESSON`.

## Integração com o motor existente (zero refactor)

| Sistema | Gancho |
|---|---|
| **Streak** | lição grava `DailyActivity(LESSON)`; a ofensiva une dias de GitHub + lição. Lembrete 20h vira "commit **ou** lição" |
| **Liga** | automático (XP no ledger) |
| **Conquistas** | novas: 1ª lição, 10/50 lições, 1ª unidade, trilha completa (auto-unlock já existe) |
| **Desafio diário** | novo no catálogo: "complete 1 lição" |
| **Feed/push** | `UNIT_COMPLETED`/`TRACK_COMPLETED` + push "wins" |
| **Baús** | baú ao completar unidade |
| **Perfil** | nova seção: trilhas/linguagens matriculadas + progresso |

## Endpoints (módulo `learn`)

```
GET  /learn/catalog                 → todas as tracks (role+skill) + isPro + se matriculado
GET  /learn/me                      → minhas matrículas (UserTrack) + progresso de cada
POST /learn/tracks/:key/enroll      → matricula (bloqueia se isPro e user não-Pro)
DELETE /learn/tracks/:key/enroll    → desmatricula
GET  /learn/tracks/:key             → mapa: unidades→lições com estado (feita/atual/bloqueada)
GET  /learn/lessons/:id             → exercícios SEM answers
POST /learn/lessons/:id/complete    → respostas → score + recompensas (idempotente)
```

## Telas mobile (módulo novo, bilíngue)

1. **aprender** (tab nova) — minhas trilhas/linguagens (anel de progresso) + botão
   **"+ adicionar"**
2. **catálogo** — browse das tracks (2 seções: trilhas / linguagens), Pro com
   cadeado; matricular daqui
3. **trilha** — o mapa/caminho visual estilo Duolingo (unidades = capítulos,
   lições = nós: feita ✓ / atual ⭐ / bloqueada 🔒)
4. **lição** — player: 1 exercício por vez, barra de progresso, feedback imediato
   (acertou/errou + explicação), sem punição
5. **resultado** — XP/coins, streak mantida, score, CTA próxima lição
6. **perfil** (editar a tela existente) — seção das trilhas matriculadas

## Fases de implementação

| Fase | Entrega |
|---|---|
| **F1** | Backend: schema + migration aditiva + seed pipeline + endpoints (catálogo/matrícula/mapa/correção) + scoring + crédito + streak |
| **F2** | Mobile: tab aprender + catálogo + matrícula + perfil; depois mapa + player (6 tipos) + resultado |
| **F3** | Ganchos: conquistas, desafio diário, feed, push, lembrete 20h "ou lição" |
| **F4** | Conteúdo: frontend un. 1–4 + backend un. 1–3 (~25–30 lições); resto do mapa visível bloqueado. **Gargalo real** — Claude rascunha JSON, Arthur/Moyza revisam |
| **F5** | Pro: cadeados ativos, épico Stripe, execução JS no browser, DSA/LeetCode (Piston), AI Tutor |

## Riscos / atenção
- **Conteúdo é o gargalo** — código são ~3 sessões; lições boas (PT+EN) são o
  trabalho contínuo.
- **Streak unificada** muda o texto do lembrete 20h e o `committedToday` da Home
  (vira "fez atividade hoje": commit ou lição).
- **Tab bar**: entra 6º item ou rearranjo do botão central — decidir na F2.
- **Catálogo grande** (~50 tracks): a maioria nasce "em breve"/Pro; só front/back/
  fullstack têm conteúdo no início. Isso é intencional (aspiracional + funil Pro).
- Migrations aditivas, aplicadas no deploy do Render (sem risco aos dados).
