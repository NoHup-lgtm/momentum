import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/design';
import { useTheme } from '../../contexts/ThemeContext';
import { CoinIcon, GemIcon, GiftIcon, LockIcon } from '../../components/icons';
import { PixelItem } from '../../components/store/PixelItem';
import { Toast, type ToastHandle } from '../../components/ui/Toast';

const { width: W } = Dimensions.get('window');

// ── Item data ─────────────────────────────────────────────────────────────────
const COIN_ITEMS = [
  { id: 'c1',  name: 'Boné Dev',         rarity: 'comum',  price: 150, currency: 'coin', owned: false },
  { id: 'c2',  name: 'Hoodie Clone',      rarity: 'raro',   price: 280, currency: 'coin', owned: false },
  { id: 'c3',  name: 'Gorro Hacker',      rarity: 'comum',  price: 120, currency: 'coin', owned: true  },
  { id: 'c4',  name: 'Oculos Hack',       rarity: 'raro',   price: 200, currency: 'coin', owned: false },
  { id: 'c5',  name: 'Planta Desk',       rarity: 'comum',  price: 80,  currency: 'coin', owned: false },
  { id: 'c6',  name: 'Teclado Mec.',      rarity: 'raro',   price: 350, currency: 'coin', owned: false },
  { id: 'c7',  name: 'Bucket Hat',        rarity: 'comum',  price: 100, currency: 'coin', owned: false },
  { id: 'c8',  name: 'Polo Corp.',        rarity: 'raro',   price: 240, currency: 'coin', owned: false },
  { id: 'c9',  name: 'Jaleco Lab',        rarity: 'comum',  price: 130, currency: 'coin', owned: false },
  { id: 'c10', name: 'Mochila Git',       rarity: 'raro',   price: 220, currency: 'coin', owned: false },
  { id: 'c11', name: 'Capacete Espacial', rarity: 'raro',   price: 310, currency: 'coin', owned: false },
  { id: 'c12', name: 'Caneca Dev',        rarity: 'comum',  price: 60,  currency: 'coin', owned: false },
  { id: 'c13', name: 'Cachecol Binario',  rarity: 'raro',   price: 190, currency: 'coin', owned: false },
  { id: 'c14', name: 'Luvas Taticas',     rarity: 'raro',   price: 175, currency: 'coin', owned: false },
  { id: 'c15', name: 'Robo de Mesa',      rarity: 'raro',   price: 260, currency: 'coin', owned: false },
  { id: 'c16', name: 'Faixa de Antena',   rarity: 'comum',  price: 90,  currency: 'coin', owned: false },
];

const GEM_ITEMS = [
  { id: 'g1',  name: 'Hoodie do Void',    rarity: 'epico',    price: 50,  currency: 'gem', featured: true  },
  { id: 'g2',  name: 'Coroa de Dados',    rarity: 'epico',    price: 35,  currency: 'gem', featured: false },
  { id: 'g3',  name: 'Bg: Matrix',        rarity: 'lendario', price: 80,  currency: 'gem', featured: false },
  { id: 'g4',  name: 'Headset Pro',       rarity: 'epico',    price: 40,  currency: 'gem', featured: false },
  { id: 'g5',  name: 'Manto do Void',     rarity: 'epico',    price: 55,  currency: 'gem', featured: false },
  { id: 'g6',  name: 'Armadura Neon',     rarity: 'epico',    price: 65,  currency: 'gem', featured: false },
  { id: 'g7',  name: 'Lamina de Plasma',  rarity: 'epico',    price: 45,  currency: 'gem', featured: false },
  { id: 'g8',  name: 'Drone Vigilia',     rarity: 'epico',    price: 40,  currency: 'gem', featured: false },
  { id: 'g9',  name: 'Bg: Circuito',      rarity: 'raro',     price: 25,  currency: 'gem', featured: false },
  { id: 'g10', name: 'Bg: Cosmos',        rarity: 'epico',    price: 60,  currency: 'gem', featured: false },
  { id: 'g11', name: 'Tiara Neural',      rarity: 'epico',    price: 48,  currency: 'gem', featured: false },
  { id: 'g12', name: 'Cubo Quantico',     rarity: 'epico',    price: 52,  currency: 'gem', featured: false },
  { id: 'g13', name: 'Escudo de Bits',    rarity: 'epico',    price: 38,  currency: 'gem', featured: false },
  { id: 'g14', name: 'Bastao do Void',    rarity: 'lendario', price: 95,  currency: 'gem', featured: false },
];

