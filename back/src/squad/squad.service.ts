import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Início da semana (segunda 00:00 UTC) — base do ranking semanal.
function weekStart(): Date {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0=dom .. 6=sáb
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

// Código de convite curto e legível (sem caracteres ambíguos).
function randomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (i === 2) out += '-';
  }
  return out; // ex: ABC-DEF
}

const MEMBER_SELECT = {
  githubLogin: true,
  displayName: true,
  avatarUrl: true,
  avatarVariant: true,
  rank: true,
  level: true,
  currentStreak: true,
};

export interface SquadMemberView {
  userId: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  currentStreak: number;
  role: string;
  weeklyXp?: number;
}

export interface SquadView {
  id: string;
  name: string;
  description: string | null;
  rank: string;
  maxMembers: number;
  isOwner: boolean;
  memberCount: number;
  members: SquadMemberView[];
}

@Injectable()
export class SquadService {
  constructor(private readonly prisma: PrismaService) {}

  private async activeMembership(userId: string) {
    return this.prisma.squadMember.findFirst({
      where: { userId, isActive: true },
    });
  }

  async createSquad(
    userId: string,
    name: string,
    description?: string,
  ): Promise<SquadView> {
    if (!name?.trim()) throw new BadRequestException('Nome obrigatório');
    if (await this.activeMembership(userId)) {
      throw new ConflictException('Você já está em uma squad');
    }

    const squad = await this.prisma.squad.create({
      data: { name: name.trim(), description: description?.trim() || null, ownerId: userId },
    });
    await this.prisma.squadMember.create({
      data: { userId, squadId: squad.id, role: 'OWNER', weekStartDate: weekStart() },
    });

    return this.getMySquad(userId) as Promise<SquadView>;
  }

  async joinByCode(userId: string, code: string): Promise<SquadView> {
    if (await this.activeMembership(userId)) {
      throw new ConflictException('Você já está em uma squad');
    }
    const invite = await this.prisma.squadInvite.findUnique({
      where: { code: code?.trim().toUpperCase() },
    });
    if (!invite) throw new NotFoundException('Código inválido');
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('Convite expirado');
    }
    if (invite.maxUses != null && invite.usedCount >= invite.maxUses) {
      throw new BadRequestException('Convite esgotado');
    }

    const squad = await this.prisma.squad.findUnique({
      where: { id: invite.squadId },
      include: { _count: { select: { members: { where: { isActive: true } } } } },
    });
    if (!squad) throw new NotFoundException('Squad não encontrada');
    if (squad._count.members >= squad.maxMembers) {
      throw new BadRequestException('Squad cheia');
    }

    await this.prisma.squadMember.upsert({
      where: { userId_squadId: { userId, squadId: invite.squadId } },
      create: { userId, squadId: invite.squadId, role: 'MEMBER', weekStartDate: weekStart() },
      update: { isActive: true },
    });
    await this.prisma.squadInvite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return this.getMySquad(userId) as Promise<SquadView>;
  }

  async getMySquad(userId: string): Promise<SquadView | null> {
    const membership = await this.activeMembership(userId);
    if (!membership) return null;

    const squad = await this.prisma.squad.findUnique({
      where: { id: membership.squadId },
      include: {
        members: {
          where: { isActive: true },
          include: { user: { select: MEMBER_SELECT } },
        },
      },
    });
    if (!squad) return null;

    return {
      id: squad.id,
      name: squad.name,
      description: squad.description,
      rank: squad.rank,
      maxMembers: squad.maxMembers,
      isOwner: squad.ownerId === userId,
      memberCount: squad.members.length,
      members: squad.members.map((m) => ({
        userId: m.userId,
        githubLogin: m.user.githubLogin,
        displayName: m.user.displayName,
        avatarUrl: m.user.avatarUrl,
        avatarVariant: m.user.avatarVariant,
        rank: m.user.rank,
        level: m.user.level,
        currentStreak: m.user.currentStreak,
        role: m.role,
      })),
    };
  }

  // Ranking semanal: XP ganho por cada membro desde segunda (XpTransaction real).
  async getLeaderboard(userId: string): Promise<SquadMemberView[]> {
    const squad = await this.getMySquad(userId);
    if (!squad) return [];

    const ids = squad.members.map((m) => m.userId);
    const since = weekStart();
    const sums = await this.prisma.xpTransaction.groupBy({
      by: ['userId'],
      where: { userId: { in: ids }, createdAt: { gte: since } },
      _sum: { amount: true },
    });
    const xpByUser = new Map(sums.map((s) => [s.userId, s._sum.amount ?? 0]));

    return squad.members
      .map((m) => ({ ...m, weeklyXp: xpByUser.get(m.userId) ?? 0 }))
      .sort((a, b) => (b.weeklyXp ?? 0) - (a.weeklyXp ?? 0));
  }

  async createInvite(userId: string): Promise<{ code: string }> {
    const membership = await this.activeMembership(userId);
    if (!membership) throw new NotFoundException('Você não está em uma squad');
    if (membership.role !== 'OWNER') {
      throw new ForbiddenException('Só o líder pode gerar convites');
    }

    // gera um código único
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomCode();
      const exists = await this.prisma.squadInvite.findUnique({ where: { code } });
      if (!exists) {
        await this.prisma.squadInvite.create({
          data: { squadId: membership.squadId, createdBy: userId, code },
        });
        return { code };
      }
    }
    throw new ConflictException('Tente novamente');
  }
}
