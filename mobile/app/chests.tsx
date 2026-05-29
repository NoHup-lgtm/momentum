import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C } from '../constants/design';
import { PixelChest, type ChestRarity } from '../components/chests/PixelChest';
import { CoinIcon, GemIcon, SpiralIcon } from '../components/icons';

const { width: W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────
type Chest = {
  id: string;
  rarity: ChestRarity;
  name: string;
  source: string;
  earnedAt: string;
};

type Reward = {
  type: 'coins' | 'gems' | 'item';
  amount?: number;
  itemName?: string;
  itemRarity?: string;
  rarity: 'comum' | 'raro' | 'epico' | 'lendario';
};

// ── Mock pending chests ───────────────────────────────────────────────────────
const INITIAL_CHESTS: Chest[] = [
  { id: 'ch_1', rarity: 'epico',    name: 'Baú do Void',    source: 'promoção na liga',          earnedAt: 'hoje' },
  { id: 'ch_2', rarity: 'raro',     name: 'Baú do Deploy',  source: '14 dias de streak',         earnedAt: 'hoje' },
  { id: 'ch_3', rarity: 'comum',    name: 'Baú de Código',  source: 'desafios do dia completos', earnedAt: 'ontem' },
];

// ── Drop table ────────────────────────────────────────────────────────────────
const ITEM_POOL = [
  { id: 'c11', name: 'Capacete Espacial', rarity: 'raro'    },
  { id: 'c10', name: 'Mochila Git',       rarity: 'raro'    },
  { id: 'g7',  name: 'Lâmina de Plasma',  rarity: 'epico'   },
  { id: 'g5',  name: 'Manto do Void',     rarity: 'epico'   },
  { id: 'g14', name: 'Bastão do Void',    rarity: 'lendario'},
  { id: 'g12', name: 'Cubo Quântico',     rarity: 'epico'   },
  // Exclusive chest items
  { id: 'ex1', name: 'Anel de Deploy',    rarity: 'epico'   },
  { id: 'ex2', name: 'Coroa do Void',     rarity: 'lendario'},
  { id: 'ex3', name: 'Fragmento Quântico',rarity: 'raro'    },
];

function rollRewards(rarity: ChestRarity): Reward[] {
  const rewards: Reward[] = [];

  // Guaranteed coins
  const coinMap: Record<ChestRarity, [number, number]> = { comum: [50,150], raro: [150,350], epico: [400,700], lendario: [1000,2000] };
  const [cMin, cMax] = coinMap[rarity];
  rewards.push({ type: 'coins', amount: Math.floor(Math.random()*(cMax-cMin)+cMin), rarity: 'comum' });

  // Guaranteed gems for raro+
  if (rarity !== 'comum') {
    const gemMap: Record<string, [number, number]> = { raro: [1,2], epico: [5,10], lendario: [20,40] };
    const [gMin, gMax] = gemMap[rarity];
    rewards.push({ type: 'gems', amount: Math.floor(Math.random()*(gMax-gMin)+gMin), rarity: 'raro' });
  }

  // Item roll
  const roll = Math.random();
  let itemPool: typeof ITEM_POOL = [];

  if (rarity === 'comum') {
    if (roll < 0.02) itemPool = ITEM_POOL.filter(i => i.rarity === 'epico');
    else if (roll < 0.10) itemPool = ITEM_POOL.filter(i => i.rarity === 'raro');
    else if (roll < 0.35) itemPool = ITEM_POOL.filter(i => i.rarity === 'raro');
  } else if (rarity === 'raro') {
    if (roll < 0.05) itemPool = ITEM_POOL.filter(i => i.rarity === 'lendario');
    else if (roll < 0.18) itemPool = ITEM_POOL.filter(i => i.rarity === 'epico');
    else itemPool = ITEM_POOL.filter(i => i.rarity === 'raro');
  } else if (rarity === 'epico') {
    if (roll < 0.15) itemPool = ITEM_POOL.filter(i => i.rarity === 'lendario');
    else if (roll < 0.50) itemPool = ITEM_POOL.filter(i => i.id.startsWith('ex') || i.rarity === 'epico');
    else itemPool = ITEM_POOL.filter(i => i.rarity === 'epico');
  } else {
    // lendario: guaranteed legendary/exclusive
    itemPool = ITEM_POOL.filter(i => i.rarity === 'lendario' || i.id.startsWith('ex'));
  }

  if (itemPool.length > 0) {
    const picked = itemPool[Math.floor(Math.random()*itemPool.length)];
    rewards.push({
      type: 'item',
      itemName: picked.name,
      itemRarity: picked.rarity,
      rarity: picked.rarity as Reward['rarity'],
    });
  }

  return rewards;
}

// ── Rarity config ─────────────────────────────────────────────────────────────
const RARITY_COLOR: Record<string, string> = {
  comum: C.text3, raro: '#3a82f7', epico: C.purple, lendario: C.gold,
};
const RARITY_LABEL: Record<ChestRarity, string> = {
  comum: 'comum', raro: 'raro', epico: 'épico', lendario: 'lendário',
};

// ── Chest Card ────────────────────────────────────────────────────────────────
function ChestCard({ chest, onOpen }: { chest: Chest; onOpen: () => void }) {
  const color = RARITY_COLOR[chest.rarity] ?? C.text3;
  return (
    <View style={[cs.card, { borderColor: color + '40' }]}>
      <View style={[cs.cardArt, { backgroundColor: color + '10' }]}>
        <PixelChest rarity={chest.rarity} size={72} />
      </View>
      <View style={cs.cardInfo}>
        <View style={[cs.rarityPill, { borderColor: color + '50', backgroundColor: color + '15' }]}>
          <Text style={[cs.rarityText, { color }]}>{RARITY_LABEL[chest.rarity]}</Text>
        </View>
        <Text style={cs.cardName}>{chest.name}</Text>
        <Text style={cs.cardSource}>{chest.source}</Text>
        <Text style={cs.cardTime}>ganho {chest.earnedAt}</Text>
      </View>
      <TouchableOpacity style={[cs.openBtn, { backgroundColor: color }]} onPress={onOpen} activeOpacity={0.85}>
        <Text style={cs.openBtnText}>abrir</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Reward Card ───────────────────────────────────────────────────────────────
function RewardCard({ reward, index }: { reward: Reward; index: number }) {
  const anim   = useRef(new Animated.Value(0)).current;
  const color  = RARITY_COLOR[reward.rarity] ?? C.text3;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: 1, useNativeDriver: true,
      delay: index * 220, speed: 14, bounciness: 10,
    }).start();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const opacity = anim;

  return (
    <Animated.View style={[rc.card, { borderColor: color + '60', transform: [{ scale }], opacity }]}>
      <View style={[rc.iconWrap, { backgroundColor: color + '15' }]}>
        {reward.type === 'coins' && <CoinIcon size={28} />}
        {reward.type === 'gems'  && <GemIcon  size={28} />}
        {reward.type === 'item'  && <SpiralIcon size={28} color={color} />}
      </View>
      {reward.type === 'coins' && (
        <>
          <Text style={[rc.value, { color: C.gold }]}>+{reward.amount}</Text>
          <Text style={rc.label}>moedas</Text>
        </>
      )}
      {reward.type === 'gems' && (
        <>
          <Text style={[rc.value, { color: C.purple }]}>+{reward.amount}</Text>
          <Text style={rc.label}>gems</Text>
        </>
      )}
      {reward.type === 'item' && (
        <>
          <Text style={[rc.value, { color, fontSize: 11 }]} numberOfLines={2}>{reward.itemName}</Text>
          <Text style={[rc.label, { color }]}>{reward.itemRarity}</Text>
        </>
      )}
    </Animated.View>
  );
}

// ── Opening Overlay ───────────────────────────────────────────────────────────
function ChestOpening({ chest, onCollect }: { chest: Chest; onCollect: (rewards: Reward[]) => void }) {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'open' | 'rewards'>('idle');
  const [rewards, setRewards] = useState<Reward[]>([]);

  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const lidAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  const color = RARITY_COLOR[chest.rarity] ?? C.text3;

  React.useEffect(() => {
    Animated.timing(backdropOp, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    // Idle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleTap = () => {
    if (phase === 'rewards') return;
    if (phase === 'open') {
      setPhase('rewards');
      return;
    }

    // Shake phase
    setPhase('shaking');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start(() => {
      // Open lid
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.timing(lidAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      const rolled = rollRewards(chest.rarity);
      setRewards(rolled);
      setPhase('open');
    });
  };

  const lidTranslate = lidAnim.interpolate({ inputRange: [0,1], outputRange: [0, -70] });
  const lidOpacity   = lidAnim.interpolate({ inputRange: [0,1], outputRange: [1, 0] });
  const glowScale    = glowAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.3] });

  return (
    <Animated.View style={[ov.backdrop, { opacity: backdropOp }]}>
      <TouchableOpacity style={ov.touchArea} activeOpacity={1} onPress={handleTap}>

        {phase !== 'rewards' && (
          <View style={ov.chestArea}>
            {/* Glow behind chest */}
            <Animated.View style={[ov.glow, {
              backgroundColor: color + '30',
              transform: [{ scale: glowScale }],
            }]} />

            {/* Lid (flies up when opened) */}
            <Animated.View style={[ov.lidWrap, {
              transform: [{ translateY: lidTranslate }, { translateX: shakeAnim }],
              opacity: lidOpacity,
            }]}>
              {/* Top half of chest = lid */}
              <PixelChest rarity={chest.rarity} size={100} />
            </Animated.View>

            <Text style={[ov.chestName, { color }]}>{chest.name}</Text>
            <Text style={ov.hint}>
              {phase === 'idle'    ? 'toque para abrir' :
               phase === 'shaking' ? '...' :
               'toque para ver recompensas'}
            </Text>
          </View>
        )}

        {phase === 'rewards' && (
          <View style={ov.rewardsArea}>
            <Text style={ov.rewardsTitle}>recompensas</Text>
            <View style={ov.rewardsGrid}>
              {rewards.map((r, i) => (
                <RewardCard key={i} reward={r} index={i} />
              ))}
            </View>
            <TouchableOpacity
              style={[ov.collectBtn, { backgroundColor: color }]}
              onPress={() => onCollect(rewards)}
              activeOpacity={0.85}
            >
              <Text style={ov.collectBtnText}>coletar tudo</Text>
            </TouchableOpacity>
          </View>
        )}

      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ChestsScreen() {
  const insets = useSafeAreaInsets();
  const [chests, setChests] = useState<Chest[]>(INITIAL_CHESTS);
  const [opening, setOpening] = useState<Chest | null>(null);

  const handleCollect = (chest: Chest, _rewards: Reward[]) => {
    // Remove opened chest
    setChests(prev => prev.filter(c => c.id !== chest.id));
    setOpening(null);
  };

  return (
    <View style={[ms.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={ms.header}>
        <TouchableOpacity onPress={() => router.back()} style={ms.backBtn}>
          <Text style={ms.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={ms.title}>baús</Text>
          <Text style={ms.subtitle}>{chests.length} esperando abertura</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {chests.length === 0 ? (
        <View style={ms.emptyState}>
          <SpiralIcon size={56} color={C.text3} />
          <Text style={ms.emptyTitle}>nenhum baú pendente</Text>
          <Text style={ms.emptySubtitle}>
            complete desafios, avance na liga{'\n'}e mantenha sua streak para ganhar baús
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={ms.content}
        >
          {/* How to earn */}
          <View style={ms.infoCard}>
            <Text style={ms.infoTitle}>como ganhar baús</Text>
            {[
              { icon: '·', text: 'completar os 3 desafios do dia → Baú de Código' },
              { icon: '·', text: 'marco de streak (7, 14, 30 dias) → Baú do Deploy' },
              { icon: '·', text: 'subir de posição na liga → Baú do Void' },
              { icon: '·', text: 'top 3 da liga semanal → Baú Lendário' },
            ].map((item, i) => (
              <Text key={i} style={ms.infoRow}>{item.icon}  {item.text}</Text>
            ))}
          </View>

          <Text style={ms.sectionLabel}>pendentes · {chests.length}</Text>

          {chests.map(chest => (
            <ChestCard
              key={chest.id}
              chest={chest}
              onOpen={() => setOpening(chest)}
            />
          ))}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* Opening overlay */}
      {opening && (
        <ChestOpening
          chest={opening}
          onCollect={(rewards) => handleCollect(opening, rewards)}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  card: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  cardArt: {
    width: 88, height: 88, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 4 },
  rarityPill: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, borderWidth: 1,
  },
  rarityText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9 },
  cardName: { fontFamily: 'Lora_400Regular', fontSize: 15, color: C.text, letterSpacing: -0.2 },
  cardSource: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3 },
  cardTime:   { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,  color: C.text3 + 'aa' },
  openBtn: {
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center',
  },
  openBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#f2e4cf' },
});

const rc = StyleSheet.create({
  card: {
    width: (W - 64) / 3,
    backgroundColor: C.surface, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: 'center', gap: 6,
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  value: { fontFamily: 'Lora_400Regular', fontSize: 18, letterSpacing: -0.5, textAlign: 'center' },
  label: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 8, color: C.text3, textAlign: 'center' },
});

const ov = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(8,5,2,0.96)',
    alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  touchArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  chestArea: { alignItems: 'center', gap: 16 },
  glow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
  },
  lidWrap: { zIndex: 2 },
  chestName: { fontFamily: 'Lora_400Regular', fontSize: 22, letterSpacing: -0.3, marginTop: 8 },
  hint: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3,
    letterSpacing: 0.05,
  },
  rewardsArea: { alignItems: 'center', gap: 20, paddingHorizontal: 20 },
  rewardsTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, letterSpacing: 0.1, textTransform: 'lowercase',
  },
  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  collectBtn: {
    borderRadius: 10, paddingHorizontal: 40, paddingVertical: 14, marginTop: 8,
  },
  collectBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: '#f2e4cf' },
});

const ms = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  backBtn:  { padding: 4 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: C.text2 },
  title:    { fontFamily: 'Lora_400Regular', fontSize: 18, color: C.text },
  subtitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3, marginTop: 2 },
  infoCard: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    padding: 14, gap: 6,
  },
  infoTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3, marginBottom: 4 },
  infoRow:   { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text2, lineHeight: 16 },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 36,
  },
  emptyTitle:    { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text, letterSpacing: -0.2 },
  emptySubtitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3, textAlign: 'center', lineHeight: 18 },
});
