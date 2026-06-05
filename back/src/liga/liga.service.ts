import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FeedService } from '../feed/feed.service.js';

// ── Liga: competição individual por XP ganho em sprints de 2 semanas ───────────
// Regras (Arthur): ciclo de 14 dias começando no DOMINGO. Cada user está num
// tier (divisão). Ao fim do sprint: top N sobem de tier, bottom N descem.
// Sem cron: a gestão de season é LAZY — ao consultar a liga, garantimos a
// participação no sprint atual e liquidamos (settle) seasons passadas pendentes.

// Domingo âncora (UTC). 2026-01-04 é domingo. Todos os sprints derivam daqui.
const ANCHOR = Date.UTC(2026, 0, 4, 0, 0, 0);
const SPRINT_DAYS = 14;
const SPRINT_MS = SPRINT_DAYS * 24 * 60 * 60 * 1000;
const MAX_TIER = 6;
const PROMOTE_COUNT = 3; // top 3 sobem
const RELEGATE_COUNT = 3; // bottom 3 descem
// Recompensa em gems por posição final (top 3).
const REWARD_GEMS: Record<number, number> = { 1: 50, 2: 30, 3: 20 };

interface SprintInfo {
  sprintNumber: number;
  startsAt: Date;
  endsAt: Date;
}

export interface LigaEntry {
  position: number;
  userId: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  xpEarned: number;
  isMe: boolean;
}

export interface LigaView {
  tier: number;
  maxTier: number;
  sprintNumber: number;
  startsAt: string;
  endsAt: string;
  daysLeft: number;
  promoteCount: number;
  relegateCount: number;
  me: { position: number; xpEarned: number };
  entries: LigaEntry[];
}

