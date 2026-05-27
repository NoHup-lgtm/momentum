# momentum

App mobile de gamificação para devs. Cada commit vira streak, XP e rank. Compita com sua squad.

## Estrutura

```
momentum/
├── lp/     # Landing page (Next.js) — momentu.me
└── back/   # API (NestJS + Prisma + Neon)
```

## Stack

- **Mobile** — React Native + Expo *(em desenvolvimento)*
- **Backend** — NestJS 11 · Prisma 7 · Neon (PostgreSQL)
- **Landing** — Next.js 14 · Vercel

## Setup local

### Backend
```bash
cd back
npm install
cp .env.example .env   # preenche DATABASE_URL
npx prisma migrate deploy
npm run start:dev
```

### Landing
```bash
cd lp
npm install
npm run dev
```
