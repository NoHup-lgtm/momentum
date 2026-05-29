import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/design';
import { CoinIcon, GemIcon, XPIcon } from '../../components/icons';

const { width: W } = Dimensions.get('window');

// ── Item data ─────────────────────────────────────────────────────────────────
const COIN_ITEMS = [
  { id: 'c1', name: 'Boné Dev',       rarity: 'comum',     price: 150,  currency: 'coin', owned: false },
  { id: 'c2', name: 'Hoodie Clone',   rarity: 'raro',      price: 280,  currency: 'coin', owned: false },
  { id: 'c3', name: 'Gorro Hacker',   rarity: 'comum',     price: 120,  currency: 'coin', owned: true  },
  { id: 'c4', name: 'Óculos Hack',    rarity: 'raro',      price: 200,  currency: 'coin', owned: false },
  { id: 'c5', name: 'Planta Desk',    rarity: 'comum',     price: 80,   currency: 'coin', owned: false },
  { id: 'c6', name: 'Teclado Mec.',   rarity: 'raro',      price: 350,  currency: 'coin', owned: false },
  { id: 'c7', name: 'Bucket Hat',     rarity: 'comum',     price: 100,  currency: 'coin', owned: false },
  { id: 'c8', name: 'Polo Corporat.', rarity: 'raro',      price: 240,  currency: 'coin', owned: false },
];

const GEM_ITEMS = [
  { id: 'g1', name: 'Hoodie Hacker 💜', rarity: 'épico',     price: 50,  currency: 'gem',  featured: true  },
  { id: 'g2', name: 'Coroa Dados',      rarity: 'épico',     price: 35,  currency: 'gem',  featured: false },
  { id: 'g3', name: 'Bg: Matrix',       rarity: 'lendário',  price: 80,  currency: 'gem',  featured: false },
  { id: 'g4', name: 'Headset Pro',      rarity: 'épico',     price: 40,  currency: 'gem',  featured: false },
];

const LEGEND_ITEMS = [
  { id: 'l1', name: '🔥 Chama Eterna',  rarity: 'lendário', condition: '100 dias de streak',   owned: false },
  { id: 'l2', name: '⚡ Aura Elétrica', rarity: 'lendário', condition: 'Top 1 por 4 semanas',  owned: false },
  { id: 'l3', name: '🌀 Espiral Viva',  rarity: 'lendário', condition: 'Alcance Legend rank',   owned: false },
];

const CHALLENGE_REWARDS = [
  { id: 'ch1', name: 'Kit Iniciante',    rarity: 'comum',  condition: '7 check-ins seguidos',       available: true  },
  { id: 'ch2', name: 'Pato de Borracha', rarity: 'raro',   condition: 'Faça 5 PRs em uma semana',   available: false },
  { id: 'ch3', name: 'Troféu de Ouro',   rarity: 'épico',  condition: 'Seja Top 1 da liga',         available: false },
  { id: 'ch4', name: 'Ampulheta Hacker', rarity: 'épico',  condition: '50 commits em um dia',       available: false },
];

const RARITY_COLOR: Record<string, string> = {
  comum: C.text3, raro: '#3a82f7', épico: C.purple, lendário: C.gold,
};

const TABS = ['moedas', 'gems', 'lendário', 'desafios'] as const;
type Tab = typeof TABS[number];

