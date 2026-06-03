import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FeedService } from '../feed/feed.service.js';
import { levelFromXp } from '../common/leveling.js';

// Catálogo de conquistas. Chave estável em `title`; o mobile localiza pela chave.
// metric: como o currentValue é computado (maxStreak | commits | xp).
const CATALOG = [
  // ── Commits ──
  { key: 'hello_world',  category: 'COMMIT' as const, rarity: 'COMMON' as const,    metric: 'commits' as const,   dbMetric: 'DAILY_ACTIVITIES' as const, target: 1,    xp: 50,   coins: 10 },
  { key: 'prolific',     category: 'COMMIT' as const, rarity: 'COMMON' as const,    metric: 'commits' as const,   dbMetric: 'DAILY_ACTIVITIES' as const, target: 50,   xp: 150,  coins: 30 },
  { key: 'centurion',    category: 'COMMIT' as const, rarity: 'RARE' as const,      metric: 'commits' as const,   dbMetric: 'DAILY_ACTIVITIES' as const, target: 100,  xp: 400,  coins: 80 },
  { key: 'machine',      category: 'COMMIT' as const, rarity: 'EPIC' as const,      metric: 'commits' as const,   dbMetric: 'DAILY_ACTIVITIES' as const, target: 500,  xp: 1500, coins: 300 },
  { key: 'code_legend',  category: 'COMMIT' as const, rarity: 'LEGENDARY' as const, metric: 'commits' as const,   dbMetric: 'DAILY_ACTIVITIES' as const, target: 1000, xp: 3000, coins: 600 },
  // ── Streak ──
  { key: 'spark',        category: 'STREAK' as const, rarity: 'COMMON' as const,    metric: 'maxStreak' as const, dbMetric: 'MAX_STREAK' as const,       target: 7,    xp: 100,  coins: 20 },
  { key: 'two_weeks',    category: 'STREAK' as const, rarity: 'RARE' as const,      metric: 'maxStreak' as const, dbMetric: 'MAX_STREAK' as const,       target: 14,   xp: 200,  coins: 40 },
  { key: 'consistent',   category: 'STREAK' as const, rarity: 'RARE' as const,      metric: 'maxStreak' as const, dbMetric: 'MAX_STREAK' as const,       target: 30,   xp: 300,  coins: 60 },
  { key: 'half_century', category: 'STREAK' as const, rarity: 'EPIC' as const,      metric: 'maxStreak' as const, dbMetric: 'MAX_STREAK' as const,       target: 50,   xp: 800,  coins: 150 },
  { key: 'unstoppable',  category: 'STREAK' as const, rarity: 'EPIC' as const,      metric: 'maxStreak' as const, dbMetric: 'MAX_STREAK' as const,       target: 100,  xp: 1500, coins: 300 },
  { key: 'year_of_fire', category: 'STREAK' as const, rarity: 'LEGENDARY' as const, metric: 'maxStreak' as const, dbMetric: 'MAX_STREAK' as const,       target: 365,  xp: 5000, coins: 1000 },
  // ── XP / Rank ──
  { key: 'ascendant',    category: 'RANK' as const,   rarity: 'RARE' as const,      metric: 'xp' as const,        dbMetric: 'TOTAL_XP' as const,         target: 1000, xp: 200,  coins: 40 },
  { key: 'veteran',      category: 'RANK' as const,   rarity: 'EPIC' as const,      metric: 'xp' as const,        dbMetric: 'TOTAL_XP' as const,         target: 5000, xp: 800,  coins: 150 },
  { key: 'living_legend',category: 'RANK' as const,   rarity: 'LEGENDARY' as const, metric: 'xp' as const,        dbMetric: 'TOTAL_XP' as const,         target: 10000,xp: 2000, coins: 400 },
];

export interface AchievementView {
  id: string;
  key: string;
  category: string;
  rarity: string;
  target: number;
  currentValue: number;
  unlocked: boolean;
  rewardXp: number;
  rewardCoins: number;
}

@Injectable()
export class AchievementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feed: FeedService,
  ) {}

  private async ensureCatalog() {
    const out: { id: string; def: (typeof CATALOG)[number] }[] = [];
    for (const a of CATALOG) {
      let row = await this.prisma.achievement.findFirst({ where: { title: a.key } });
      if (!row) {
        row = await this.prisma.achievement.create({
          data: {
            title: a.key,
            description: '',
            category: a.category,
            rarity: a.rarity,
            metricType: a.dbMetric,
            targetValue: a.target,
            rewardXp: a.xp,
            rewardCoins: a.coins,
          },
        });
      }
      out.push({ id: row.id, def: a });
    }
    return out;
  }

  async getAll(userId: string): Promise<AchievementView[]> {
    const catalog = await this.ensureCatalog();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { maxStreak: true, totalXp: true },
    });
    const commitsAgg = await this.prisma.dailyActivity.aggregate({
      where: { userId, activityType: 'COMMIT' },
      _sum: { count: true },
    });
    const metrics = {
      maxStreak: user?.maxStreak ?? 0,
      commits: commitsAgg._sum.count ?? 0,
      xp: user?.totalXp ?? 0,
    };

    const unlockedRows = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedSet = new Set(unlockedRows.map((r) => r.achievementId));

    const result: AchievementView[] = [];
    for (const { id, def } of catalog) {
      const currentValue = metrics[def.metric];
      const reached = currentValue >= def.target;
      const already = unlockedSet.has(id);

      // Auto-desbloqueio + recompensa (uma vez só).
      if (reached && !already) {
        await this.unlock(userId, id, def.xp, def.coins, def.key);
      }

      result.push({
        id,
        key: def.key,
        category: def.category,
        rarity: def.rarity,
        target: def.target,
        currentValue,
        unlocked: reached || already,
        rewardXp: def.xp,
        rewardCoins: def.coins,
      });
    }
    return result;
  }

  private async unlock(userId: string, achievementId: string, xp: number, coins: number, key: string) {
    await this.prisma.userAchievement.create({ data: { userId, achievementId } });
    await this.prisma.xpTransaction.create({
      data: { userId, amount: xp, source: 'ACHIEVEMENT', description: `Conquista: ${key}` },
    });
    await this.prisma.coinTransaction.create({
      data: { userId, amount: coins, source: 'ACHIEVEMENT', description: `Conquista: ${key}` },
    });
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { totalXp: { increment: xp }, coins: { increment: coins } },
      select: { totalXp: true },
    });
    await this.prisma.user.update({ where: { id: userId }, data: { level: levelFromXp(updated.totalXp) } });
    await this.feed.emit(userId, 'ACHIEVEMENT', { key, xp, coins });
  }
}
