import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type Rarity = 'COMUM' | 'RARO' | 'EPICO' | 'LENDARIO';

const COIN_MAP: Record<Rarity, [number, number]> = {
  COMUM: [50, 150], RARO: [150, 350], EPICO: [400, 700], LENDARIO: [1000, 2000],
};
const GEM_MAP: Record<Rarity, [number, number]> = {
  COMUM: [0, 0], RARO: [1, 2], EPICO: [5, 10], LENDARIO: [20, 40],
};
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export interface PendingChest {
  id: string;
  rarity: string;
  source: string;
  earnedAt: Date;
}
export interface ChestRewardView {
  type: string;
  amount: number;
}

@Injectable()
export class ChestService {
  constructor(private readonly prisma: PrismaService) {}

  async getPending(userId: string): Promise<PendingChest[]> {
    // Seed inicial: 3 baús de boas-vindas se o user nunca teve nenhum.
    const total = await this.prisma.userChest.count({ where: { userId } });
    if (total === 0) {
      await this.prisma.userChest.createMany({
        data: [
          { userId, rarity: 'COMUM', source: 'EVENT' },
          { userId, rarity: 'RARO', source: 'EVENT' },
          { userId, rarity: 'EPICO', source: 'EVENT' },
        ],
      });
    }

    const chests = await this.prisma.userChest.findMany({
      where: { userId, openedAt: null },
      orderBy: { earnedAt: 'desc' },
    });
    return chests.map((c) => ({ id: c.id, rarity: c.rarity, source: c.source, earnedAt: c.earnedAt }));
  }

  async open(userId: string, chestId: string): Promise<{ rarity: string; rewards: ChestRewardView[] }> {
    const chest = await this.prisma.userChest.findFirst({ where: { id: chestId, userId } });
    if (!chest) throw new NotFoundException('Baú não encontrado');
    if (chest.openedAt) throw new BadRequestException('Baú já aberto');

    const rarity = chest.rarity as Rarity;
    const coins = rand(COIN_MAP[rarity][0], COIN_MAP[rarity][1]);
    const [gmin, gmax] = GEM_MAP[rarity];
    const gems = gmax > 0 ? rand(gmin, gmax) : 0;

    // Audit das recompensas
    await this.prisma.chestReward.create({ data: { chestId, rewardType: 'COINS', amount: coins } });
    if (gems > 0) {
      await this.prisma.chestReward.create({ data: { chestId, rewardType: 'GEMS', amount: gems } });
      await this.prisma.gemTransaction.create({
        data: { userId, amount: gems, source: 'CHEST', description: `Baú ${rarity}` },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: coins }, ...(gems > 0 ? { gems: { increment: gems } } : {}) },
    });
    await this.prisma.userChest.update({ where: { id: chestId }, data: { openedAt: new Date() } });

    const rewards: ChestRewardView[] = [{ type: 'COINS', amount: coins }];
    if (gems > 0) rewards.push({ type: 'GEMS', amount: gems });
    return { rarity, rewards };
  }
}
