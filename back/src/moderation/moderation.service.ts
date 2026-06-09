import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  // IDs envolvidos num bloqueio com o usuário (eu bloqueei OU me bloquearam).
  // Usado pra sumir um do outro em feed/ranking.
  async blockedPairIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });
    const set = new Set<string>();
    for (const r of rows) set.add(r.blockerId === userId ? r.blockedId : r.blockerId);
    return [...set];
  }

  // Existe bloqueio em qualquer direção entre a e b?
  async isBlockedEitherWay(a: string, b: string): Promise<boolean> {
    const row = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: a, blockedId: b },
          { blockerId: b, blockedId: a },
        ],
      },
      select: { id: true },
    });
    return row != null;
  }

  // Eu bloqueei o alvo? (pra UI mostrar bloquear/desbloquear)
  async iBlocked(userId: string, targetId: string): Promise<boolean> {
    const row = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } },
      select: { id: true },
    });
    return row != null;
  }

  async block(userId: string, targetId: string) {
    if (userId === targetId) throw new BadRequestException('Você não pode se bloquear');
    // bloquear desfaz qualquer amizade/convite entre os dois
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: userId },
        ],
      },
    });
    await this.prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } },
      create: { blockerId: userId, blockedId: targetId },
      update: {},
    });
    return { ok: true };
  }

  async unblock(userId: string, targetId: string) {
    await this.prisma.block.deleteMany({ where: { blockerId: userId, blockedId: targetId } });
    return { ok: true };
  }

  async report(userId: string, targetId: string, reason: string) {
    if (userId === targetId) throw new BadRequestException('Você não pode se denunciar');
    await this.prisma.report.create({
      data: { reporterId: userId, reportedId: targetId, reason: reason.slice(0, 200) },
    });
    return { ok: true };
  }
}
