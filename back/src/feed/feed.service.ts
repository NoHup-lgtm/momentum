import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShopService } from '../shop/shop.service.js';

type FeedType =
  | 'STREAK_MILESTONE' | 'LEVEL_UP' | 'RANK_UP' | 'ACHIEVEMENT'
  | 'CHEST_LEGENDARY' | 'SQUAD_JOIN' | 'LIGA_PROMOTED' | 'CHALLENGE_COMPLETED';

export interface FeedItem {
  id: string;
  type: string;
  createdAt: string;
  payload: Record<string, unknown>;
  user: {
    id: string;
    githubLogin: string;
    displayName: string | null;
    avatarUrl: string | null;
    avatarVariant: number;
    rank: string;
    isMe: boolean;
    equipped: Record<string, string>;
  };
}

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shop: ShopService,
  ) {}

  // Cria um evento de feed. Chamado pelos serviços quando algo notável acontece.
  // Tolerante a falha: nunca derruba a ação principal (ex: claim de desafio).
  async emit(
    userId: string,
    type: FeedType,
    payload: Record<string, unknown> = {},
    visibility: 'SQUAD' | 'GLOBAL' = 'GLOBAL',
  ): Promise<void> {
    try {
      await this.prisma.feedEvent.create({
        data: { userId, type, payload: payload as object, visibility },
      });
    } catch {
      // ignora — feed é best-effort
    }
  }

  // Audiência do feed: eu + amigos aceitos + colegas de squad.
  private async audience(userId: string): Promise<string[]> {
    const set = new Set<string>([userId]);

    // amigos e "minha squad" são independentes → em paralelo
    const [friendships, mine] = await Promise.all([
      this.prisma.friendship.findMany({
        where: { status: 'ACCEPTED', OR: [{ requesterId: userId }, { addresseeId: userId }] },
        select: { requesterId: true, addresseeId: true },
      }),
      this.prisma.squadMember.findFirst({
        where: { userId, isActive: true },
        select: { squadId: true },
      }),
    ]);
    for (const f of friendships) set.add(f.requesterId === userId ? f.addresseeId : f.requesterId);

    if (mine) {
      const mates = await this.prisma.squadMember.findMany({
        where: { squadId: mine.squadId, isActive: true },
        select: { userId: true },
      });
      for (const m of mates) set.add(m.userId);
    }

    return [...set];
  }

  async getFeed(userId: string, limit = 50): Promise<FeedItem[]> {
    const ids = await this.audience(userId);
    const events = await this.prisma.feedEvent.findMany({
      where: { userId: { in: ids } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true, githubLogin: true, displayName: true,
            avatarUrl: true, avatarVariant: true, rank: true,
          },
        },
      },
    });

    const equipped = await this.shop.equippedFor([...new Set(events.map((e) => e.userId))]);
    return events.map((e) => ({
      id: e.id,
      type: e.type,
      createdAt: e.createdAt.toISOString(),
      payload: (e.payload ?? {}) as Record<string, unknown>,
      user: { ...e.user, isMe: e.userId === userId, equipped: equipped[e.userId] ?? {} },
    }));
  }
}
