import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { RANKS, getRank, type RankId } from '../../constants/design';
import { useTheme, type ThemeColors } from '../../contexts/ThemeContext';
import { FlameIcon, XPIcon, CoinIcon, SpiralIcon, IceIcon } from '../../components/icons';
import { AvatarRing, XPBar } from '../../components/ui';
import StreakMilestone from '../../components/home/StreakMilestone';
import TodayCard from '../../components/home/TodayCard';
import LevelUpOverlay from '../../components/home/LevelUpOverlay';
import ShareStreakCard from '../../components/home/ShareStreakCard';
import PendingChestsCard from '../../components/home/PendingChestsCard';
import { useAppStore } from '../../store/app';
import {
  syncGithub, getGithubToday, meToStoreUser, fetchMe, checkLevelUp,
  getChallenges, claimChallenge, getMySquad, getChests, getEquipped,
  type RepoCommits, type DailyChallenge, type Squad, type PendingChest, type MeUser, type EquippedMap,
} from '../../lib/session';
import { useT } from '../../lib/i18n';

// SquadRank do backend (GARAGE, BIG_TECH…) → label legível.
const prettyRank = (r: string) =>
  r.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');

const { width: W } = Dimensions.get('window');

// ── Tipos + estado-zero ───────────────────────────────────────────────────────
type HomeUser = {
  name: string;
  username: string;
  streak: number;
  longestStreak: number;
  xp: number;
  xpToNext: number;
  level: number;
  coins: number;
  rankId: RankId;
  avatarVariant: number;
  freezesLeft: number;
  committedToday: boolean;
};

// Fallback enquanto o /me não chegou: tudo zerado, nível 1, rank inicial — sem
// números falsos. Some assim que o store é populado pelo backend.
const ZERO_USER: HomeUser = {
  name: '',
  username: '',
  streak: 0,
  longestStreak: 0,
  xp: 0,
  xpToNext: 100,
  level: 1,
  coins: 0,
  rankId: 'init',
  avatarVariant: 0,
  freezesLeft: 0,
  committedToday: false,
};

type ChallengeCardData = {
  id: string; label: string; desc: string;
  xp: number; coins: number; done: boolean; claimed: boolean;
};

// ── Streak Card ───────────────────────────────────────────────────────────────
function StreakCard({ streak, longest, freezes, commitedToday, onFreezePress }: {
  streak: number; longest: number; freezes: number; commitedToday: boolean; onFreezePress: () => void;
}) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[s.streakCard, { backgroundColor: c.surface, borderColor: c.surface2 }]}>
      {/* Glow blob */}
      <View style={[s.streakGlow, { backgroundColor: c.accent }]} />

      <View style={s.streakTop}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <FlameIcon size={36} glowing={streak > 0} />
        </Animated.View>

        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={s.streakNumber}>{streak}</Text>
          <Text style={s.streakLabel}>dias de ofensiva</Text>
        </View>

        <TouchableOpacity style={s.freezeBtn} onPress={onFreezePress}>
          <IceIcon size={20} color="#7ab4e8" />
          <Text style={s.freezeCount}>{freezes}</Text>
        </TouchableOpacity>
      </View>

      <View style={[s.streakDivider, { backgroundColor: c.surface2 }]} />

      {/* Today status pill */}
      <View style={[s.todayPill, commitedToday ? s.todayPillDone : s.todayPillMissing]}>
        <Text style={[s.todayPillText, { color: commitedToday ? c.success : c.danger }]}>
          {commitedToday ? '✓ commitou hoje' : '⚠ ainda não commitou hoje'}
        </Text>
      </View>

      <View style={s.streakBottom}>
        <Text style={s.streakStat}>
          <Text style={s.streakStatValue}>{longest}</Text>
          {'  '}recorde pessoal
        </Text>
        <Text style={[s.streakHint, { color: c.accent }]}>não quebre a ofensiva</Text>
      </View>
    </View>
  );
}

// ── XP Card ───────────────────────────────────────────────────────────────────
function XPCard({ user }: { user: HomeUser }) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const rank = getRank(user.rankId);
  const equipped = useAppStore((st) => st.equipped);
  return (
    <View style={[s.xpCard, { backgroundColor: c.surface, borderColor: c.surface2 }]}>
      <View style={s.xpHeader}>
        <AvatarRing size={44} variant={user.avatarVariant} rankId={user.rankId} equipped={equipped} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.xpName}>{user.name}</Text>
          <Text style={[s.xpRank, { color: rank?.color ?? c.text3 }]}>
            {rank?.label ?? 'Init'} · nível {user.level}
          </Text>
        </View>
        <View style={s.coinsBadge}>
          <CoinIcon size={14} />
          <Text style={s.coinsText}>{user.coins}</Text>
        </View>
      </View>
      <XPBar current={user.xp} max={user.xpToNext} level={user.level} />
    </View>
  );
}

