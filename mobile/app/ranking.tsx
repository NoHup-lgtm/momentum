import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, RANKS, getRank, type RankId } from '../constants/design';
import { FlameIcon, XPIcon } from '../components/icons';
import { AvatarRing } from '../components/ui';
import RankEmblem from '../components/rank/RankEmblem';

const { width: W } = Dimensions.get('window');

const MY_RANK: RankId = 'build';
const MY_USERNAME = 'araujo';

// ── League data per rank ──────────────────────────────────────────────────────
type LeagueUser = { username: string; xp: number; rankId: RankId; streak: number; avatarVariant: number; isYou?: boolean };
type LeagueSquad = { name: string; xp: number; rankId: RankId; members: number; streak: number };

function buildLeague(rankId: RankId): LeagueUser[] {
  const names = ['dev_k', 'cata', 'moyza', 'carol_v', 'jota', 'ana_lima', 'marcos', 'pedro_d', 'lu_code', 'xara_dev', 'bit_ops', 'full_stack'];
  return names.map((name, i) => ({
    username: name, xp: 5000 - i * 280 + Math.floor(Math.random() * 80),
    rankId, streak: 20 - i + Math.floor(Math.random() * 3),
    avatarVariant: i % 6,
    isYou: name === 'carol_v',
  })).concat({
    username: MY_USERNAME, xp: 2340, rankId: MY_RANK,
    streak: 14, avatarVariant: 0, isYou: true,
  }).sort((a, b) => b.xp - a.xp);
}

function buildSquadLeague(rankId: RankId): LeagueSquad[] {
  const names = ['Void Runners', 'Alpha Commit', 'Ship It', 'Null Pointers', 'Bit Squad', 'Code Monkeys', 'Deploy Gang', 'Stack Overflow', 'Root Access', 'Dark Mode'];
  return names.map((name, i) => ({
    name, xp: 12000 - i * 900 + Math.floor(Math.random() * 200),
    rankId, members: 4 + (i % 3), streak: 18 - i,
  })).sort((a, b) => b.xp - a.xp);
}

function buildTop50(): LeagueUser[] {
  const allRanks: RankId[] = ['legend', 'architect', 'senior', 'deploy', 'build'];
  const users: LeagueUser[] = [];
  let xp = 98000;
  for (let i = 0; i < 49; i++) {
    const rankId = allRanks[Math.min(Math.floor(i / 10), allRanks.length - 1)];
    users.push({
      username: `user_${i + 1}`, xp,
      rankId, streak: 90 - i, avatarVariant: i % 6,
      isYou: false,
    });
    xp -= 1200 + Math.floor(Math.random() * 300);
  }
  return users;
}

const LEAGUE = buildLeague(MY_RANK);
const SQUAD_LEAGUE = buildSquadLeague(MY_RANK);
const TOP_50 = buildTop50();

// Zone classification
function getZone(pos: number, total: number, isInit: boolean) {
  if (pos <= 3) return 'promote';
  if (!isInit && pos > total - 5) return 'demote';
  return 'safe';
}

