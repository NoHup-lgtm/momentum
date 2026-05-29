-- ============================================================================
-- migration: add_chests_liga_feed_gem_ledger
-- Adds: chest system, liga/seasons, feed events, gem ledger,
--       subscription plan/billing/trial, daily challenge claim tracking
-- ============================================================================

-- ── 1. New simple enums ───────────────────────────────────────────────────────

CREATE TYPE "SubscriptionPlan" AS ENUM ('PRO', 'MAX');

CREATE TYPE "SubscriptionBilling" AS ENUM ('MONTHLY', 'ANNUAL');

CREATE TYPE "GemSource" AS ENUM (
  'PURCHASE',
  'SUBSCRIPTION',
  'CHEST',
  'ACHIEVEMENT',
  'DAILY_CHALLENGE',
  'EVENT_REWARD',
  'PURCHASE_ITEM'
);

CREATE TYPE "ChestRarity" AS ENUM ('COMUM', 'RARO', 'EPICO', 'LENDARIO');

CREATE TYPE "ChestSource" AS ENUM (
  'CHALLENGE',
  'ACHIEVEMENT',
  'SUBSCRIPTION',
  'EVENT',
  'SQUAD_REWARD'
);

CREATE TYPE "ChestRewardType" AS ENUM ('XP', 'COINS', 'GEMS', 'COSMETIC');

CREATE TYPE "FeedEventType" AS ENUM (
  'STREAK_MILESTONE',
  'LEVEL_UP',
  'RANK_UP',
  'ACHIEVEMENT',
  'CHEST_LEGENDARY',
  'SQUAD_JOIN',
  'LIGA_PROMOTED',
  'CHALLENGE_COMPLETED'
);

CREATE TYPE "FeedVisibility" AS ENUM ('SQUAD', 'GLOBAL');

-- ── 2. Extend existing enums ──────────────────────────────────────────────────

-- CosmeticObtainedSource: add CHEST_REWARD
ALTER TYPE "CosmeticObtainedSource" ADD VALUE 'CHEST_REWARD';

