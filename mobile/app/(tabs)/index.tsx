import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, RANKS, getRank, type RankId } from '../../constants/design';
import { useTheme } from '../../contexts/ThemeContext';
import { FlameIcon, XPIcon, CoinIcon, SpiralIcon, IceIcon } from '../../components/icons';
import { AvatarRing, XPBar } from '../../components/ui';
import StreakMilestone from '../../components/home/StreakMilestone';
import TodayCard from '../../components/home/TodayCard';
import LevelUpOverlay from '../../components/home/LevelUpOverlay';
import ShareStreakCard from '../../components/home/ShareStreakCard';
import PendingChestsCard from '../../components/home/PendingChestsCard';
import SubscriptionBanner from '../../components/subscription/SubscriptionBanner';
import { useAppStore } from '../../store/app';
import {
  syncGithub, getGithubToday, meToStoreUser, fetchMe,
  getChallenges, claimChallenge, getMySquad,
  type RepoCommits, type DailyChallenge, type Squad,
} from '../../lib/session';
import { useT } from '../../lib/i18n';

// SquadRank do backend (GARAGE, BIG_TECH…) → label legível.
const prettyRank = (r: string) =>
  r.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');

const { width: W } = Dimensions.get('window');

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_USER = {
  name: 'Arthur',
  username: 'araujo',
  streak: 14,
  longestStreak: 31,
  xp: 2340,
  xpToNext: 3000,
  level: 7,
  coins: 480,
  rankId: 'build' as RankId,
  avatarVariant: 0,
  freezesLeft: 2,
  committedToday: true,
};

const PENDING_CHESTS = { count: 3, topRarity: 'epico' as const };

const MOCK_CHALLENGES: {
  id: string; label: string; desc: string;
  xp: number; coins: number; done: boolean; claimed: boolean;
}[] = [
  { id: 'c1', label: 'Commit do dia', desc: 'Faça pelo menos 1 commit hoje', xp: 50,  coins: 10, done: true,  claimed: false },
  { id: 'c2', label: 'Streak de fogo', desc: 'Mantenha 7 dias seguidos',      xp: 120, coins: 25, done: false, claimed: false },
  { id: 'c3', label: 'PR aberto',      desc: 'Abra um Pull Request hoje',     xp: 80,  coins: 15, done: true,  claimed: false },
];