@Injectable()
export class LigaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feed: FeedService,
  ) {}

  // Janela do sprint que contém `now`.
  private sprintInfo(now: Date): SprintInfo {
    const idx = Math.floor((now.getTime() - ANCHOR) / SPRINT_MS); // 0-based
    const startMs = ANCHOR + idx * SPRINT_MS;
    return {
      sprintNumber: idx + 1,
      startsAt: new Date(startMs),
      endsAt: new Date(startMs + SPRINT_MS),
    };
  }

  // Soma de XP ganho por user numa janela [start, end). Uma query (groupBy).
  private async xpEarnedMap(userIds: string[], start: Date, end: Date) {
    const map = new Map<string, number>();
    if (userIds.length === 0) return map;
    const grouped = await this.prisma.xpTransaction.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, createdAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    for (const g of grouped) map.set(g.userId, Math.max(0, g._sum.amount ?? 0));
    return map;
  }

  private clampTier(t: number) {
    return Math.min(MAX_TIER, Math.max(1, t));
  }

  // Liquida uma season encerrada: calcula posições finais, promove/rebaixa e
  // credita gems do pódio. Idempotente (se já liquidada, não faz nada).
  private async settleSeason(seasonId: string) {
    const season = await this.prisma.ligaSeason.findUnique({
      where: { id: seasonId },
      include: { participants: true },
    });
    if (!season) return;
    // Já liquidada? (qualquer participante com finalRank definido)
    if (season.participants.some((p) => p.finalRank != null)) return;

    const ids = season.participants.map((p) => p.userId);
    const xpMap = await this.xpEarnedMap(ids, season.startsAt, season.endsAt);
    const ranked = season.participants
      .map((p) => ({ p, xp: xpMap.get(p.userId) ?? 0 }))
      .sort((a, b) => b.xp - a.xp);

    const n = ranked.length;
    const canRelegate = n > PROMOTE_COUNT; // evita promover e rebaixar o mesmo

    // Monta todas as escritas (em vez de até ~3 queries sequenciais por
    // participante) e executa num único batch atômico. Os feeds (best-effort)
    // ficam fora da transação e são emitidos depois.
    const ops: Prisma.PrismaPromise<unknown>[] = [];
    const promotedUsers: string[] = [];

    for (let i = 0; i < n; i++) {
      const finalRank = i + 1;
      const { p, xp } = ranked[i];
      const promoted = finalRank <= PROMOTE_COUNT && season.tier < MAX_TIER;
      const relegated =
        canRelegate && finalRank > n - RELEGATE_COUNT && season.tier > 1;

      ops.push(
        this.prisma.ligaParticipant.update({
          where: { id: p.id },
          data: { finalRank, promoted, relegated, xpEarned: xp },
        }),
      );

      if (promoted) promotedUsers.push(p.userId);

      // Recompensa do pódio (gems) — creditada uma única vez na liquidação.
      const reward = REWARD_GEMS[finalRank];
      if (reward) {
        ops.push(
          this.prisma.gemTransaction.create({
            data: {
              userId: p.userId,
              amount: reward,
              source: 'EVENT_REWARD',
              description: `Liga: ${finalRank}º lugar (sprint #${season.sprintNumber})`,
            },
          }),
          this.prisma.user.update({
            where: { id: p.userId },
            data: { gems: { increment: reward } },
          }),
        );
      }
    }

    ops.push(
      this.prisma.ligaSeason.update({
        where: { id: seasonId },
        data: { isActive: false },
      }),
    );

    await this.prisma.$transaction(ops);

    // feeds best-effort após a liquidação (não bloqueiam nem revertem o batch)
    for (const userId of promotedUsers) {
      await this.feed.emit(userId, 'LIGA_PROMOTED', {
        fromTier: season.tier,
        toTier: season.tier + 1,
      });
    }
  }

  // Garante que o user participe do sprint atual, liquidando o passado e
  // aplicando promoção/rebaixamento para definir o tier de entrada.
  private async ensureParticipation(userId: string) {
    const now = new Date();
    const cur = this.sprintInfo(now);

    // Último participante do user (qualquer season), pelo número do sprint.
    const last = await this.prisma.ligaParticipant.findFirst({
      where: { userId },
      include: { season: true },
      orderBy: { season: { sprintNumber: 'desc' } },
    });

    // Já está no sprint atual → retorna.
    if (last && last.season.sprintNumber === cur.sprintNumber) {
      return { season: last.season, participant: last };
    }

    let targetTier = 1;
    if (last) {
      // Liquida a season passada (se ainda não liquidada) e usa o resultado.
      await this.settleSeason(last.seasonId);
      const settled = await this.prisma.ligaParticipant.findUnique({
        where: { id: last.id },
      });
      const delta = settled?.promoted ? 1 : settled?.relegated ? -1 : 0;
      targetTier = this.clampTier(last.season.tier + delta);
    }

    // Garante a season do tier alvo no sprint atual.
    const season = await this.prisma.ligaSeason.upsert({
      where: { tier_sprintNumber: { tier: targetTier, sprintNumber: cur.sprintNumber } },
      create: {
        tier: targetTier,
        sprintNumber: cur.sprintNumber,
        startsAt: cur.startsAt,
        endsAt: cur.endsAt,
        isActive: true,
      },
      update: {},
    });

    // Garante o participante.
    const participant = await this.prisma.ligaParticipant.upsert({
      where: { seasonId_userId: { seasonId: season.id, userId } },
      create: { seasonId: season.id, userId },
      update: {},
    });

    return { season, participant };
  }

  // View da liga do user: classificação ao vivo do sprint atual.
  async getMyLiga(userId: string): Promise<LigaView> {
    const { season } = await this.ensureParticipation(userId);

    const participants = await this.prisma.ligaParticipant.findMany({
      where: { seasonId: season.id },
      include: {
        user: {
          select: {
            id: true,
            githubLogin: true,
            displayName: true,
            avatarUrl: true,
            avatarVariant: true,
            rank: true,
            level: true,
          },
        },
      },
    });

    const ids = participants.map((p) => p.userId);
    const xpMap = await this.xpEarnedMap(ids, season.startsAt, season.endsAt);

    const entries: LigaEntry[] = participants
      .map((p) => ({
        userId: p.userId,
        githubLogin: p.user.githubLogin,
        displayName: p.user.displayName,
        avatarUrl: p.user.avatarUrl,
        avatarVariant: p.user.avatarVariant,
        rank: p.user.rank,
        level: p.user.level,
        xpEarned: xpMap.get(p.userId) ?? 0,
        isMe: p.userId === userId,
      }))
      .sort((a, b) => b.xpEarned - a.xpEarned)
      .map((e, i) => ({ position: i + 1, ...e }));

    const me = entries.find((e) => e.isMe);
    const now = Date.now();
    const daysLeft = Math.max(
      0,
      Math.ceil((season.endsAt.getTime() - now) / (24 * 60 * 60 * 1000)),
    );

    return {
      tier: season.tier,
      maxTier: MAX_TIER,
      sprintNumber: season.sprintNumber,
      startsAt: season.startsAt.toISOString(),
      endsAt: season.endsAt.toISOString(),
      daysLeft,
      promoteCount: season.tier < MAX_TIER ? PROMOTE_COUNT : 0,
      relegateCount: season.tier > 1 ? RELEGATE_COUNT : 0,
      me: { position: me?.position ?? 0, xpEarned: me?.xpEarned ?? 0 },
      entries,
    };
  }
}