-- SubscriptionStatus: add TRIAL (can't be added in middle — added at end)
ALTER TYPE "SubscriptionStatus" ADD VALUE 'TRIAL';

-- ── 3. Modify User table ──────────────────────────────────────────────────────

-- Remove isPro (replaced by subscriptionPlan + Subscription relation)
ALTER TABLE "users" DROP COLUMN IF EXISTS "isPro";

-- Add subscriptionPlan (null = free plan)
ALTER TABLE "users" ADD COLUMN "subscriptionPlan" "SubscriptionPlan";

-- ── 4. Modify Subscription table ─────────────────────────────────────────────

-- Add plan and billing (required going forward — no existing rows in dev)
ALTER TABLE "subscriptions" ADD COLUMN "plan"    "SubscriptionPlan"    NOT NULL DEFAULT 'PRO';
ALTER TABLE "subscriptions" ADD COLUMN "billing" "SubscriptionBilling" NOT NULL DEFAULT 'MONTHLY';
ALTER TABLE "subscriptions" ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- Remove the migration defaults so new rows must be explicit
ALTER TABLE "subscriptions" ALTER COLUMN "plan"    DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "billing" DROP DEFAULT;

-- Change status default from ACTIVE to TRIAL
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'TRIAL';

-- ── 5. Modify UserDailyChallenge table ───────────────────────────────────────

-- Add claimedAt — null = desafio completo mas não coletado
ALTER TABLE "user_daily_challenges" ADD COLUMN "claimedAt" TIMESTAMP(3);

-- Index: desafios completos e não coletados (pendentes de coletar)
CREATE INDEX "user_daily_challenges_userId_isCompleted_claimedAt_idx"
  ON "user_daily_challenges"("userId", "isCompleted", "claimedAt");

-- ── 6. Modify Achievement table ───────────────────────────────────────────────

-- Add rewardGems (was missing — DailyChallenge já tinha, Achievement não)
ALTER TABLE "achievements" ADD COLUMN "rewardGems" INTEGER NOT NULL DEFAULT 0;

-- ── 7. New table: gem_transactions ───────────────────────────────────────────

CREATE TABLE "gem_transactions" (
  "id"          TEXT        NOT NULL,
  "userId"      TEXT        NOT NULL,
  "amount"      INTEGER     NOT NULL,
  "source"      "GemSource" NOT NULL,
  "description" TEXT,
  "referenceId" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "gem_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gem_transactions_userId_createdAt_idx"
  ON "gem_transactions"("userId", "createdAt");

ALTER TABLE "gem_transactions"
  ADD CONSTRAINT "gem_transactions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 8. New table: user_chests ─────────────────────────────────────────────────

CREATE TABLE "user_chests" (
  "id"       TEXT          NOT NULL,
  "userId"   TEXT          NOT NULL,
  "rarity"   "ChestRarity" NOT NULL,
  "source"   "ChestSource" NOT NULL,
  "earnedAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "openedAt" TIMESTAMP(3),  -- null = baú ainda fechado

  CONSTRAINT "user_chests_pkey" PRIMARY KEY ("id")
);

-- "baús pendentes do usuário" = WHERE userId = ? AND openedAt IS NULL
CREATE INDEX "user_chests_userId_openedAt_idx"
  ON "user_chests"("userId", "openedAt");

ALTER TABLE "user_chests"
  ADD CONSTRAINT "user_chests_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 9. New table: chest_rewards ───────────────────────────────────────────────

CREATE TABLE "chest_rewards" (
  "id"         TEXT              NOT NULL,
  "chestId"    TEXT              NOT NULL,
  "rewardType" "ChestRewardType" NOT NULL,
  "amount"     INTEGER           NOT NULL DEFAULT 0,
  "cosmeticId" TEXT,

  CONSTRAINT "chest_rewards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chest_rewards_chestId_idx"
  ON "chest_rewards"("chestId");

ALTER TABLE "chest_rewards"
  ADD CONSTRAINT "chest_rewards_chestId_fkey"
  FOREIGN KEY ("chestId") REFERENCES "user_chests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chest_rewards"
  ADD CONSTRAINT "chest_rewards_cosmeticId_fkey"
  FOREIGN KEY ("cosmeticId") REFERENCES "cosmetics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── 10. New table: liga_seasons ───────────────────────────────────────────────

CREATE TABLE "liga_seasons" (
  "id"           TEXT        NOT NULL,
  "tier"         INTEGER     NOT NULL,
  "sprintNumber" INTEGER     NOT NULL,
  "startsAt"     TIMESTAMP(3) NOT NULL,
  "endsAt"       TIMESTAMP(3) NOT NULL,
  "isActive"     BOOLEAN     NOT NULL DEFAULT false,

  CONSTRAINT "liga_seasons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "liga_seasons_tier_sprintNumber_key"
  ON "liga_seasons"("tier", "sprintNumber");

CREATE INDEX "liga_seasons_isActive_idx"
  ON "liga_seasons"("isActive");

-- ── 11. New table: liga_participants ──────────────────────────────────────────

CREATE TABLE "liga_participants" (
  "id"        TEXT    NOT NULL,
  "seasonId"  TEXT    NOT NULL,
  "userId"    TEXT    NOT NULL,
  "xpEarned"  INTEGER NOT NULL DEFAULT 0,
  "finalRank" INTEGER,           -- preenchido ao encerrar season
  "promoted"  BOOLEAN,           -- true = top 3, sobe de tier
  "relegated" BOOLEAN,           -- true = bottom 3, desce de tier

  CONSTRAINT "liga_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "liga_participants_seasonId_userId_key"
  ON "liga_participants"("seasonId", "userId");

-- Leaderboard em tempo real: ORDER BY xpEarned DESC
CREATE INDEX "liga_participants_seasonId_xpEarned_idx"
  ON "liga_participants"("seasonId", "xpEarned");

ALTER TABLE "liga_participants"
  ADD CONSTRAINT "liga_participants_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "liga_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "liga_participants"
  ADD CONSTRAINT "liga_participants_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 12. New table: feed_events ────────────────────────────────────────────────

CREATE TABLE "feed_events" (
  "id"         TEXT             NOT NULL,
  "userId"     TEXT             NOT NULL,
  "type"       "FeedEventType"  NOT NULL,
  "payload"    JSONB            NOT NULL DEFAULT '{}',
  "visibility" "FeedVisibility" NOT NULL DEFAULT 'SQUAD',
  "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "feed_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "feed_events_userId_createdAt_idx"
  ON "feed_events"("userId", "createdAt");

-- Feed global paginado por data
CREATE INDEX "feed_events_createdAt_idx"
  ON "feed_events"("createdAt");

-- Filtrar por visibilidade (ex: feed da squad = WHERE visibility = 'SQUAD')
CREATE INDEX "feed_events_visibility_createdAt_idx"
  ON "feed_events"("visibility", "createdAt");

ALTER TABLE "feed_events"
  ADD CONSTRAINT "feed_events_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
