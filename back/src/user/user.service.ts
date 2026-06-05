import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShopService } from '../shop/shop.service.js';
import { levelProgress } from '../common/leveling.js';

export type FriendshipState =
  | 'self'
  | 'friends'
  | 'incoming' // ele me convidou (posso aceitar)
  | 'outgoing' // eu convidei (aguardando)
  | 'none';

export interface PublicProfile {
  id: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  maxStreak: number;
  totalCommits: number;
  equipped: Record<string, string>;
  friendship: { state: FriendshipState; friendshipId: string | null };
  heatmap: number[]; // 91 dias (13 semanas), intensidade 0..5, do mais antigo ao hoje
  recentActivity: { type: string; payload: Record<string, unknown>; createdAt: string }[];
}

const HEATMAP_DAYS = 91;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shop: ShopService,
  ) {}

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

  // Perfil público de qualquer usuário, visto por `viewerId`. Alimenta a tela
  // user-profile (toque no avatar de um amigo/colega de squad/ranking).
  async getPublicProfile(viewerId: string, targetId: string): Promise<PublicProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        githubLogin: true,
        displayName: true,
        avatarUrl: true,
        avatarVariant: true,
        rank: true,
        totalXp: true,
        currentStreak: true,
        maxStreak: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const [commits, heatmap, friendship, equippedMap, recentActivity] =
      await Promise.all([
        this.totalCommits(targetId),
        this.commitHeatmap(targetId),
        this.friendshipState(viewerId, targetId),
        this.shop.equippedFor([targetId]),
        this.recentActivity(targetId),
      ]);

    const { totalXp } = user;
    return {
      ...user,
      ...levelProgress(totalXp),
      totalXp,
      totalCommits: commits,
      equipped: equippedMap[targetId] ?? {},
      friendship,
      heatmap,
      recentActivity,
    };
  }

  // Total de commits = soma de DailyActivity (activityType COMMIT).
  private async totalCommits(userId: string): Promise<number> {
    const agg = await this.prisma.dailyActivity.aggregate({
      where: { userId, activityType: 'COMMIT' },
      _sum: { count: true },
    });
    return agg._sum.count ?? 0;
  }

  // Heatmap das últimas 13 semanas: array de 91 dias (antigo → hoje) com
  // intensidade 0..5 a partir da contagem de commits do dia.
  private async commitHeatmap(userId: string): Promise<number[]> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (HEATMAP_DAYS - 1));

    const rows = await this.prisma.dailyActivity.findMany({
      where: { userId, activityType: 'COMMIT', date: { gte: since } },
      select: { date: true, count: true },
    });

    const byDay = new Map<string, number>();
    for (const r of rows) {
      const key = r.date.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + r.count);
    }

    const out: number[] = [];
    for (let i = 0; i < HEATMAP_DAYS; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      out.push(intensity(byDay.get(d.toISOString().slice(0, 10)) ?? 0));
    }
    return out;
  }

  // Estado da relação entre quem olha e o alvo.
  private async friendshipState(
    viewerId: string,
    targetId: string,
  ): Promise<{ state: FriendshipState; friendshipId: string | null }> {
    if (viewerId === targetId) return { state: 'self', friendshipId: null };

    const f = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: viewerId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: viewerId },
        ],
      },
      select: { id: true, status: true, requesterId: true },
    });
    if (!f) return { state: 'none', friendshipId: null };
    if (f.status === 'ACCEPTED') return { state: 'friends', friendshipId: f.id };
    // pendente: se eu sou o requester → outgoing; senão → incoming
    return {
      state: f.requesterId === viewerId ? 'outgoing' : 'incoming',
      friendshipId: f.id,
    };
  }

  // Eventos de feed do próprio usuário (atividade recente pública).
  private async recentActivity(
    userId: string,
  ): Promise<{ type: string; payload: Record<string, unknown>; createdAt: string }[]> {
    const events = await this.prisma.feedEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { type: true, payload: true, createdAt: true },
    });
    return events.map((e) => ({
      type: e.type,
      payload: (e.payload ?? {}) as Record<string, unknown>,
      createdAt: e.createdAt.toISOString(),
    }));
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

// Contagem de commits do dia → bucket 0..5 (intensidade do heatmap).
function intensity(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 2;
  if (count <= 5) return 3;
  if (count <= 9) return 4;
  return 5;
}