// ── Streak Card ───────────────────────────────────────────────────────────────
function StreakCard({ streak, longest, freezes, commitedToday, onFreezePress }: {
  streak: number; longest: number; freezes: number; commitedToday: boolean; onFreezePress: () => void;
}) {
  const { colors } = useTheme();
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
    <View style={[s.streakCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
      {/* Glow blob */}
      <View style={[s.streakGlow, { backgroundColor: colors.accent }]} />

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

      <View style={[s.streakDivider, { backgroundColor: colors.surface2 }]} />

      {/* Today status pill */}
      <View style={[s.todayPill, commitedToday ? s.todayPillDone : s.todayPillMissing]}>
        <Text style={[s.todayPillText, { color: commitedToday ? C.success : C.danger }]}>
          {commitedToday ? '✓ commitou hoje' : '⚠ ainda não commitou hoje'}
        </Text>
      </View>

      <View style={s.streakBottom}>
        <Text style={s.streakStat}>
          <Text style={s.streakStatValue}>{longest}</Text>
          {'  '}recorde pessoal
        </Text>
        <Text style={[s.streakHint, { color: colors.accent }]}>não quebre a ofensiva</Text>
      </View>
    </View>
  );
}

// ── XP Card ───────────────────────────────────────────────────────────────────
function XPCard({ user }: { user: typeof MOCK_USER }) {
  const { colors } = useTheme();
  const rank = getRank(user.rankId);
  return (
    <View style={[s.xpCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
      <View style={s.xpHeader}>
        <AvatarRing size={44} variant={user.avatarVariant} rankId={user.rankId} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.xpName}>{user.name}</Text>
          <Text style={[s.xpRank, { color: rank?.color ?? C.text3 }]}>
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
  squad: { name: string; rankLabel: string; members: { avatarVariant: number; rankId: RankId; streak: number }[] };
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[s.squadCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
      activeOpacity={0.8}
      onPress={() => router.push('/(tabs)/squad')}
    >
      <View style={s.squadHeader}>
        <Text style={s.squadName}>{squad.name}</Text>
        <View style={[s.squadRankBadge, { backgroundColor: colors.accent + '12', borderColor: colors.accent + '30' }]}>
          <Text style={[s.squadRankText, { color: colors.accent }]}>{squad.rankLabel}</Text>
        </View>
      </View>

      <View style={s.squadMembers}>
        {squad.members.map((m, i) => {
          const rank = getRank(m.rankId);
          return (
            <View key={i} style={s.squadMember}>
              <AvatarRing size={34} variant={m.avatarVariant} rankId={m.rankId} />
              <View style={s.memberStreak}>
                <FlameIcon size={10} glowing={m.streak > 0} />
                <Text style={s.memberStreakText}>{m.streak}</Text>
              </View>
            </View>
          );
        })}
        <TouchableOpacity style={s.viewSquadBtn} onPress={() => router.push('/(tabs)/squad')}>
          <Text style={[s.viewSquadText, { color: colors.accent }]}>ver squad →</Text>
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
  challenge: typeof MOCK_CHALLENGES[0];
  onClaim: (id: string) => void;
}) {
  const { colors } = useTheme();
  const tc = useT().challenges;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

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
      { backgroundColor: colors.surface, borderColor: colors.surface2, transform: [{ scale: scaleAnim }] },
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
          style={[s.claimBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
          onPress={handleClaim}
          activeOpacity={0.8}
        >
          <Text style={s.claimBtnText}>{tc.claim}</Text>
        </TouchableOpacity>
      )}

      {!challenge.done && (
        <View style={[s.progressBar, { backgroundColor: colors.surface2 }]}>
          <View style={[s.progressFill, { backgroundColor: colors.accent }]} />
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
    : MOCK_USER;

  const setUser = useAppStore((s) => s.setUser);
  const tc = useT().challenges;
  const [todayCommits, setTodayCommits] = useState<RepoCommits[]>([]);
  const [rawChallenges, setRawChallenges] = useState<DailyChallenge[]>([]);
  const [homeSquad, setHomeSquad] = useState<Squad | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showLevelUp, setShowLevelUp]     = useState(false);
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

  // Sincroniza a atividade do GitHub ao abrir a Home → atualiza store + lista + desafios.
  React.useEffect(() => {
    (async () => {
      const me = await syncGithub();
      if (me) setUser(meToStoreUser(me));
      setTodayCommits(await getGithubToday());
      setRawChallenges(await getChallenges());
      setHomeSquad(await getMySquad());
    })();
  }, []);

  // Squad real → formato do mini-card.
  const squadMini = homeSquad
    ? {
        name: homeSquad.name,
        rankLabel: prettyRank(homeSquad.rank),
        members: homeSquad.members.map((m) => ({
          avatarVariant: m.avatarVariant,
          rankId: m.rank.toLowerCase() as RankId,
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
    if (ok) {
      const me = await fetchMe();
      if (me) setUser(meToStoreUser(me));
    }
    // reconcilia com o servidor (reverte se falhou)
    setRawChallenges(await getChallenges());
  };

  const { colors } = useTheme();

  return (
    <View style={[s.screen, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
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
              <SpiralIcon size={20} color={C.text2} />
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
        <PendingChestsCard count={PENDING_CHESTS.count} topRarity={PENDING_CHESTS.topRarity} />

        {/* Today's GitHub activity */}
        <TodayCard commits={todayCommits} username={user.username} />

        {/* XP */}
        <TouchableOpacity activeOpacity={0.9} onLongPress={() => setShowLevelUp(true)}>
          <XPCard user={user} />
        </TouchableOpacity>

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

        {/* Subscription banner */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>momentum pro · max</Text>
        </View>
        <SubscriptionBanner />

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

      {/* Level up overlay */}
      <LevelUpOverlay
        level={user.level + 1}
        visible={showLevelUp}
        onDismiss={() => setShowLevelUp(false)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 14 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingTop: 16, marginBottom: 4,
  },
  greeting: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: C.text, letterSpacing: -0.3,
  },
  date: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, marginTop: 3, textTransform: 'lowercase',
  },
  feedBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },

  // Streak
  streakCard: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2,
    padding: 18, overflow: 'hidden',
  },
  streakGlow: {
    position: 'absolute', top: -30, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: C.accent, opacity: 0.07,
  },
  streakTop: { flexDirection: 'row', alignItems: 'center' },
  streakNumber: {
    fontFamily: 'Lora_400Regular', fontSize: 52,
    color: C.text, lineHeight: 56, letterSpacing: -2,
  },
  streakLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, textTransform: 'lowercase',
  },
  todayPill: {
    alignSelf: 'flex-start', borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
  },
  todayPillDone:    { backgroundColor: C.success + '12', borderColor: C.success + '40' },
  todayPillMissing: { backgroundColor: C.danger  + '12', borderColor: C.danger  + '40' },
  todayPillText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 0.02,
  },
  streakDivider: {
    height: 1, backgroundColor: C.surface2,
    marginVertical: 14,
  },
  streakBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  streakStat: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3,
  },
  streakStatValue: { color: C.text2 },
  streakHint: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.accent, letterSpacing: 0.02,
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
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2,
    padding: 16, gap: 12,
  },
  xpHeader: { flexDirection: 'row', alignItems: 'center' },
  xpName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13,
    color: C.text, letterSpacing: 0.01,
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
    color: C.gold,
  },

  // Squad
  squadCard: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2,
    padding: 16,
  },
  squadHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  squadName: {
    fontFamily: 'Lora_400Regular', fontSize: 16,
    color: C.text, letterSpacing: -0.2,
  },
  squadRankBadge: {
    backgroundColor: 'rgba(212,103,58,0.12)',
    borderWidth: 1, borderColor: 'rgba(212,103,58,0.3)',
    borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3,
  },
  squadRankText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.accent,
  },
  squadMembers: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  squadMember: { alignItems: 'center', gap: 4 },
  memberStreak: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  memberStreakText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3,
  },
  viewSquadBtn: { marginLeft: 'auto' as any },
  viewSquadText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.accent,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },
  sectionSub: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3,
  },

  // Challenges
  challengeRow: {
    paddingRight: 18, gap: 10,
  },
  challengeCard: {
    width: W * 0.56, backgroundColor: C.surface,
    borderRadius: 12, borderWidth: 1, borderColor: C.surface2,
    padding: 14, gap: 8, overflow: 'hidden',
  },
  challengeTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.text3,
  },
  challengeDotDone: { backgroundColor: C.success, borderColor: C.success },
  challengeLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: C.text, flex: 1,
  },
  challengeDesc: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, lineHeight: 16,
  },
  challengeRewards: { flexDirection: 'row', gap: 8, marginTop: 2 },
  rewardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.surface2, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  rewardText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text2,
  },
  claimBtn: {
    backgroundColor: C.accent, borderRadius: 6,
    paddingVertical: 8, alignItems: 'center', marginTop: 4,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  claimBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: '#f2e4cf',
  },
  progressBar: {
    height: 3, backgroundColor: C.surface2,
    borderRadius: 2, marginTop: 4, overflow: 'hidden',
  },
  progressFill: {
    width: '30%', height: '100%',
    backgroundColor: C.accent, borderRadius: 2,
  },
  claimedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(90,122,80,0.15)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  claimedEmoji: { fontSize: 32 },
});

const fz = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: C.surface2,
    padding: 28, alignItems: 'center', gap: 12,
  },
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text,
  },
  desc: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, textAlign: 'center', lineHeight: 18,
  },
  statsRow: { flexDirection: 'row', gap: 20, marginVertical: 4 },
  statBox: {
    backgroundColor: C.surface2, borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center',
  },
  statVal: { fontFamily: 'Lora_400Regular', fontSize: 24, color: C.text },
  statLbl: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, marginTop: 2 },
  activateBtn: {
    width: '100%', backgroundColor: '#7ab4e8', borderRadius: 8,
    paddingVertical: 13, alignItems: 'center',
    shadowColor: '#7ab4e8', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 0 }, shadowRadius: 10,
  },
  activateBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: '#0a1520',
  },
  noFreeze: {
    width: '100%', backgroundColor: C.surface2, borderRadius: 8,
    paddingVertical: 13, alignItems: 'center',
  },
  noFreezeText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text3,
  },
  cancel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3,
    paddingVertical: 8,
  },
});