const LEGEND_ITEMS = [
  { id: 'l1', name: 'Chama Eterna',    rarity: 'lendario', condition: '100 dias de streak'          },
  { id: 'l2', name: 'Aura Eletrica',   rarity: 'lendario', condition: 'Top 1 por 4 semanas'         },
  { id: 'l3', name: 'Espiral Viva',    rarity: 'lendario', condition: 'Alcance o rank Legend'       },
  { id: 'l4', name: 'Protocolo Zero',  rarity: 'lendario', condition: '100 commits em um unico dia' },
  { id: 'l5', name: 'Olho do Sistema', rarity: 'lendario', condition: 'Desbloqueie todas as outras' },
];

const CHALLENGE_REWARDS = [
  { id: 'ch1', name: 'Kit Iniciante',     rarity: 'comum',    condition: '7 check-ins seguidos',      available: true  },
  { id: 'ch2', name: 'Pato Depurador',    rarity: 'raro',     condition: 'Faca 5 PRs em uma semana',  available: false },
  { id: 'ch3', name: 'Trofeu de Ouro',    rarity: 'epico',    condition: 'Seja Top 1 da liga',        available: false },
  { id: 'ch4', name: 'Ampulheta Hacker',  rarity: 'epico',    condition: '50 commits em um dia',      available: false },
  { id: 'ch5', name: 'Robo de Batalha',   rarity: 'epico',    condition: 'Venca 3 ligas seguidas',    available: false },
  { id: 'ch6', name: 'Espada Binaria',    rarity: 'lendario', condition: 'Alcance streak de 200 dias', available: false },
];

const RARITY_COLOR: Record<string, string> = {
  comum: C.text3, raro: '#3a82f7', epico: C.purple, lendario: C.gold,
};

const TABS = ['moedas', 'gems', 'lendario', 'desafios'] as const;
type Tab = typeof TABS[number];

// ── Item Card ─────────────────────────────────────────────────────────────────
function ItemCard({ item, onBuy, onPreview }: { item: any; onBuy: (name: string) => void; onPreview: (item: any) => void }) {
  const rarityColor = RARITY_COLOR[item.rarity] ?? C.text3;
  const isGem = item.currency === 'gem';
  const isOwned = item.owned;
  const bgColor = isGem ? C.purple + '18' : isOwned ? C.success + '15' : C.surface2;

  return (
    <View style={[s.itemCard, isGem && s.itemCardGem, isOwned && s.itemCardOwned]}>
      {/* Pixel art */}
      <TouchableOpacity onPress={() => onPreview(item)} activeOpacity={0.85}>
        <View style={[s.itemArt, { backgroundColor: bgColor }]}>
          <PixelItem id={item.id} size={CARD_W - 32} />
        </View>
      </TouchableOpacity>

      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
      <View style={[s.rarityPill, { borderColor: rarityColor + '50', backgroundColor: rarityColor + '15' }]}>
        <Text style={[s.rarityText, { color: rarityColor }]}>{item.rarity}</Text>
      </View>

      {isOwned ? (
        <View style={s.ownedBadge}>
          <Text style={s.ownedText}>equipado</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[s.buyBtn, isGem && s.buyBtnGem]}
          onPress={() => onBuy(item.name)}
          activeOpacity={0.8}
        >
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
        <PixelItem id={item.id} size={40} />
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
          <LockIcon size={18} color={C.text3} />
        </View>
      )}
    </View>
  );
}

