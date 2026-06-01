import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Catálogo de cosméticos. A `key` é o id da pixel-art (PixelItem/GRIDS) e a
// chave de localização no mobile. Item é comprado com coins OU gems.
type Cat = 'HAT' | 'SHIRT' | 'GLASSES' | 'ACCESSORY' | 'BACKGROUND';
type Rar = 'COMMON' | 'RARE' | 'PREMIUM' | 'LEGENDARY';
type Def = { key: string; category: Cat; rarity: Rar; coins?: number; gems?: number };

const CATALOG: Def[] = [
  // ── Moedas ──
  { key: 'c1',  category: 'HAT',       rarity: 'COMMON', coins: 150 },
  { key: 'c2',  category: 'SHIRT',     rarity: 'RARE',   coins: 280 },
  { key: 'c3',  category: 'HAT',       rarity: 'COMMON', coins: 120 },
  { key: 'c4',  category: 'GLASSES',   rarity: 'RARE',   coins: 200 },
  { key: 'c5',  category: 'ACCESSORY', rarity: 'COMMON', coins: 80 },
  { key: 'c6',  category: 'ACCESSORY', rarity: 'RARE',   coins: 350 },
  { key: 'c7',  category: 'HAT',       rarity: 'COMMON', coins: 100 },
  { key: 'c8',  category: 'SHIRT',     rarity: 'RARE',   coins: 240 },
  { key: 'c9',  category: 'SHIRT',     rarity: 'COMMON', coins: 130 },
  { key: 'c10', category: 'ACCESSORY', rarity: 'RARE',   coins: 220 },
  { key: 'c11', category: 'HAT',       rarity: 'RARE',   coins: 310 },
  { key: 'c12', category: 'ACCESSORY', rarity: 'COMMON', coins: 60 },
  { key: 'c13', category: 'ACCESSORY', rarity: 'RARE',   coins: 190 },
  { key: 'c14', category: 'ACCESSORY', rarity: 'RARE',   coins: 175 },
  { key: 'c15', category: 'ACCESSORY', rarity: 'RARE',   coins: 260 },
  { key: 'c16', category: 'HAT',       rarity: 'COMMON', coins: 90 },
  // ── Gems ──
  { key: 'g1',  category: 'SHIRT',      rarity: 'PREMIUM',   gems: 50 },
  { key: 'g2',  category: 'HAT',        rarity: 'PREMIUM',   gems: 35 },
  { key: 'g3',  category: 'BACKGROUND', rarity: 'LEGENDARY', gems: 80 },
  { key: 'g4',  category: 'ACCESSORY',  rarity: 'PREMIUM',   gems: 40 },
  { key: 'g5',  category: 'SHIRT',      rarity: 'PREMIUM',   gems: 55 },
  { key: 'g6',  category: 'SHIRT',      rarity: 'PREMIUM',   gems: 65 },
  { key: 'g7',  category: 'ACCESSORY',  rarity: 'PREMIUM',   gems: 45 },
  { key: 'g8',  category: 'ACCESSORY',  rarity: 'PREMIUM',   gems: 40 },
  { key: 'g9',  category: 'BACKGROUND', rarity: 'RARE',      gems: 25 },
  { key: 'g10', category: 'BACKGROUND', rarity: 'PREMIUM',   gems: 60 },
  { key: 'g11', category: 'HAT',        rarity: 'PREMIUM',   gems: 48 },
  { key: 'g12', category: 'ACCESSORY',  rarity: 'PREMIUM',   gems: 52 },
  { key: 'g13', category: 'ACCESSORY',  rarity: 'PREMIUM',   gems: 38 },
  { key: 'g14', category: 'ACCESSORY',  rarity: 'LEGENDARY', gems: 95 },
];

export interface ShopItem {
  id: string;
  key: string;
  category: string;
  rarity: string;
  priceCoins: number;
  priceGems: number;
  owned: boolean;
  equipped: boolean;
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
    const out: { id: string; def: Def }[] = [];
    for (const c of CATALOG) {
      let row = await this.prisma.cosmetic.findFirst({ where: { name: c.key } });
      if (!row) {
        row = await this.prisma.cosmetic.create({
          data: {
            name: c.key,
            category: c.category,
            rarity: c.rarity,
            priceCoins: c.coins ?? 0,
            priceGems: c.gems ?? 0,
          },
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
    const equipped = await this.prisma.userEquippedCosmetic.findMany({
      where: { userId },
      select: { cosmeticId: true },
    });
    const ownedSet = new Set(owned.map((o) => o.cosmeticId));
    const equippedSet = new Set(equipped.map((e) => e.cosmeticId));

    return {
      coins: user?.coins ?? 0,
      gems: user?.gems ?? 0,
      items: catalog.map(({ id, def }) => ({
        id,
        key: def.key,
        category: def.category,
        rarity: def.rarity,
        priceCoins: def.coins ?? 0,
        priceGems: def.gems ?? 0,
        owned: ownedSet.has(id),
        equipped: equippedSet.has(id),
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

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { coins: true, gems: true } });
    const useGems = cosmetic.priceGems > 0;

    if (useGems) {
      if ((user?.gems ?? 0) < cosmetic.priceGems) throw new BadRequestException('Gems insuficientes');
    } else {
      if ((user?.coins ?? 0) < cosmetic.priceCoins) throw new BadRequestException('Moedas insuficientes');
    }

    await this.prisma.userCosmetic.create({
      data: { userId, cosmeticId, obtainedSource: useGems ? 'PURCHASED_GEMS' : 'PURCHASED_COINS' },
    });

    if (useGems) {
      await this.prisma.gemTransaction.create({
        data: { userId, amount: -cosmetic.priceGems, source: 'PURCHASE_ITEM', description: `Loja: ${cosmetic.name}` },
      });
      await this.prisma.user.update({ where: { id: userId }, data: { gems: { decrement: cosmetic.priceGems } } });
    } else {
      await this.prisma.coinTransaction.create({
        data: { userId, amount: -cosmetic.priceCoins, source: 'PURCHASE_ITEM', description: `Loja: ${cosmetic.name}` },
      });
      await this.prisma.user.update({ where: { id: userId }, data: { coins: { decrement: cosmetic.priceCoins } } });
    }

    return this.getShop(userId);
  }

  // Equipa um cosmético que o user possui (1 por categoria).
  async equip(userId: string, cosmeticId: string): Promise<ShopView> {
    const cosmetic = await this.prisma.cosmetic.findUnique({ where: { id: cosmeticId } });
    if (!cosmetic) throw new NotFoundException('Item não encontrado');
    const owns = await this.prisma.userCosmetic.findUnique({
      where: { userId_cosmeticId: { userId, cosmeticId } },
    });
    if (!owns) throw new BadRequestException('Você não tem esse item');

    await this.prisma.userEquippedCosmetic.upsert({
      where: { userId_category: { userId, category: cosmetic.category } },
      create: { userId, category: cosmetic.category, cosmeticId },
      update: { cosmeticId },
    });
    return this.getShop(userId);
  }
}
