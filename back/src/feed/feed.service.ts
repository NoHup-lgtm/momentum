import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShopService } from '../shop/shop.service.js';
import { PushService, type PushPayload } from '../push/push.service.js';

type FeedType =
  | 'STREAK_MILESTONE' | 'LEVEL_UP' | 'RANK_UP' | 'ACHIEVEMENT'
  | 'CHEST_LEGENDARY' | 'SQUAD_JOIN' | 'LIGA_PROMOTED' | 'CHALLENGE_COMPLETED';

// Push por tipo de evento (só os celebratórios/assíncronos). CHALLENGE_COMPLETED
// e SQUAD_JOIN vêm de ação na hora (usuário no app) → sem push (redundante).
function pushFor(type: FeedType, payload: Record<string, unknown>): PushPayload | null {
  switch (type) {
    case 'ACHIEVEMENT': {
      const xp = Number(payload.xp ?? 0);
      return { title: '🏅 nova conquista!', body: xp > 0 ? `conquista desbloqueada · +${xp} XP` : 'você desbloqueou uma conquista.', url: '/achievements', tag: 'achievement' };
    }
    case 'LIGA_PROMOTED':
      return { title: '🏆 subiu de divisão!', body: 'você foi promovido na liga. bora pro topo. 🚀', url: '/liga', tag: 'liga' };
    case 'RANK_UP':
      return { title: '⬆️ novo rank!', body: 'você evoluiu de rank. mantém o ritmo.', url: '/', tag: 'rank' };
    case 'LEVEL_UP':
      return { title: '⬆️ subiu de nível!', body: 'mais XP, mais momentum.', url: '/', tag: 'level' };
    case 'CHEST_LEGENDARY':
      return { title: '🎁 baú lendário!', body: 'um item lendário te espera.', url: '/', tag: 'chest' };
    case 'STREAK_MILESTONE': {
      const s = Number(payload.streak ?? 0);
      return { title: '🔥 marco de ofensiva!', body: s > 0 ? `${s} dias seguidos. lendário.` : 'novo recorde de ofensiva!', url: '/', tag: 'streak-milestone' };
    }
    default:
      return null;
  }
}

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
    private readonly push: PushService,
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

    // notificação push do evento (best-effort, não bloqueia)
    const p = pushFor(type, payload);
    if (p) this.push.sendToUser(userId, p).catch(() => {});
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
