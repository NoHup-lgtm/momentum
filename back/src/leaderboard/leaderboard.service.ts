import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface UserRankRow {
  position: number;
  id: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  totalXp: number;
}

export interface SquadRankRow {
  position: number;
  id: string;
  name: string;
  rank: string;
  memberCount: number;
  totalXp: number;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Top usuários por XP total (global).
  async topUsers(limit = 50): Promise<UserRankRow[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { totalXp: 'desc' },
      take: limit,
      select: {
        id: true,
        githubLogin: true,
        displayName: true,
        avatarUrl: true,
        avatarVariant: true,
        rank: true,
        level: true,
        totalXp: true,
      },
    });
    return users.map((u, i) => ({ position: i + 1, ...u }));
  }

  // Top squads por XP somado dos membros ativos (global).
  async topSquads(limit = 20): Promise<SquadRankRow[]> {
    const squads = await this.prisma.squad.findMany({
      include: {
        members: {
          where: { isActive: true },
          include: { user: { select: { totalXp: true } } },
        },
      },
    });

    return squads
      .map((sq) => ({
        id: sq.id,
        name: sq.name,
        rank: sq.rank,
        memberCount: sq.members.length,
        totalXp: sq.members.reduce((sum, m) => sum + m.user.totalXp, 0),
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, limit)
      .map((s, i) => ({ position: i + 1, ...s }));
  }
}
