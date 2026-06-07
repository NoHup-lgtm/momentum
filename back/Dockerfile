# ── Build ─────────────────────────────────────────────────────────────────────
FROM node:20-slim AS build
WORKDIR /app

# openssl é necessário pro engine do Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# postinstall roda `prisma generate` (precisa do schema) → copia o prisma antes
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# artefatos prontos do estágio de build (inclui o Prisma client gerado em
# dist/src/generated e node_modules com o engine)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/package*.json ./

EXPOSE 3000
# Aplica migrations pendentes e sobe a API. migrate deploy é idempotente
# (no-op quando nada pendente) e usa advisory lock (seguro com N instâncias).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
