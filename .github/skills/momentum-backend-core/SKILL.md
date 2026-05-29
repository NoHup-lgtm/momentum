---
name: momentum-backend-core
description: "Contexto do backend Momentum (NestJS + Prisma). Use quando precisar reutilizar modulos core/auth, cookies JWT httpOnly, guard de autenticacao, decorator de usuario, ou padroes de organizacao do back."
---

# Momentum Backend Core Context

## Quando usar

- Criar novos endpoints protegidos com cookie JWT.
- Reutilizar `CoreModule`, `AuthGuard`, `AuthUser` ou `CookieService`.
- Seguir a organizacao de modulos e convencoes do backend.

## Estrutura e convencoes

- `CoreModule` (global) em `src/core/modules/core.module.ts`.
- `CookieService` em `src/core/services/cookie.service.ts`.
- `AuthGuard` em `src/core/guards/auth.guard.ts`.
- `AuthUser` decorator em `src/core/decorators/auth-user.decorator.ts`.
- DTOs do core em `src/core/dto/*`.
- `AuthModule` em `src/auth/auth.module.ts`.
- `AuthService` em `src/auth/auth.service.ts`.
- `AuthController` em `src/auth/auth.controller.ts`.
- DTOs do auth em `src/auth/dto/*`.
- `PrismaModule` em `src/prisma/prisma.module.ts` e `PrismaService` em `src/prisma/prisma.service.ts`.

## Autenticacao (JWT cookie httpOnly)

- Cookies usados: `access_token` e `refresh_token`.
- Geracao de cookies feita via `CookieService`.
- `AuthGuard` valida `access_token`, checa `tokenType === 'access'` e anexa `user` ao request.
- `AuthUser` decorator extrai `user` do request e lanca 401 se nao existir.

## Endpoints de auth

- `POST /auth/login/github` recebe `code` e `redirectUri`.
- `GET /auth/check` valida o cookie `access_token`.
- `POST /auth/refresh` e `POST /auth/refreshtoken` renovam tokens via `refresh_token`.

## Como reutilizar

1. Importe `CoreModule` no modulo que precisa de `AuthGuard` ou `CookieService`.
2. Proteja rotas com `@UseGuards(AuthGuard)`.
3. Use `@AuthUser()` para acessar o usuario ja validado.
4. Para emitir/limpar cookies, chame `CookieService` via injeccao.
5. Crie novos tipos/interfaces como DTOs dentro de `src/<modulo>/dto/`.

## Observacoes de integracao

- `CoreModule` ja registra `JwtModule` com `JWT_SECRET`.
- `AuthService` lida com GitHub OAuth e upsert do usuario via Prisma.
- `main.ts` registra `cookie-parser` para ler cookies.

## Env vars relevantes

- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `COOKIE_DOMAIN`
