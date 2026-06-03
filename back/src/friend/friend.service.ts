import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const userSelect = {
  id: true,
  githubLogin: true,
  displayName: true,
  avatarUrl: true,
  avatarVariant: true,
  rank: true,
  level: true,
  currentStreak: true,
} as const;

export interface FriendRow {
  friendshipId: string;
  userId: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  currentStreak: number;
}
export interface FriendsView {
  friends: FriendRow[];
  incoming: FriendRow[]; // convites recebidos (pendentes p/ aceitar)
  outgoing: FriendRow[]; // convites enviados (aguardando)
}

@Injectable()
export class FriendService {
  constructor(private readonly prisma: PrismaService) {}

  async getFriends(userId: string): Promise<FriendsView> {
    const rows = await this.prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      include: { requester: { select: userSelect }, addressee: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    });

    const friends: FriendRow[] = [];
    const incoming: FriendRow[] = [];
    const outgoing: FriendRow[] = [];

    for (const f of rows) {
      const iAmRequester = f.requesterId === userId;
      const other = iAmRequester ? f.addressee : f.requester;
      const row: FriendRow = {
        friendshipId: f.id,
        userId: other.id,
        githubLogin: other.githubLogin,
        displayName: other.displayName,
        avatarUrl: other.avatarUrl,
        avatarVariant: other.avatarVariant,
        rank: other.rank,
        level: other.level,
        currentStreak: other.currentStreak,
      };
      if (f.status === 'ACCEPTED') friends.push(row);
      else if (iAmRequester) outgoing.push(row);
      else incoming.push(row);
    }

    return { friends, incoming, outgoing };
  }

  // Envia convite por @username (githubLogin). Se já existir convite reverso
  // pendente, aceita na hora (amizade mútua).
  async addByUsername(userId: string, login: string): Promise<FriendsView> {
    const handle = (login ?? '').trim().replace(/^@/, '');
    if (!handle) throw new BadRequestException('Informe um @usuário');

    const target = await this.prisma.user.findFirst({
      where: { githubLogin: { equals: handle, mode: 'insensitive' } },
      select: { id: true },
    });
    if (!target) throw new NotFoundException('Usuário não encontrado');
    if (target.id === userId) throw new BadRequestException('Você não pode se adicionar');

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: target.id },
          { requesterId: target.id, addresseeId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') throw new BadRequestException('Vocês já são amigos');
      // Convite reverso pendente → aceita.
      if (existing.addresseeId === userId) {
        await this.prisma.friendship.update({
          where: { id: existing.id },
          data: { status: 'ACCEPTED', respondedAt: new Date() },
        });
        return this.getFriends(userId);
      }
      throw new BadRequestException('Convite já enviado');
    }

    await this.prisma.friendship.create({
      data: { requesterId: userId, addresseeId: target.id, status: 'PENDING' },
    });
    return this.getFriends(userId);
  }

  async accept(userId: string, friendshipId: string): Promise<FriendsView> {
    const f = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!f || f.addresseeId !== userId) throw new NotFoundException('Convite não encontrado');
    if (f.status !== 'PENDING') throw new BadRequestException('Convite já respondido');
    await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    });
    return this.getFriends(userId);
  }

  // Remove amizade ou recusa/cancela convite (qualquer participante).
  async remove(userId: string, friendshipId: string): Promise<FriendsView> {
    const f = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!f || (f.requesterId !== userId && f.addresseeId !== userId)) {
      throw new NotFoundException('Amizade não encontrada');
    }
    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return this.getFriends(userId);
  }

  // IDs dos amigos aceitos — usado pelo feed.
  async friendIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });
    return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
  }
}
