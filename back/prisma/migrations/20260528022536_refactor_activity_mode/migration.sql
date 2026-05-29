/*
  Warnings:

  - The values [DAILY_COMMIT] on the enum `CoinSource` will be removed. If these variants are still used in the database, this will fail.
  - The values [DAILY_COMMIT] on the enum `XpSource` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `lastCommitDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `commits` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('COMMIT', 'PULL_REQUEST', 'CODE_REVIEW');

-- AlterEnum
BEGIN;
CREATE TYPE "CoinSource_new" AS ENUM ('DAILY_ACTIVITY', 'DAILY_CHALLENGE', 'ACHIEVEMENT', 'STREAK_MILESTONE', 'SQUAD_TOP3', 'PURCHASE_ITEM');
ALTER TABLE "coin_transactions" ALTER COLUMN "source" TYPE "CoinSource_new" USING ("source"::text::"CoinSource_new");
ALTER TYPE "CoinSource" RENAME TO "CoinSource_old";
ALTER TYPE "CoinSource_new" RENAME TO "CoinSource";
DROP TYPE "public"."CoinSource_old";
COMMIT;

-- AlterEnum
ALTER TYPE "MetricType" ADD VALUE 'DAILY_ACTIVITIES';

-- AlterEnum
BEGIN;
CREATE TYPE "XpSource_new" AS ENUM ('DAILY_ACTIVITY', 'STREAK_MILESTONE', 'DAILY_CHALLENGE', 'ACHIEVEMENT', 'RANK_UP_BONUS', 'SQUAD_BONUS', 'CHECKIN');
ALTER TABLE "xp_transactions" ALTER COLUMN "source" TYPE "XpSource_new" USING ("source"::text::"XpSource_new");
ALTER TYPE "XpSource" RENAME TO "XpSource_old";
ALTER TYPE "XpSource_new" RENAME TO "XpSource";
DROP TYPE "public"."XpSource_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "commits" DROP CONSTRAINT "commits_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastCommitDate",
ADD COLUMN     "lastActivityDate" DATE;

-- DropTable
DROP TABLE "commits";

-- CreateTable
CREATE TABLE "daily_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "coinsGained" INTEGER NOT NULL DEFAULT 0,
    "keptStreak" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_github_events" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_github_events_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE INDEX "daily_activities_userId_date_idx" ON "daily_activities"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_activities_userId_keptStreak_idx" ON "daily_activities"("userId", "keptStreak");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activities_userId_date_activityType_key" ON "daily_activities"("userId", "date", "activityType");

-- CreateIndex
CREATE INDEX "processed_github_events_processedAt_idx" ON "processed_github_events"("processedAt");

-- AddForeignKey
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_github_events" ADD CONSTRAINT "processed_github_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
