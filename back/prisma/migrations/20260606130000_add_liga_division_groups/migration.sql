-- DropIndex
DROP INDEX "liga_seasons_tier_sprintNumber_key";

-- AlterTable
ALTER TABLE "liga_seasons" ADD COLUMN     "groupNumber" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "liga_seasons_tier_sprintNumber_idx" ON "liga_seasons"("tier", "sprintNumber");

-- CreateIndex
CREATE UNIQUE INDEX "liga_seasons_tier_sprintNumber_groupNumber_key" ON "liga_seasons"("tier", "sprintNumber", "groupNumber");
