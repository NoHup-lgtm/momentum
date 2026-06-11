# Segurança — momentum

Resumo da postura de segurança, itens operacionais e planos pendentes da
auditoria end-to-end. Mantenha este arquivo atualizado a cada mudança relevante.

## Checklist operacional (verificar nos painéis)

Estas configs vivem fora do código (Render / Vercel / Neon / GitHub) e **precisam
estar certas** — o código sozinho não garante:

**Render (API NestJS)**
- [ ] `JWT_SECRET` — ≥ 32 chars aleatórios (`openssl rand -hex 32`). O boot
      **aborta** em produção se ausente/curto.
- [ ] `TOKEN_ENC_KEY` — exatamente 64 hex (32 bytes). Criptografa o token do GitHub.
- [ ] `CORS_ORIGIN` — `https://app.momentu.me,https://momentu.me`. Sem ela, o
      fallback de produção já é fail-closed (essas mesmas origens), mas defina explicitamente.
- [ ] `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — do OAuth App.
- [ ] `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` — Web Push.
- [ ] `NODE_ENV=production`.

**Vercel (LP)**
- [ ] **Remover `ANTHROPIC_API_KEY`** se existir — a rota que a usava foi deletada;
      se a chave já esteve lá, **revogue no console da Anthropic** (pode ter vazado
      via o endpoint público antigo).
- [ ] **Remover `DATABASE_URL`** do projeto LP — a LP não acessa mais o banco
      (waitlist removida, ver M5 abaixo). Sem credencial de banco = sem vazamento.

**GitHub OAuth App**
- [ ] Callback URLs restritas a `app.momentu.me` (+ esquema mobile `momentum://`).

## ✅ Controles verificados (estáticos + pentest dinâmico)

- **AuthN/Z**: todos os 30+ endpoints protegidos por `AuthGuard`; ownership
  (IDOR) checado em chest/challenge/friend/shop/squad/moderation. Pentest
  dinâmico confirmou: sem token → 401, token-type confusion → 401, alg=none →
  401, assinatura forjada → 401.
- **Refresh tokens** rotacionados + revogáveis (reuso = revoga a família). Logout
  server-side via `POST /auth/logout`.
- **Criptografia**: token do GitHub em AES-256-GCM (IV aleatório + auth tag).
- **Injeção**: Prisma parametrizado; o único raw SQL (`topSquads`) usa binds.
- **Validação**: DTOs + `ValidationPipe` (whitelist) em 100% dos bodies.
- **CORS** fail-closed em produção; **helmet**; **rate limit** (120/min global,
  20/min login). Pentest confirmou 429 e rejeição de origem externa.
- **Segredos**: nenhum no repo nem no histórico do git; `.dockerignore` exclui `.env`.
- **Container** roda como usuário não-root.

## 📋 Planos pendentes (risco aceito até execução)

### M4 — auth web por cookie httpOnly (em andamento, faseado)
Hoje o web (`app.momentu.me`, Vercel) fala com a API no Render
(`*.onrender.com`) — **domínios registráveis diferentes = cross-site**. Cookies
`SameSite=Lax` não vão cross-site, e `SameSite=None` depende de third-party
cookies (bloqueados no Safari/ITP). Por isso o web usa Bearer + `localStorage`.

A migração é feita em 3 fases **encadeadas e reversíveis** — sem janela onde o
login quebra (o backend aceita cookie OU Bearer o tempo todo):

**✅ Fase A (código — feito):** todas as requisições web mandam
`credentials: 'include'` (`WEB_CREDENTIALS` em `mobile/lib/session.ts`). Hoje é
inócuo (cross-site → cookie não é enviado, Bearer manda). É o canal pronto pra C.

**✅ Fase B (infra — feito):** `api.momentu.me` no Render (CNAME na GoDaddy +
TLS), `COOKIE_DOMAIN=.momentu.me`, `EXPO_PUBLIC_API_URL=https://api.momentu.me`
na Vercel. Verificado no DevTools: `access_token`/`refresh_token` em
`api.momentu.me` com **HttpOnly ✓, Secure ✓, Domain=.momentu.me**, login OK.

**✅ Fase C (código — feito, commit `960e6f8` na branch `sec/m4-phase-c`):** no
web o token de auth vive **só no cookie httpOnly** — o JS nunca o toca, então um
XSS não consegue mais roubá-lo. Em `mobile/lib/session.ts`: o web não grava JWT
no `localStorage` (guarda só uma "dica" de sessão não-sensível pra evitar
round-trip no boot); `getAccessToken`/`getRefreshToken` retornam null no web; o
refresh vai pelo cookie (body vazio); uma migração trata token legado como dica
pra não deslogar quem já estava logado desde a Fase B. **Reversível:** o backend
aceita cookie OU Bearer, então reverter a C restaura o Bearer no web sem mexer no
backend.

Pós-merge (validar em `app.momentu.me`): login do zero, reload (sessão
persiste), e confirmar no DevTools que **não há mais** `access_token`/
`refresh_token` em *Local Storage* (só nos Cookies). Logout limpa a dica.

### M5 — ✅ resolvido: a LP não acessa mais o banco
**Contexto:** a redesign Duolingo trocou o funil da LP de "captura de email
(waitlist)" por CTAs diretos → login no GitHub. Com isso a rota `/api/waitlist`
virou **código morto** e a `DATABASE_URL` na LP só servia pra ela.

Em vez de um role restrito (M5 original), tomamos a opção **mais segura**: a LP
deixa de tocar o banco por completo.
- **Código** (`chore/lp-remove-waitlist`): removidos `app/api/waitlist/route.ts`,
  a dep `@neondatabase/serverless` e as strings `waitlist` mortas do `content.ts`.
  Build + tsc limpos.
- **Ação no painel (Arthur):** **remover a env `DATABASE_URL` do projeto LP na
  Vercel** → a LP fica com **zero credencial de banco**. Sem superfície pra vazar.

**Role `waitlist_writer`** (criado no Neon durante o M5 original) ficou **ocioso**
— não há nada o alimentando. Pode **dropar** (`DROP ROLE waitlist_writer;` via
DataGrip como owner) ou guardar de reserva caso a captura de email volte.

> ⚠️ A `DATABASE_URL` do **owner** foi exposta em texto puro durante o setup —
> vale **rotacionar a senha do owner** com o Moyza no Neon quando der (higiene).

### Outros (Low) — monitorar
- **LP / Next.js** (em `14.2.35`): `npm audit` aponta 1 high + 1 moderate cujo
  único fix é `next@16` (breaking). O risco real é baixo no nosso setup: a LP roda
  **na Vercel** (que mitiga na borda os GHSAs de image-optimizer/middleware/cache)
  e o `postcss` (moderate) é build-time com **CSS nosso/confiável**. Plano: subir
  pra Next 15 (→ React 19) numa branch, testar a LP redesenhada (hydration +
  animações) e só então 16. Não é urgente.
- `npm audit`: **16 moderates no mobile** = árvore transitiva do **Expo** (sem fix
  sem quebrar o SDK). **3 moderates no back** = `prisma` (**devDependency**, não vai
  pra produção). Ambos: acompanhar upstream, nada a fazer agora.
- WAF/rate-limit gerenciado da Vercel na frente da LP (config no painel).

## Como rodar o pentest dinâmico local (não-destrutivo)

```bash
cd back && npm run build
DISABLE_CRON=1 NODE_ENV=production PORT=3009 node --env-file=.env dist/src/main.js &
# rodar a suíte de probes (auth/validação/CORS/headers/rate-limit) contra :3009
```
`DISABLE_CRON=1` impede que os jobs agendados escrevam durante o teste.
