import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Catálogo de cosméticos (chave estável em `name`; o mobile localiza pela chave).
const CATALOG = [
  { key: 'dev_cap',       category: 'HAT' as const,        rarity: 'COMMON' as const, coins: 150 },
  { key: 'hacker_beanie', category: 'HAT' as const,        rarity: 'COMMON' as const, coins: 120 },
  { key: 'desk_plant',    category: 'ACCESSORY' as const,  rarity: 'COMMON' as const, coins: 80 },
  { key: 'clone_hoodie',  category: 'SHIRT' as const,      rarity: 'RARE' as const,   coins: 280 },
  { key: 'hack_glasses',  category: 'GLASSES' as const,    rarity: 'RARE' as const,   coins: 200 },
  { key: 'mech_keyboard', category: 'ACCESSORY' as const,  rarity: 'RARE' as const,   coins: 350 },
  { key: 'space_helmet',  category: 'HAT' as const,        rarity: 'RARE' as const,   coins: 310 },
  { key: 'matrix_bg',     category: 'BACKGROUND' as const, rarity: 'PREMIUM' as const, coins: 500 },
];

export interface ShopItem {
  id: string;
  key: string;
  category: string;
  rarity: string;
  priceCoins: number;
  owned: boolean;
}
export interface ShopView {
  coins: number;
  gems: number;
  items: ShopItem[];
}

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCatalog() {
    const out: { id: string; def: (typeof CATALOG)[number] }[] = [];
    for (const c of CATALOG) {
      let row = await this.prisma.cosmetic.findFirst({ where: { name: c.key } });
      if (!row) {
        row = await this.prisma.cosmetic.create({
          data: { name: c.key, category: c.category, rarity: c.rarity, priceCoins: c.coins },
        });
      }
      out.push({ id: row.id, def: c });
    }
    return out;
  }

  async getShop(userId: string): Promise<ShopView> {
    const catalog = await this.ensureCatalog();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, gems: true },
    });
    const owned = await this.prisma.userCosmetic.findMany({
      where: { userId },
      select: { cosmeticId: true },
    });
    const ownedSet = new Set(owned.map((o) => o.cosmeticId));

    return {
      coins: user?.coins ?? 0,
      gems: user?.gems ?? 0,
      items: catalog.map(({ id, def }) => ({
        id,
        key: def.key,
        category: def.category,
        rarity: def.rarity,
        priceCoins: def.coins,
        owned: ownedSet.has(id),
      })),
    };
  }

  async buy(userId: string, cosmeticId: string): Promise<ShopView> {
    const cosmetic = await this.prisma.cosmetic.findUnique({ where: { id: cosmeticId } });
    if (!cosmetic) throw new NotFoundException('Item não encontrado');

    const already = await this.prisma.userCosmetic.findUnique({
      where: { userId_cosmeticId: { userId, cosmeticId } },
    });
    if (already) throw new BadRequestException('Você já tem esse item');

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
    if ((user?.coins ?? 0) < cosmetic.priceCoins) {
      throw new BadRequestException('Moedas insuficientes');
    }

    await this.prisma.userCosmetic.create({
      data: { userId, cosmeticId, obtainedSource: 'PURCHASED_COINS' },
    });
    await this.prisma.coinTransaction.create({
      data: { userId, amount: -cosmetic.priceCoins, source: 'PURCHASE_ITEM', description: `Loja: ${cosmetic.name}` },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: cosmetic.priceCoins } },
    });

    return this.getShop(userId);
  }
}
