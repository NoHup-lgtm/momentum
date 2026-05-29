import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank } from '../../constants/design';
import { FlameIcon, XPIcon, CoinIcon } from '../../components/icons';
import { AvatarRing } from '../../components/ui';

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SQUAD = {
  name: 'Void Runners',
  rank: 2,
  totalXP: 12450,
  weeklyXP: 3200,
  members: [
    {
      username: 'dev_k',   name: 'Kauã Dev',    streak: 21, xp: 4200,
      avatarVariant: 2,    rankId: 'deploy' as const, isOnline: true,
    },
    {
      username: 'araujo',  name: 'Arthur',       streak: 14, xp: 3800,
      avatarVariant: 0,    rankId: 'build'  as const, isOnline: true, isYou: true,
    },
    {
      username: 'moyza',   name: 'Moyza',        streak: 9,  xp: 2900,
      avatarVariant: 1,    rankId: 'init'   as const, isOnline: false,
    },
    {
      username: 'cata',    name: 'Catarina',     streak: 5,  xp: 1550,
      avatarVariant: 3,    rankId: 'init'   as const, isOnline: false,
    },
  ],
  weeklyHistory: [
    { day: 'seg', commits: 8 },
    { day: 'ter', commits: 12 },
    { day: 'qua', commits: 6 },
    { day: 'qui', commits: 15 },
    { day: 'sex', commits: 10 },
    { day: 'sab', commits: 4 },
    { day: 'dom', commits: 0 },
  ],
};

// ── Member Row ────────────────────────────────────────────────────────────────
function MemberRow({ member, position }: { member: typeof MOCK_SQUAD.members[0]; position: number }) {
  const rank = getRank(member.rankId);
  const isTop = position === 1;

  return (
    <TouchableOpacity
      style={[s.memberRow, isTop && s.memberRowTop]}
      activeOpacity={0.75}
      onPress={() => router.push('/user-profile')}
    >
      <Text style={[s.position, isTop && s.positionTop]}>#{position}</Text>

      <View style={{ position: 'relative' }}>
        <AvatarRing size={42} variant={member.avatarVariant} rankId={member.rankId} />
        {member.isOnline && <View style={s.onlineDot} />}
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={s.memberNameRow}>
          <Text style={s.memberName}>
            {member.name}{(member as any).isYou ? ' (eu)' : ''}
          </Text>
          {rank && (
            <Text style={[s.rankLabel, { color: rank.color }]}>{rank.label}</Text>
          )}
        </View>
        <Text style={s.memberUsername}>@{member.username}</Text>
      </View>

      <View style={s.memberStats}>
        <View style={s.statRow}>
          <FlameIcon size={12} />
          <Text style={s.statText}>{member.streak}</Text>
        </View>
        <View style={s.statRow}>
          <XPIcon size={12} />
          <Text style={s.statText}>{member.xp.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Activity Bar ──────────────────────────────────────────────────────────────
function ActivityBar({ day, commits, max }: { day: string; commits: number; max: number }) {
  const height = max === 0 ? 0 : (commits / max) * 56;
  return (
    <View style={s.barContainer}>
      <View style={s.barTrack}>
        <View style={[s.barFill, { height }]} />
      </View>
      <Text style={s.barDay}>{day}</Text>
    </View>
  );
}

// ── Squad Screen ──────────────────────────────────────────────────────────────
export default function SquadScreen() {
  const insets = useSafeAreaInsets();
  const maxCommits = Math.max(...MOCK_SQUAD.weeklyHistory.map(h => h.commits), 1);
  const sorted = [...MOCK_SQUAD.members].sort((a, b) => b.xp - a.xp);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>{MOCK_SQUAD.name}</Text>
            <Text style={s.subtitle}>rank #{MOCK_SQUAD.rank} esta semana</Text>
          </View>
          <TouchableOpacity style={s.inviteBtn} onPress={() => router.push('/friend-invite')}>
            <Text style={s.inviteBtnText}>+ convidar</Text>
          </TouchableOpacity>
        </View>

        {/* Squad stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statCardValue}>{MOCK_SQUAD.totalXP.toLocaleString()}</Text>
            <Text style={s.statCardLabel}>XP total</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statCardValue}>{MOCK_SQUAD.weeklyXP.toLocaleString()}</Text>
            <Text style={s.statCardLabel}>XP esta semana</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statCardValue}>{MOCK_SQUAD.members.length}</Text>
            <Text style={s.statCardLabel}>membros</Text>
          </View>
        </View>

        {/* Weekly activity */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>atividade da semana</Text>
          <View style={s.barsRow}>
            {MOCK_SQUAD.weeklyHistory.map(h => (
              <ActivityBar key={h.day} day={h.day} commits={h.commits} max={maxCommits} />
            ))}
          </View>
        </View>

        {/* Members */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>membros · ranking</Text>
          <View style={s.memberList}>
            {sorted.map((m, i) => (
              <MemberRow key={m.username} member={m} position={i + 1} />
            ))}
          </View>
        </View>

        {/* Ranking shortcut */}
        <TouchableOpacity style={s.rankingBtn} onPress={() => router.push('/ranking')}>
          <Text style={s.rankingBtnText}>ver ranking global →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 16 },

  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingTop: 16, marginBottom: 4,
  },
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: C.text, letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, marginTop: 3,
  },
  inviteBtn: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent,
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6,
  },
  inviteBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.accent,
  },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    padding: 12, alignItems: 'center',
  },
  statCardValue: {
    fontFamily: 'Lora_400Regular', fontSize: 18,
    color: C.text, letterSpacing: -0.3,
  },
  statCardLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.text3, marginTop: 2, textTransform: 'lowercase',
  },

  section: { gap: 10 },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },

  barsRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    padding: 14, gap: 6, height: 96,
  },
  barContainer: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: {
    flex: 1, width: '100%', backgroundColor: C.surface2,
    borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end',
  },
  barFill: { width: '100%', backgroundColor: C.accent, borderRadius: 3 },
  barDay: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 8,
    color: C.text3, textTransform: 'lowercase',
  },

  memberList: { gap: 8 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    padding: 12,
  },
  memberRowTop: {
    borderColor: 'rgba(240,165,0,0.3)',
    backgroundColor: 'rgba(240,165,0,0.04)',
  },
  position: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: C.text3, width: 28,
  },
  positionTop: { color: C.gold },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.success, borderWidth: 1.5, borderColor: C.bg,
  },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text,
  },
  rankLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
  },
  memberUsername: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, marginTop: 2,
  },
  memberStats: { gap: 4, alignItems: 'flex-end' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text2,
  },

  rankingBtn: {
    backgroundColor: C.surface, borderRadius: 8,
    borderWidth: 1, borderColor: C.surface2,
    padding: 14, alignItems: 'center',
  },
  rankingBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.accent,
  },
});