// ── Item Card ─────────────────────────────────────────────────────────────────
function ItemCard({ item, onBuy }: { item: any; onBuy: () => void }) {
  const rarityColor = RARITY_COLOR[item.rarity] ?? C.text3;
  const isGem = item.currency === 'gem';
  const isOwned = item.owned;

  // Pixel art placeholder: colored square with initials
  const initials = item.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
  const bgColor = isGem ? C.purple + '30' : isOwned ? C.success + '20' : C.surface2;

  return (
    <View style={[s.itemCard, isGem && s.itemCardGem, isOwned && s.itemCardOwned]}>
      {/* Art */}
      <View style={[s.itemArt, { backgroundColor: bgColor }]}>
        <Text style={[s.itemArtText, { color: rarityColor }]}>{initials}</Text>
      </View>

      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
      <View style={[s.rarityPill, { borderColor: rarityColor + '50', backgroundColor: rarityColor + '15' }]}>
        <Text style={[s.rarityText, { color: rarityColor }]}>{item.rarity}</Text>
      </View>

      {isOwned ? (
        <View style={s.ownedBadge}>
          <Text style={s.ownedText}>equipado ✓</Text>
        </View>
      ) : (
        <TouchableOpacity style={[s.buyBtn, isGem && s.buyBtnGem]} onPress={onBuy} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {isGem ? <GemIcon size={11} /> : <CoinIcon size={11} />}
            <Text style={[s.buyBtnText, isGem && { color: C.purple }]}>{item.price}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Legendary Item ────────────────────────────────────────────────────────────
function LegendItem({ item }: { item: typeof LEGEND_ITEMS[0] }) {
  return (
    <View style={s.legendCard}>
      <View style={s.legendLeft}>
        <Text style={s.legendName}>{item.name}</Text>
        <Text style={s.legendCondition}>{item.condition}</Text>
      </View>
      <TouchableOpacity style={s.howToBtn}>
        <Text style={s.howToText}>como ganhar</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Challenge Reward ──────────────────────────────────────────────────────────
function ChallengeItem({ item }: { item: typeof CHALLENGE_REWARDS[0] }) {
  const rarityColor = RARITY_COLOR[item.rarity] ?? C.text3;
  return (
    <View style={[s.challengeItem, item.available && s.challengeItemAvail]}>
      <View style={[s.challengeArt, { backgroundColor: rarityColor + '20' }]}>
        <Text style={{ fontSize: 20 }}>🎁</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.challengeName}>{item.name}</Text>
        <Text style={s.challengeCond}>{item.condition}</Text>
        <View style={[s.rarityPill, { borderColor: rarityColor + '50', backgroundColor: rarityColor + '15', alignSelf: 'flex-start', marginTop: 4 }]}>
          <Text style={[s.rarityText, { color: rarityColor }]}>{item.rarity}</Text>
        </View>
      </View>
      {item.available ? (
        <TouchableOpacity style={s.claimBtn}>
          <Text style={s.claimBtnText}>coletar</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.lockedBadge}>
          <Text style={s.lockedText}>🔒</Text>
        </View>
      )}
    </View>
  );
}

// ── Store Screen ──────────────────────────────────────────────────────────────
export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('moedas');
  const [coins, setCoins] = useState(480);
  const [gems, setGems] = useState(15);

  const handleBuyCoin = (price: number) => {
    if (coins >= price) setCoins(c => c - price);
  };
  const handleBuyGem = (price: number) => {
    if (gems >= price) setGems(g => g - price);
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>loja</Text>
        <View style={s.headerBalances}>
          <View style={s.headerBal}>
            <CoinIcon size={14} />
            <Text style={s.headerBalText}>{coins}</Text>
          </View>
          <View style={s.headerBal}>
            <GemIcon size={14} />
            <Text style={[s.headerBalText, { color: C.purple }]}>{gems}</Text>
          </View>
          <TouchableOpacity style={s.buyGemsBtn}>
            <Text style={s.buyGemsBtnText}>+ gems</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ paddingHorizontal: 18, gap: 6 }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && s.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {tab === 'moedas' && (
          <>
            {/* Featured banner */}
            <View style={s.featuredBanner}>
              <View>
                <Text style={s.featuredLabel}>ITEM DA SEMANA</Text>
                <Text style={s.featuredName}>Teclado Mecânico 🎹</Text>
                <Text style={s.featuredSub}>Acessório · Raro</Text>
              </View>
              <TouchableOpacity style={s.featuredBtn} onPress={() => handleBuyCoin(280)}>
                <CoinIcon size={13} />
                <Text style={s.featuredBtnText}>280</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>com moedas</Text>
            <View style={s.grid}>
              {COIN_ITEMS.map(item => (
                <ItemCard key={item.id} item={item} onBuy={() => handleBuyCoin(item.price)} />
              ))}
            </View>
          </>
        )}

        {tab === 'gems' && (
          <>
            {/* Featured gem item */}
            <View style={[s.featuredBanner, { borderColor: C.purple + '50', backgroundColor: C.purple + '12' }]}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={[s.featuredLabel, { color: C.purple }]}>DESTAQUE DA SEMANA</Text>
                  <View style={s.discountBadge}>
                    <Text style={s.discountText}>-20%</Text>
                  </View>
                </View>
                <Text style={s.featuredName}>Hoodie Hacker 💜</Text>
                <Text style={s.featuredSub}>Camisa · Épico</Text>
              </View>
              <TouchableOpacity style={[s.featuredBtn, { backgroundColor: C.purple }]} onPress={() => handleBuyGem(50)}>
                <GemIcon size={13} />
                <Text style={s.featuredBtnText}>50</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>premium · gems</Text>
            <View style={s.grid}>
              {GEM_ITEMS.slice(1).map(item => (
                <ItemCard key={item.id} item={item} onBuy={() => handleBuyGem(item.price)} />
              ))}
            </View>
          </>
        )}

        {tab === 'lendário' && (
          <>
            <View style={s.legendInfo}>
              <Text style={s.legendInfoText}>
                Itens lendários não são compráveis — são conquistados.
                Complete as condições para desbloqueá-los.
              </Text>
            </View>
            {LEGEND_ITEMS.map(item => (
              <LegendItem key={item.id} item={item} />
            ))}
          </>
        )}

        {tab === 'desafios' && (
          <>
            <Text style={s.sectionTitle}>recompensas de desafios</Text>
            {CHALLENGE_REWARDS.map(item => (
              <ChallengeItem key={item.id} item={item} />
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_W = (W - 18 * 2 - 10) / 2;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8,
  },
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: C.text, letterSpacing: -0.3,
  },
  headerBalances: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBal: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBalText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.gold,
  },
  buyGemsBtn: {
    backgroundColor: C.purple + '20', borderWidth: 1, borderColor: C.purple + '50',
    borderRadius: 5, paddingHorizontal: 9, paddingVertical: 4,
  },
  buyGemsBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.purple,
  },

  tabRow: { marginBottom: 4 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 6, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.surface2,
  },
  tabActive: { borderColor: C.accent, backgroundColor: C.accent + '15' },
  tabText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3,
  },
  tabTextActive: { color: C.accent },

  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },

  featuredBanner: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.gold + '30',
    padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  featuredLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.gold, letterSpacing: 0.1, marginBottom: 4,
  },
  featuredName: {
    fontFamily: 'Lora_400Regular', fontSize: 16,
    color: C.text, letterSpacing: -0.2,
  },
  featuredSub: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, marginTop: 2,
  },
  featuredBtn: {
    backgroundColor: C.accent, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  featuredBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#f2e4cf',
  },
  discountBadge: {
    backgroundColor: C.accent, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  discountText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: '#f2e4cf',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard: {
    width: CARD_W, backgroundColor: C.surface,
    borderRadius: 10, borderWidth: 1, borderColor: C.surface2,
    padding: 12, gap: 6,
  },
  itemCardGem: { borderColor: C.purple + '40' },
  itemCardOwned: { borderColor: C.success + '40' },
  itemArt: {
    width: '100%', height: CARD_W - 24, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  itemArtText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 22, fontWeight: '700',
  },
  itemName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text,
  },
  rarityPill: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  rarityText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
  },
  buyBtn: {
    backgroundColor: C.accent + '20', borderRadius: 5,
    paddingVertical: 6, alignItems: 'center',
    borderWidth: 1, borderColor: C.accent + '40',
  },
  buyBtnGem: {
    backgroundColor: C.purple + '15', borderColor: C.purple + '40',
  },
  buyBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.gold,
  },
  ownedBadge: {
    backgroundColor: C.success + '15', borderRadius: 5,
    paddingVertical: 5, alignItems: 'center',
  },
  ownedText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.success,
  },

  legendInfo: {
    backgroundColor: C.surface2, borderRadius: 8,
    padding: 14, borderWidth: 1, borderColor: C.gold + '30',
  },
  legendInfoText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, lineHeight: 18,
  },
  legendCard: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.gold + '30',
    padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
  },
  legendLeft: { flex: 1 },
  legendName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: C.text,
  },
  legendCondition: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, marginTop: 3,
  },
  howToBtn: {
    backgroundColor: C.surface2, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  howToText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3,
  },

  challengeItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, padding: 12,
  },
  challengeItemAvail: { borderColor: C.accent + '40' },
  challengeArt: {
    width: 48, height: 48, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  challengeName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text,
  },
  challengeCond: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, marginTop: 2,
  },
  claimBtn: {
    backgroundColor: C.accent, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  claimBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#f2e4cf',
  },
  lockedBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
  },
  lockedText: { fontSize: 14 },
});