// ── Store Screen ──────────────────────────────────────────────────────────────
export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('moedas');
  const [coins, setCoins] = useState(480);
  const [gems, setGems] = useState(15);
  const [preview, setPreview] = useState<any | null>(null);
  const toastRef = useRef<ToastHandle>(null);

  const handleBuyCoin = (price: number, name: string) => {
    if (coins >= price) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCoins(c => c - price);
      toastRef.current?.show(`${name} equipado`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toastRef.current?.show('moedas insuficientes', 'info');
    }
  };
  const handleBuyGem = (price: number, name: string) => {
    if (gems >= price) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGems(g => g - price);
      toastRef.current?.show(`${name} equipado`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toastRef.current?.show('gems insuficientes', 'info');
    }
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      <Toast ref={toastRef} />
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
            style={[
              s.tab,
              tab === t && { backgroundColor: colors.accent + '18', borderColor: colors.accent + '50' },
            ]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && { color: colors.accent }]}>{t}</Text>
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
                <Text style={s.featuredName}>Teclado Mecanico</Text>
                <Text style={s.featuredSub}>Acessorio · Raro</Text>
              </View>
              <TouchableOpacity style={s.featuredBtn} onPress={() => handleBuyCoin(280, 'Teclado Mecanico')}>
                <CoinIcon size={13} />
                <Text style={s.featuredBtnText}>280</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>com moedas</Text>
            <View style={s.grid}>
              {COIN_ITEMS.map(item => (
                <ItemCard key={item.id} item={item} onBuy={(name) => handleBuyCoin(item.price, name)} onPreview={(item) => setPreview(item)} />
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
                <Text style={s.featuredName}>Hoodie do Void</Text>
                <Text style={s.featuredSub}>Camisa · Epico</Text>
              </View>
              <TouchableOpacity style={[s.featuredBtn, { backgroundColor: C.purple }]} onPress={() => handleBuyGem(50, 'Hoodie do Void')}>
                <GemIcon size={13} />
                <Text style={s.featuredBtnText}>50</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>premium · gems</Text>
            <View style={s.grid}>
              {GEM_ITEMS.slice(1).map(item => (
                <ItemCard key={item.id} item={item} onBuy={(name) => handleBuyGem(item.price, name)} onPreview={(item) => setPreview(item)} />
              ))}
            </View>
          </>
        )}

        {tab === 'lendario' && (
          <>
            <View style={s.legendInfo}>
              <Text style={s.legendInfoText}>
                Itens lendarios nao sao compraveis — sao conquistados.
                Complete as condicoes para desbloquea-los.
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

      {/* Item preview modal */}
      <Modal visible={!!preview} transparent animationType="slide" onRequestClose={() => setPreview(null)}>
        <TouchableOpacity style={pv.backdrop} activeOpacity={1} onPress={() => setPreview(null)}>
          <View style={pv.sheet} onStartShouldSetResponder={() => true}>
            {preview && (() => {
              const rarityColor = RARITY_COLOR[preview.rarity] ?? C.text3;
              const isGem = preview.currency === 'gem';
              return (
                <>
                  <Text style={pv.label}>visualização</Text>
                  {/* Large preview art */}
                  <View style={[pv.artFrame, { borderColor: rarityColor + '40' }]}>
                    <PixelItem id={preview.id} size={140} />
                  </View>
                  <Text style={pv.name}>{preview.name}</Text>
                  <View style={[pv.rarityPill, { borderColor: rarityColor + '50', backgroundColor: rarityColor + '15' }]}>
                    <Text style={[pv.rarityText, { color: rarityColor }]}>{preview.rarity}</Text>
                  </View>
                  {!preview.owned && (
                    <TouchableOpacity
                      style={[pv.buyBtn, isGem && { backgroundColor: C.purple }]}
                      onPress={() => {
                        isGem
                          ? handleBuyGem(preview.price, preview.name)
                          : handleBuyCoin(preview.price, preview.name);
                        setPreview(null);
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {isGem ? <GemIcon size={14} /> : <CoinIcon size={14} />}
                        <Text style={pv.buyBtnText}>{preview.price}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  {preview.owned && (
                    <View style={pv.ownedBadge}>
                      <Text style={pv.ownedText}>item equipado</Text>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        </TouchableOpacity>
      </Modal>
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
    width: '100%', aspectRatio: 1, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
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
});

const pv = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: C.surface2,
    padding: 28, alignItems: 'center', gap: 12,
  },
  label: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.text3, letterSpacing: 0.1, textTransform: 'lowercase',
  },
  artFrame: {
    width: 164, height: 164,
    backgroundColor: C.surface2, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  name: {
    fontFamily: 'Lora_400Regular', fontSize: 20,
    color: C.text, letterSpacing: -0.2,
  },
  rarityPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1,
  },
  rarityText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
  },
  buyBtn: {
    width: '100%', backgroundColor: C.accent, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
    shadowColor: C.accent, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 0 }, shadowRadius: 12,
  },
  buyBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: '#f2e4cf',
  },
  ownedBadge: {
    width: '100%', backgroundColor: C.success + '15', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
    borderWidth: 1, borderColor: C.success + '30',
  },
  ownedText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.success,
  },
});
