import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { levelFromXp } from '../common/leveling.js';

// Catálogo de desafios (chave estável em `title`; o mobile localiza pela chave).
const CATALOG = [
  { key: 'commit_today',    metric: 'DAILY_COMMITS' as const, target: 1, xp: 50,  coins: 10 },
  { key: 'commit_marathon', metric: 'DAILY_COMMITS' as const, target: 5, xp: 120, coins: 25 },
  { key: 'keep_streak',     metric: 'STREAK_DAYS'   as const, target: 3, xp: 80,  coins: 15 },
];

export interface ChallengeView {
  id: string;
  key: string;
  target: number;
  rewardXp: number;
  rewardCoins: number;
  currentValue: number;
  completed: boolean;
  claimed: boolean;
}

@Injectable()
export class ChallengeService {
  constructor(private readonly prisma: PrismaService) {}

  private todayDate(timezone: string): Date {
    const tz = timezone || 'America/Sao_Paulo';
    const str = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
    return new Date(`${str}T00:00:00.000Z`);
  }

  // Garante que os desafios do catálogo existam no banco (idempotente).
  private async ensureCatalog() {
    const out: { id: string; key: string; target: number; xp: number; coins: number }[] = [];
    for (const c of CATALOG) {
      let row = await this.prisma.dailyChallenge.findFirst({ where: { title: c.key } });
      if (!row) {
        row = await this.prisma.dailyChallenge.create({
          data: {
            title: c.key,
            description: '',
            metricType: c.metric,
            targetValue: c.target,
            rewardXp: c.xp,
            rewardCoins: c.coins,
          },
        });
      }
      out.push({ id: row.id, key: c.key, target: c.target, xp: c.xp, coins: c.coins });
    }
    return out;
  }

  private async metrics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true, currentStreak: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const activity = await this.prisma.dailyActivity.findFirst({
      where: { userId, date: this.todayDate(user.timezone), activityType: 'COMMIT' },
      select: { count: true },
    });
    return { commitsToday: activity?.count ?? 0, streak: user.currentStreak, today: this.todayDate(user.timezone) };
  }

  async getToday(userId: string): Promise<ChallengeView[]> {
    const catalog = await this.ensureCatalog();
    const { commitsToday, streak, today } = await this.metrics(userId);

    const claims = await this.prisma.userDailyChallenge.findMany({
      where: { userId, date: today, claimedAt: { not: null } },
      select: { challengeId: true },
    });
    const claimedSet = new Set(claims.map((c) => c.challengeId));

    return catalog.map((c) => {
      const metric = CATALOG.find((x) => x.key === c.key)!.metric;
      const currentValue = metric === 'STREAK_DAYS' ? streak : commitsToday;
      return {
        id: c.id,
        key: c.key,
        target: c.target,
        rewardXp: c.xp,
        rewardCoins: c.coins,
        currentValue,
        completed: currentValue >= c.target,
        claimed: claimedSet.has(c.id),
      };
    });
  }

  async claim(userId: string, challengeId: string): Promise<ChallengeView> {
    const today = await this.getToday(userId);
    const ch = today.find((c) => c.id === challengeId);
    if (!ch) throw new NotFoundException('Desafio não encontrado');
    if (!ch.completed) throw new BadRequestException('Desafio não concluído');
    if (ch.claimed) throw new BadRequestException('Recompensa já coletada');

    const tz = (await this.prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } }))?.timezone ?? '';
    const date = this.todayDate(tz);

    await this.prisma.userDailyChallenge.upsert({
      where: { userId_challengeId_date: { userId, challengeId, date } },
      create: { userId, challengeId, date, currentValue: ch.currentValue, isCompleted: true, completedAt: new Date(), claimedAt: new Date() },
      update: { isCompleted: true, completedAt: new Date(), claimedAt: new Date() },
    });

    await this.prisma.xpTransaction.create({
      data: { userId, amount: ch.rewardXp, source: 'DAILY_CHALLENGE', description: `Desafio: ${ch.key}` },
    });
    await this.prisma.coinTransaction.create({
      data: { userId, amount: ch.rewardCoins, source: 'DAILY_CHALLENGE', description: `Desafio: ${ch.key}` },
    });
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { totalXp: { increment: ch.rewardXp }, coins: { increment: ch.rewardCoins } },
      select: { totalXp: true },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { level: levelFromXp(updated.totalXp) },
    });

    return { ...ch, claimed: true };
  }
}
