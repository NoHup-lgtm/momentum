import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShopService } from '../shop/shop.service.js';
import { ModerationService } from '../moderation/moderation.service.js';

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
  equipped: Record<string, string>;
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly shop: ShopService,
    private readonly moderation: ModerationService,
  ) {}

  // Top usuários por XP total (global).
  async topUsers(viewerId: string, limit = 50): Promise<UserRankRow[]> {
    const blocked = new Set(await this.moderation.blockedPairIds(viewerId));
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
    // posição = rank global (índice); bloqueados são removidos da exibição.
    const visible = users
      .map((u, i) => ({ position: i + 1, ...u }))
      .filter((u) => !blocked.has(u.id));
    const equipped = await this.shop.equippedFor(visible.map((u) => u.id));
    return visible.map((u) => ({ ...u, equipped: equipped[u.id] ?? {} }));
  }

  // Top squads por XP somado dos membros ativos (global).
  // Agregação feita no banco (JOIN + SUM + ORDER + LIMIT) em vez de carregar
  // todas as squads e todos os membros na memória pra somar em JS — escala.
  // COUNT/SUM são castados pra int p/ não voltarem como BigInt (quebra JSON).
  async topSquads(limit = 20): Promise<SquadRankRow[]> {
    const rows = await this.prisma.$queryRaw<
      { id: string; name: string; rank: string; memberCount: number; totalXp: number }[]
    >`
      SELECT s.id, s.name, s.rank,
             COUNT(*)::int AS "memberCount",
             COALESCE(SUM(u."totalXp"), 0)::int AS "totalXp"
      FROM squads s
      JOIN squad_members m ON m."squadId" = s.id AND m."isActive" = true
      JOIN users u ON u.id = m."userId"
      GROUP BY s.id, s.name, s.rank
      ORDER BY "totalXp" DESC
      LIMIT ${limit}
    `;
    return rows.map((r, i) => ({ position: i + 1, ...r }));
  }
}
