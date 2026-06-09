import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShopService } from '../shop/shop.service.js';
import { PushService, type PushPayload, type PushCategory } from '../push/push.service.js';
import { ModerationService } from '../moderation/moderation.service.js';

type FeedType =
  | 'STREAK_MILESTONE' | 'LEVEL_UP' | 'RANK_UP' | 'ACHIEVEMENT'
  | 'CHEST_LEGENDARY' | 'SQUAD_JOIN' | 'LIGA_PROMOTED' | 'CHALLENGE_COMPLETED';

// Escopo do feed: rede do usuário, global (todos) ou colegas da liga atual.
export type FeedScope = 'friends' | 'global' | 'liga';

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

// Tipos que viram push SOCIAL (avisa a rede: amigos + colegas de squad). Só os
// raros/impressionantes — pra não spammar.
const SOCIAL_TYPES = new Set<FeedType>(['LIGA_PROMOTED', 'RANK_UP', 'STREAK_MILESTONE']);

// Categoria de preferência por tipo de evento (push pro próprio ator).
function categoryFor(type: FeedType): PushCategory {
  switch (type) {
    case 'STREAK_MILESTONE': return 'streak';
    case 'LIGA_PROMOTED': return 'liga';
    default: return 'wins'; // ACHIEVEMENT, LEVEL_UP, RANK_UP, CHEST_LEGENDARY
  }
}

function socialPushFor(type: FeedType, name: string, payload: Record<string, unknown>): PushPayload | null {
  switch (type) {
    case 'LIGA_PROMOTED':
      return { title: '🏆 sua rede tá subindo', body: `${name} subiu de divisão na liga 👀`, url: '/liga', tag: 'social-liga' };
    case 'RANK_UP':
      return { title: '⬆️ alguém evoluiu', body: `${name} subiu de rank no momentum`, url: '/feed', tag: 'social-rank' };
    case 'STREAK_MILESTONE': {
      const s = Number(payload.streak ?? 0);
      return { title: '🔥 ofensiva monstra', body: s > 0 ? `${name} chegou a ${s} dias de streak` : `${name} bateu um marco de ofensiva`, url: '/feed', tag: 'social-streak' };
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
    private readonly moderation: ModerationService,
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
    if (p) this.push.sendToUser(userId, p, categoryFor(type)).catch(() => {});

    // push social: avisa amigos + squad dos eventos impressionantes
    if (SOCIAL_TYPES.has(type)) this.sendSocialPush(userId, type, payload).catch(() => {});
  }

  // Notifica a rede do ator (amigos aceitos + colegas de squad, menos ele mesmo).
  private async sendSocialPush(
    actorId: string,
    type: FeedType,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { displayName: true, githubLogin: true },
    });
    const name = actor?.displayName || actor?.githubLogin || 'alguém';
    const sp = socialPushFor(type, name, payload);
    if (!sp) return;

    const audience = (await this.audience(actorId)).filter((id) => id !== actorId);
    await Promise.all(audience.map((uid) => this.push.sendToUser(uid, sp, 'social')));
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

  // Audiência "liga": participantes da minha season ATIVA atual (mesma "leva").
  // Query leve e desacoplada (não cria participação — diferente do liga.service).
  private async ligaAudience(userId: string): Promise<string[]> {
    const mine = await this.prisma.ligaParticipant.findFirst({
      where: { userId, season: { isActive: true } },
      select: { seasonId: true },
    });
    if (!mine) return [userId];
    const parts = await this.prisma.ligaParticipant.findMany({
      where: { seasonId: mine.seasonId },
      select: { userId: true },
    });
    return parts.map((p) => p.userId);
  }

  async getFeed(
    userId: string,
    scope: FeedScope = 'friends',
    limit = 50,
  ): Promise<FeedItem[]> {
    // bloqueados somem do feed (eu bloqueei OU me bloquearam)
    const blocked = await this.moderation.blockedPairIds(userId);

    // global = todo mundo (só eventos públicos) · liga = minha season · friends = eu+amigos+squad
    const where =
      scope === 'global'
        ? { visibility: 'GLOBAL' as const, ...(blocked.length ? { userId: { notIn: blocked } } : {}) }
        : {
            userId: {
              in: (scope === 'liga' ? await this.ligaAudience(userId) : await this.audience(userId)).filter(
                (id) => !blocked.includes(id),
              ),
            },
          };

    const events = await this.prisma.feedEvent.findMany({
      where,
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