// ── Squad Mini Card ───────────────────────────────────────────────────────────
function SquadMiniCard({ squad }: {
  squad: { name: string; rankLabel: string; members: { avatarVariant: number; rankId: RankId; streak: number; equipped?: EquippedMap }[] };
}) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  return (
    <TouchableOpacity
      style={[s.squadCard, { backgroundColor: c.surface, borderColor: c.surface2 }]}
      activeOpacity={0.8}
      onPress={() => router.push('/(tabs)/squad')}
    >
      <View style={s.squadHeader}>
        <Text style={s.squadName}>{squad.name}</Text>
        <View style={[s.squadRankBadge, { backgroundColor: c.accent + '12', borderColor: c.accent + '30' }]}>
          <Text style={[s.squadRankText, { color: c.accent }]}>{squad.rankLabel}</Text>
        </View>
      </View>

      <View style={s.squadMembers}>
        {squad.members.map((m, i) => {
          const rank = getRank(m.rankId);
          return (
            <View key={i} style={s.squadMember}>
              <AvatarRing size={34} variant={m.avatarVariant} rankId={m.rankId} equipped={m.equipped} />
              <View style={s.memberStreak}>
                <FlameIcon size={10} glowing={m.streak > 0} />
                <Text style={s.memberStreakText}>{m.streak}</Text>
              </View>
            </View>
          );
        })}
        <TouchableOpacity style={s.viewSquadBtn} onPress={() => router.push('/(tabs)/squad')}>
          <Text style={[s.viewSquadText, { color: c.accent }]}>ver squad →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Daily Challenge Card ──────────────────────────────────────────────────────
function DailyChallengeCard({
  challenge,
  onClaim,
}: {
  challenge: ChallengeCardData;
  onClaim: (id: string) => void;
}) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const tc = useT().challenges;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // já começa visível se o desafio veio coletado do servidor
  const fadeAnim  = useRef(new Animated.Value(challenge.claimed ? 1 : 0)).current;

  const handleClaim = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true, speed: 25 }),
      Animated.spring(scaleAnim, { toValue: 1.0,  useNativeDriver: true, speed: 25 }),
    ]).start();
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    onClaim(challenge.id);
  };

  const isClaimed = challenge.claimed;

  return (
    <Animated.View style={[
      s.challengeCard,
      { backgroundColor: c.surface, borderColor: c.surface2, transform: [{ scale: scaleAnim }] },
    ]}>
      {/* Claimed overlay */}
      {isClaimed && (
        <Animated.View style={[s.claimedOverlay, { opacity: fadeAnim }]}>
          <Text style={s.claimedEmoji}>✓</Text>
        </Animated.View>
      )}

      <View style={s.challengeTop}>
        <View style={[s.challengeDot, challenge.done && s.challengeDotDone]} />
        <Text style={s.challengeLabel} numberOfLines={1}>{challenge.label}</Text>
      </View>

      <Text style={s.challengeDesc} numberOfLines={2}>{challenge.desc}</Text>

      <View style={s.challengeRewards}>
        <View style={s.rewardBadge}>
          <XPIcon size={11} />
          <Text style={s.rewardText}>+{challenge.xp}</Text>
        </View>
        <View style={s.rewardBadge}>
          <CoinIcon size={11} />
          <Text style={s.rewardText}>+{challenge.coins}</Text>
        </View>
      </View>

      {challenge.done && !isClaimed && (
        <TouchableOpacity
          style={[s.claimBtn, { backgroundColor: c.accent, shadowColor: c.accent }]}
          onPress={handleClaim}
          activeOpacity={0.8}
        >
          <Text style={s.claimBtnText}>{tc.claim}</Text>
        </TouchableOpacity>
      )}

      {!challenge.done && (
        <View style={[s.progressBar, { backgroundColor: c.surface2 }]}>
          <View style={[s.progressFill, { backgroundColor: c.accent }]} />
        </View>
      )}
    </Animated.View>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  // Usuário real do store (populado pelo /me). Fallback no mock se ainda não carregou.
  const storeUser = useAppStore((s) => s.user);
  const user = storeUser
    ? {
        name: storeUser.displayName,
        username: storeUser.githubLogin,
        streak: storeUser.currentStreak,
        longestStreak: storeUser.maxStreak,
        xp: storeUser.xpIntoLevel,
        xpToNext: storeUser.xpToNextLevel,
        level: storeUser.level,
        coins: storeUser.coins,
        rankId: storeUser.rank,
        avatarVariant: storeUser.avatarVariant,
        freezesLeft: storeUser.streakFreezes,
        committedToday: storeUser.committedToday,
      }
    : ZERO_USER;

  const setUser = useAppStore((s) => s.setUser);
  const setEquipped = useAppStore((s) => s.setEquipped);
  const tc = useT().challenges;
  const [todayCommits, setTodayCommits] = useState<RepoCommits[]>([]);
  const [rawChallenges, setRawChallenges] = useState<DailyChallenge[]>([]);
  const [homeSquad, setHomeSquad] = useState<Squad | null>(null);
  const [homeChests, setHomeChests] = useState<PendingChest[]>([]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [levelUpTo, setLevelUpTo]         = useState<number | null>(null);
  const [showFreeze, setShowFreeze]       = useState(false);
  const [freezesLeft, setFreezesLeft]     = useState(user.freezesLeft);

  // Desafios reais → formato do card (localizado pela chave).
  const challenges = rawChallenges.map((c) => {
    const item = tc.items[c.key as keyof typeof tc.items] ?? { label: c.key, desc: '' };
    return {
      id: c.id, label: item.label, desc: item.desc,
      xp: c.rewardXp, coins: c.rewardCoins, done: c.completed, claimed: c.claimed,
    };
  });

  // Atualiza o store com o /me e dispara a animação de level-up se o nível subiu
  // de verdade (comparado ao último nível comemorado, persistido no SecureStore).
  const applyMe = React.useCallback(async (me: MeUser | null) => {
    if (!me) return;
    setUser(meToStoreUser(me));
    const up = await checkLevelUp(me.level);
    if (up != null) setLevelUpTo(up);
  }, [setUser]);

  // Sincroniza a atividade do GitHub ao abrir a Home → atualiza store + lista + desafios.
  React.useEffect(() => {
    (async () => {
      // sync pesado primeiro (challenges dependem dos commits de hoje)…
      await applyMe(await syncGithub());
      // …depois as leituras independentes em paralelo
      const [today, challenges, squad, chests, eq] = await Promise.all([
        getGithubToday(), getChallenges(), getMySquad(), getChests(), getEquipped(),
      ]);
      setTodayCommits(today);
      setRawChallenges(challenges);
      setHomeSquad(squad);
      setHomeChests(chests);
      setEquipped(eq);
    })();
  }, []);

  // Ao voltar o foco pra Home (ex: depois de abrir baú / comprar / coletar),
  // atualiza os dados leves sem refazer o sync pesado do GitHub.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const [me, chests, challenges, squad, eq] = await Promise.all([
          fetchMe(), getChests(), getChallenges(), getMySquad(), getEquipped(),
        ]);
        await applyMe(me);
        setHomeChests(chests);
        setRawChallenges(challenges);
        setHomeSquad(squad);
        setEquipped(eq);
      })();
    }, [applyMe]),
  );

  // Baús pendentes → contagem + raridade mais alta (pro card da Home).
  const CHEST_ORDER = ['COMUM', 'RARO', 'EPICO', 'LENDARIO'];
  const topChestRarity = (homeChests.reduce(
    (best, c) => (CHEST_ORDER.indexOf(c.rarity) > CHEST_ORDER.indexOf(best) ? c.rarity : best),
    'COMUM',
  ).toLowerCase()) as 'comum' | 'raro' | 'epico' | 'lendario';

  // Squad real → formato do mini-card.
  const squadMini = homeSquad
    ? {
        name: homeSquad.name,
        rankLabel: prettyRank(homeSquad.rank),
        members: homeSquad.members.map((m) => ({
          avatarVariant: m.avatarVariant,
          rankId: m.rank.toLowerCase() as RankId,
          equipped: m.equipped,
          streak: m.currentStreak,
        })),
      }
    : null;

  // Auto-show milestone on mount if streak is a milestone
  React.useEffect(() => {
    const milestones = [7, 14, 30, 50, 100];
    if (milestones.includes(user.streak)) {
      const t = setTimeout(() => setShowMilestone(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const claim = async (id: string) => {
    // otimista: esconde o botão na hora
    setRawChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, claimed: true } : c)));
    const ok = await claimChallenge(id);
    if (ok) await applyMe(await fetchMe());
    // reconcilia com o servidor (reverte se falhou)
    setRawChallenges(await getChallenges());
  };

  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const fz = makeFz(c);

  return (
    <View style={[s.screen, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>bom dia, {user.name.toLowerCase()}.</Text>
            <Text style={s.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/feed')}>
            <View style={s.feedBtn}>
              <SpiralIcon size={20} color={c.text2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Streak */}
        <StreakCard
          streak={user.streak}
          longest={user.longestStreak}
          freezes={freezesLeft}
          commitedToday={user.committedToday}
          onFreezePress={() => setShowFreeze(true)}
        />

        {/* Pending chests notification */}
        {homeChests.length > 0 && (
          <PendingChestsCard count={homeChests.length} topRarity={topChestRarity} />
        )}

        {/* Today's GitHub activity */}
        <TodayCard commits={todayCommits} username={user.username} />

        {/* XP */}
        <XPCard user={user} />

        {/* Squad mini */}
        {squadMini && <SquadMiniCard squad={squadMini} />}

        {/* Daily challenges */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{tc.section}</Text>
          <Text style={s.sectionSub}>
            {challenges.filter(c => c.done || c.claimed).length}/{challenges.length}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.challengeRow}
        >
          {challenges.map(ch => (
            <DailyChallengeCard key={ch.id} challenge={ch} onClaim={claim} />
          ))}
        </ScrollView>

        {/* Share streak */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>ofensiva</Text>
        </View>
        <ShareStreakCard streak={user.streak} username={user.username} />

        {/* Banner de assinatura escondido até a monetização ser definida
            (mantido em components/subscription/SubscriptionBanner.tsx). */}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Freeze modal */}
      <Modal visible={showFreeze} transparent animationType="fade" onRequestClose={() => setShowFreeze(false)}>
        <TouchableOpacity style={fz.backdrop} activeOpacity={1} onPress={() => setShowFreeze(false)}>
          <View style={fz.sheet}>
            <IceIcon size={36} color="#7ab4e8" />
            <Text style={fz.title}>gelo de ofensiva</Text>
            <Text style={fz.desc}>
              Um gelo protege sua streak por 1 dia de inatividade.
              Use com sabedoria — são raros.
            </Text>
            <View style={fz.statsRow}>
              <View style={fz.statBox}>
                <Text style={fz.statVal}>{freezesLeft}</Text>
                <Text style={fz.statLbl}>disponíveis</Text>
              </View>
              <View style={fz.statBox}>
                <Text style={fz.statVal}>{user.streak}</Text>
                <Text style={fz.statLbl}>dias em risco</Text>
              </View>
            </View>
            {freezesLeft > 0 ? (
              <TouchableOpacity
                style={fz.activateBtn}
                onPress={() => {
                  setFreezesLeft(f => f - 1);
                  setShowFreeze(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={fz.activateBtnText}>ativar gelo agora</Text>
              </TouchableOpacity>
            ) : (
              <View style={fz.noFreeze}>
                <Text style={fz.noFreezeText}>sem gelos disponíveis</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setShowFreeze(false)}>
              <Text style={fz.cancel}>cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Streak milestone */}
      <StreakMilestone
        streak={user.streak}
        visible={showMilestone}
        onDismiss={() => setShowMilestone(false)}
      />

      {/* Level up overlay — disparado pelo evento real de subir de nível */}
      <LevelUpOverlay
        level={levelUpTo ?? user.level}
        visible={levelUpTo != null}
        onDismiss={() => setLevelUpTo(null)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 14 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingTop: 16, marginBottom: 4,
  },
  greeting: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: c.text, letterSpacing: -0.3,
  },
  date: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: c.text3, marginTop: 3, textTransform: 'lowercase',
  },
  feedBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.surface2,
    alignItems: 'center', justifyContent: 'center',
  },

  // Streak
  streakCard: {
    backgroundColor: c.surface, borderRadius: 12,
    borderWidth: 1, borderColor: c.surface2,
    padding: 18, overflow: 'hidden',
  },
  streakGlow: {
    position: 'absolute', top: -30, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: c.accent, opacity: 0.07,
  },
  streakTop: { flexDirection: 'row', alignItems: 'center' },
  streakNumber: {
    fontFamily: 'Lora_400Regular', fontSize: 52,
    color: c.text, lineHeight: 56, letterSpacing: -2,
  },
  streakLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: c.text3, textTransform: 'lowercase',
  },
  todayPill: {
    alignSelf: 'flex-start', borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
  },
  todayPillDone:    { backgroundColor: c.success + '12', borderColor: c.success + '40' },
  todayPillMissing: { backgroundColor: c.danger  + '12', borderColor: c.danger  + '40' },
  todayPillText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 0.02,
  },
  streakDivider: {
    height: 1, backgroundColor: c.surface2,
    marginVertical: 14,
  },
  streakBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  streakStat: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3,
  },
  streakStatValue: { color: c.text2 },
  streakHint: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: c.accent, letterSpacing: 0.02,
  },
  freezeBtn: {
    alignItems: 'center', padding: 8,
    backgroundColor: 'rgba(58,130,247,0.08)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(58,130,247,0.2)',
  },
  freezeCount: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: '#3a82f7', marginTop: 2,
  },

  // XP
  xpCard: {
    backgroundColor: c.surface, borderRadius: 12,
    borderWidth: 1, borderColor: c.surface2,
    padding: 16, gap: 12,
  },
  xpHeader: { flexDirection: 'row', alignItems: 'center' },
  xpName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13,
    color: c.text, letterSpacing: 0.01,
  },
  xpRank: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    marginTop: 2,
  },
  coinsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(240,165,0,0.1)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(240,165,0,0.2)',
  },
  coinsText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: c.gold,
  },

  // Squad
  squadCard: {
    backgroundColor: c.surface, borderRadius: 12,
    borderWidth: 1, borderColor: c.surface2,
    padding: 16,
  },
  squadHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  squadName: {
    fontFamily: 'Lora_400Regular', fontSize: 16,
    color: c.text, letterSpacing: -0.2,
  },
  squadRankBadge: {
    backgroundColor: 'rgba(212,103,58,0.12)',
    borderWidth: 1, borderColor: 'rgba(212,103,58,0.3)',
    borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3,
  },
  squadRankText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: c.accent,
  },
  squadMembers: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  squadMember: { alignItems: 'center', gap: 4 },
  memberStreak: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  memberStreakText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3,
  },
  viewSquadBtn: { marginLeft: 'auto' as any },
  viewSquadText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: c.accent,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: c.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },
  sectionSub: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3,
  },

  // Challenges
  challengeRow: {
    paddingRight: 18, gap: 10,
  },
  challengeCard: {
    width: W * 0.56, backgroundColor: c.surface,
    borderRadius: 12, borderWidth: 1, borderColor: c.surface2,
    padding: 14, gap: 8, overflow: 'hidden',
  },
  challengeTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: c.surface2, borderWidth: 1, borderColor: c.text3,
  },
  challengeDotDone: { backgroundColor: c.success, borderColor: c.success },
  challengeLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: c.text, flex: 1,
  },
  challengeDesc: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: c.text3, lineHeight: 16,
  },
  challengeRewards: { flexDirection: 'row', gap: 8, marginTop: 2 },
  rewardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: c.surface2, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  rewardText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: c.text2,
  },
  claimBtn: {
    backgroundColor: c.accent, borderRadius: 6,
    paddingVertical: 8, alignItems: 'center', marginTop: 4,
    shadowColor: c.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  claimBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: '#f2e4cf',
  },
  progressBar: {
    height: 3, backgroundColor: c.surface2,
    borderRadius: 2, marginTop: 4, overflow: 'hidden',
  },
  progressFill: {
    width: '30%', height: '100%',
    backgroundColor: c.accent, borderRadius: 2,
  },
  claimedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(90,122,80,0.15)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  claimedEmoji: { fontSize: 32 },
});

const makeFz = (c: ThemeColors) => StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: c.surface2,
    padding: 28, alignItems: 'center', gap: 12,
  },
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text,
  },
  desc: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: c.text3, textAlign: 'center', lineHeight: 18,
  },
  statsRow: { flexDirection: 'row', gap: 20, marginVertical: 4 },
  statBox: {
    backgroundColor: c.surface2, borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center',
  },
  statVal: { fontFamily: 'Lora_400Regular', fontSize: 24, color: c.text },
  statLbl: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3, marginTop: 2 },
  activateBtn: {
    width: '100%', backgroundColor: '#7ab4e8', borderRadius: 8,
    paddingVertical: 13, alignItems: 'center',
    shadowColor: '#7ab4e8', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 0 }, shadowRadius: 10,
  },
  activateBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: '#0a1520',
  },
  noFreeze: {
    width: '100%', backgroundColor: c.surface2, borderRadius: 8,
    paddingVertical: 13, alignItems: 'center',
  },
  noFreezeText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3,
  },
  cancel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3,
    paddingVertical: 8,
  },
});
