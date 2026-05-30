import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { levelProgress } from '../common/leveling.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Usuário logado com os campos de gamificação reais. Alimenta o store do
  // mobile, que abastece tanto a Home quanto o Perfil.
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        githubLogin: true,
        displayName: true,
        avatarUrl: true,
        avatarVariant: true,
        rank: true,
        level: true,
        totalXp: true,
        currentStreak: true,
        maxStreak: true,
        streakFreezes: true,
        coins: true,
        gems: true,
        subscriptionPlan: true,
        timezone: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { subscriptionPlan, timezone, displayName, ...rest } = user;

    return {
      ...rest,
      // level + progresso derivados do totalXp (fonte única em leveling.ts)
      ...levelProgress(user.totalXp),
      displayName: displayName ?? user.githubLogin,
      isPro: subscriptionPlan != null,
      committedToday: await this.hasCommittedToday(userId, timezone),
    };
  }

  // "Commitou hoje?" = existe DailyActivity de hoje (no fuso do usuário) que
  // manteve a ofensiva.
  private async hasCommittedToday(
    userId: string,
    timezone: string,
  ): Promise<boolean> {
    const tz = timezone || 'America/Sao_Paulo';
    // "YYYY-MM-DD" no fuso do usuário → meia-noite UTC desse dia (coluna @db.Date)
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(
      new Date(),
    );

    const activity = await this.prisma.dailyActivity.findFirst({
      where: { userId, date: new Date(todayStr), keptStreak: true },
      select: { id: true },
    });

    return activity !== null;
  }
}