const TABS = ['minha liga', 'squads', 'top 50'] as const;
type Tab = typeof TABS[number];

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({ user, pos, zone }: { user: LeagueUser; pos: number; zone: string }) {
  const rank = getRank(user.rankId);
  const isTop3 = pos <= 3;
  const medals = ['🥇', '🥈', '🥉'];
  const zoneBorder = zone === 'promote' ? C.success : zone === 'demote' ? C.danger : 'transparent';

  return (
    <TouchableOpacity
      style={[
        s.row,
        zone === 'promote' && s.rowPromote,
        zone === 'demote'  && s.rowDemote,
        user.isYou         && s.rowYou,
      ]}
      activeOpacity={0.75}
      onPress={() => !user.isYou && router.push('/user-profile')}
    >
      <View style={s.rowPos}>
        {isTop3 ? (
          <Text style={{ fontSize: 14 }}>{medals[pos - 1]}</Text>
        ) : (
          <Text style={[s.posText, user.isYou && { color: C.accent }]}>#{pos}</Text>
        )}
      </View>

      <AvatarRing size={34} variant={user.avatarVariant} rankId={user.rankId} />

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[s.rowName, user.isYou && { color: C.accent }]}>
          {user.isYou ? 'você' : user.username}
        </Text>
        <Text style={[s.rowRank, { color: rank.color }]}>{rank.label}</Text>
      </View>

      <View style={s.rowStats}>
        <View style={s.statRow}>
          <FlameIcon size={11} />
          <Text style={s.statText}>{user.streak}d</Text>
        </View>
        <View style={s.statRow}>
          <XPIcon size={11} />
          <Text style={s.statText}>{user.xp.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Squad Row ────────────────────────────────────────────────────────────────
function SquadRow({ squad, pos, zone }: { squad: LeagueSquad; pos: number; zone: string }) {
  const rank = getRank(squad.rankId);
  const medals = ['🥇', '🥈', '🥉'];
  const isTop3 = pos <= 3;

  return (
    <View style={[
      s.row,
      zone === 'promote' && s.rowPromote,
      zone === 'demote'  && s.rowDemote,
    ]}>
      <View style={s.rowPos}>
        {isTop3 ? (
          <Text style={{ fontSize: 14 }}>{medals[pos - 1]}</Text>
        ) : (
          <Text style={s.posText}>#{pos}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowName}>{squad.name}</Text>
        <Text style={[s.rowRank, { color: rank.color }]}>{rank.label} · {squad.members} membros</Text>
      </View>
      <View style={s.rowStats}>
        <View style={s.statRow}>
          <XPIcon size={11} />
          <Text style={s.statText}>{squad.xp.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Zone divider ──────────────────────────────────────────────────────────────
function ZoneBanner({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.zoneBanner, { backgroundColor: color + '12', borderColor: color + '30' }]}>
      <Text style={[s.zoneText, { color }]}>{label}</Text>
    </View>
  );
}

// ── Ranking Screen ────────────────────────────────────────────────────────────
export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('minha liga');
  const rank = getRank(MY_RANK);
  const isInit = MY_RANK === 'init';

  const myPos = LEAGUE.findIndex(u => u.isYou) + 1;

  const renderLeague = () => {
    let lastZone = '';
    return LEAGUE.map((user, i) => {
      const pos = i + 1;
      const zone = getZone(pos, LEAGUE.length, isInit);
      const banners: React.ReactNode[] = [];

      if (zone !== lastZone) {
        lastZone = zone;
        if (zone === 'promote') banners.push(<ZoneBanner key={`z-${i}`} label="↑ PROMOÇÃO · top 3 sobem de rank" color={C.success} />);
        if (zone === 'demote')  banners.push(<ZoneBanner key={`z-${i}`} label="↓ REBAIXAMENTO · corra!" color={C.danger} />);
        if (zone === 'safe' && i > 0) banners.push(<ZoneBanner key={`z-${i}`} label="◎ ZONA SEGURA" color={C.text3} />);
      }

      return [...banners, <UserRow key={user.username} user={user} pos={pos} zone={zone} />];
    });
  };

  const renderSquads = () => {
    let lastZone = '';
    return SQUAD_LEAGUE.map((squad, i) => {
      const pos = i + 1;
      const zone = getZone(pos, SQUAD_LEAGUE.length, false);
      const banners: React.ReactNode[] = [];

      if (zone !== lastZone) {
        lastZone = zone;
        if (zone === 'promote') banners.push(<ZoneBanner key={`z-${i}`} label="↑ PROMOÇÃO · top 2 squads sobem" color={C.success} />);
        if (zone === 'demote')  banners.push(<ZoneBanner key={`z-${i}`} label="↓ REBAIXAMENTO" color={C.danger} />);
        if (zone === 'safe' && i > 0) banners.push(<ZoneBanner key={`z-${i}`} label="◎ ZONA SEGURA" color={C.text3} />);
      }

      return [...banners, <SquadRow key={squad.name} squad={squad} pos={pos} zone={zone} />];
    });
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.title}>minha liga</Text>
          <Text style={[s.subtitle, { color: rank.color }]}>
            Liga {rank.label} · Semana 23
          </Text>
        </View>
        <RankEmblem rankId={MY_RANK} size={36} />
      </View>

      {/* My position card */}
      <View style={s.myPosCard}>
        <Text style={s.myPosLabel}>sua posição</Text>
        <Text style={[s.myPosNum, { color: rank.color }]}>#{myPos}</Text>
        <Text style={s.myPosSub}>de {tab === 'top 50' ? '50' : LEAGUE.length} usuários · termina em 2d 14h</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t} style={[s.tab, tab === t && s.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {tab === 'minha liga' && renderLeague()}

        {tab === 'squads' && (
          <>
            <View style={s.squadInfoCard}>
              <Text style={s.squadInfoTitle}>Liga de Squads {rank.label}</Text>
              <Text style={s.squadInfoSub}>Sua squad compete com squads do mesmo rank</Text>
            </View>
            {renderSquads()}
          </>
        )}

        {tab === 'top 50' && (
          <>
            <View style={s.top50Info}>
              <Text style={s.top50InfoText}>Os 50 usuários com maior XP de todo o app</Text>
            </View>
            {TOP_50.map((user, i) => {
              const pos = i + 1;
              return <UserRow key={user.username + i} user={user} pos={pos} zone="safe" />;
            })}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 14, gap: 4 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  backBtn: { padding: 4, marginRight: 4 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: C.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 18, color: C.text },
  subtitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, marginTop: 2 },

  myPosCard: {
    marginHorizontal: 18, marginVertical: 10,
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    padding: 14, alignItems: 'center',
  },
  myPosLabel: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
  myPosNum:   { fontFamily: 'Lora_400Regular', fontSize: 32, letterSpacing: -1 },
  myPosSub:   { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, marginTop: 2 },

  tabRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 18, marginBottom: 10,
  },
  tab: {
    flex: 1, paddingVertical: 7, alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 6,
    borderWidth: 1, borderColor: C.surface2,
  },
  tabActive: { borderColor: C.accent, backgroundColor: C.accent + '15' },
  tabText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3 },
  tabTextActive: { color: C.accent },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 8,
    borderWidth: 1, borderColor: C.surface2,
    padding: 10, marginBottom: 4,
  },
  rowPromote: { borderLeftWidth: 3, borderLeftColor: C.success, backgroundColor: C.success + '06' },
  rowDemote:  { borderLeftWidth: 3, borderLeftColor: C.danger,  backgroundColor: C.danger  + '06' },
  rowYou:     { borderColor: C.accent + '60', backgroundColor: C.accent + '06' },

  rowPos: { width: 28, alignItems: 'center' },
  posText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3 },
  rowName: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  rowRank: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, marginTop: 1 },
  rowStats: { gap: 3, alignItems: 'flex-end' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text2 },

  zoneBanner: {
    borderRadius: 6, borderWidth: 1,
    paddingVertical: 5, paddingHorizontal: 10,
    marginVertical: 6,
  },
  zoneText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, letterSpacing: 0.05 },

  squadInfoCard: {
    backgroundColor: C.surface, borderRadius: 8,
    borderWidth: 1, borderColor: C.surface2,
    padding: 12, marginBottom: 8,
  },
  squadInfoTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  squadInfoSub:   { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3, marginTop: 2 },

  top50Info: {
    backgroundColor: C.surface2, borderRadius: 6,
    padding: 10, marginBottom: 8,
  },
  top50InfoText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3, textAlign: 'center' },
});
