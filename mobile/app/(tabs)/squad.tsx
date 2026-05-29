import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank } from '../../constants/design';
import { useTheme } from '../../contexts/ThemeContext';
import { FlameIcon, XPIcon, SpiralIcon } from '../../components/icons';
import { AvatarRing } from '../../components/ui';

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SQUAD = {
  name: 'Void Runners',
  rank: 2,
  totalXP: 12450,
  weeklyXP: 3200,
  members: [
    {
      username: 'dev_k',   name: 'Kaua Dev',    streak: 21, xp: 4200,
      avatarVariant: 2,    rankId: 'deploy' as const, isOnline: true,  isLeader: true,
    },
    {
      username: 'araujo',  name: 'Arthur',       streak: 14, xp: 3800,
      avatarVariant: 0,    rankId: 'build'  as const, isOnline: true,  isYou: true,
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

// The current user is NOT the leader
const IS_ME_LEADER = false;

// ── No Squad View ─────────────────────────────────────────────────────────────
function NoSquadView() {
  return (
    <View style={ns.container}>
      <View style={ns.heroCard}>
        <View style={ns.iconWrap}>
          <SpiralIcon size={48} color={C.text3} />
        </View>
        <Text style={ns.title}>sem squad</Text>
        <Text style={ns.subtitle}>
          voce nao esta em nenhuma squad.{'\n'}apenas lideres podem te convidar.
        </Text>
      </View>

      <View style={ns.section}>
        <Text style={ns.sectionTitle}>convites pendentes</Text>
        <View style={ns.emptyInvites}>
          <Text style={ns.emptyText}>nenhum convite no momento</Text>
        </View>
      </View>

      <View style={ns.infoCard}>
        <Text style={ns.infoText}>
          squads sao criadas por usuarios rank Senior ou superior.
          peca para um amigo lider te convidar.
        </Text>
      </View>
    </View>
  );
}

// ── Member Row ────────────────────────────────────────────────────────────────
function MemberRow({ member, position }: { member: typeof MOCK_SQUAD.members[0]; position: number }) {
  const rank = getRank(member.rankId);
  const isTop = position === 1;
  const isLeader = (member as any).isLeader === true;

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
          {isLeader && (
            <View style={s.leaderBadge}>
              <Text style={s.leaderBadgeText}>lider</Text>
            </View>
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
const MOCK_SQUAD_PREV_WEEK = [
  { day: 'seg', commits: 5  },
  { day: 'ter', commits: 9  },
  { day: 'qua', commits: 11 },
  { day: 'qui', commits: 7  },
  { day: 'sex', commits: 14 },
  { day: 'sab', commits: 2  },
  { day: 'dom', commits: 0  },
];

export default function SquadScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [inSquad, setInSquad] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activityTab, setActivityTab] = useState<'semana' | 'anterior'>('semana');

  const allHistory = [...MOCK_SQUAD.weeklyHistory, ...MOCK_SQUAD_PREV_WEEK];
  const maxCommits = Math.max(...allHistory.map(h => h.commits), 1);
  const sorted = [...MOCK_SQUAD.members].sort((a, b) => b.xp - a.xp);

  if (!inSquad) {
    return (
      <View style={[s.screen, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>squad</Text>
            <Text style={s.subtitle}>sem squad ativa</Text>
          </View>
        </View>
        <NoSquadView />
      </View>
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>{MOCK_SQUAD.name}</Text>
            <Text style={s.subtitle}>rank #{MOCK_SQUAD.rank} esta semana</Text>
          </View>
          {IS_ME_LEADER && (
            <TouchableOpacity style={s.inviteBtn} onPress={() => router.push('/friend-invite')}>
              <Text style={s.inviteBtnText}>+ convidar</Text>
            </TouchableOpacity>
          )}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={s.sectionTitle}>atividade</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['semana', 'anterior'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[weekTabS.tab, activityTab === t && weekTabS.tabActive]}
                  onPress={() => setActivityTab(t)}
                >
                  <Text style={[weekTabS.tabText, activityTab === t && weekTabS.tabTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.barsRow}>
            {(activityTab === 'semana' ? MOCK_SQUAD.weeklyHistory : MOCK_SQUAD_PREV_WEEK).map(h => (
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

        {/* Leave squad — only for non-leaders */}
        {!IS_ME_LEADER && (
          <TouchableOpacity
            style={s.leaveBtn}
            onPress={() => setShowLeaveModal(true)}
            activeOpacity={0.8}
          >
            <Text style={s.leaveBtnText}>sair da squad</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Leave confirmation modal */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <TouchableOpacity
          style={s.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLeaveModal(false)}
        >
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>sair da squad?</Text>
            <Text style={s.modalDesc}>
              Tem certeza que quer sair da {MOCK_SQUAD.name}?{'\n'}
              Voce so podera entrar em outra squad se for convidado por um lider.
            </Text>
            <View style={s.modalButtons}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setShowLeaveModal(false)}
              >
                <Text style={s.cancelBtnText}>cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmLeaveBtn}
                onPress={() => {
                  setShowLeaveModal(false);
                  setInSquad(false);
                }}
              >
                <Text style={s.confirmLeaveBtnText}>sair da squad</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── No Squad styles ───────────────────────────────────────────────────────────
const ns = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8, gap: 16 },
  heroCard: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.surface2,
    padding: 28, alignItems: 'center', gap: 10,
  },
  iconWrap: { marginBottom: 4 },
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 20,
    color: C.text, letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, textAlign: 'center', lineHeight: 18,
  },
  section: { gap: 8 },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase',
  },
  emptyInvites: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    padding: 18, alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3,
  },
  infoCard: {
    backgroundColor: C.surface2, borderRadius: 10,
    padding: 14,
  },
  infoText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, lineHeight: 18,
  },
});

// ── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 16 },

  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingTop: 16, marginBottom: 4,
    paddingHorizontal: 0,
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
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  memberName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text,
  },
  rankLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
  },
  leaderBadge: {
    backgroundColor: C.gold + '25', borderRadius: 3,
    paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1, borderColor: C.gold + '50',
  },
  leaderBadgeText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 8, color: C.gold,
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

  leaveBtn: {
    backgroundColor: 'rgba(180,40,40,0.1)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(180,40,40,0.3)',
    padding: 14, alignItems: 'center',
  },
  leaveBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#d05050',
  },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: C.surface2,
    padding: 28, gap: 12,
  },
  modalTitle: {
    fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text,
  },
  modalDesc: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: C.text3, lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row', gap: 10, marginTop: 8,
  },
  cancelBtn: {
    flex: 1, borderRadius: 8, borderWidth: 1, borderColor: C.surface2,
    padding: 14, alignItems: 'center', backgroundColor: C.surface2,
  },
  cancelBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text2,
  },
  confirmLeaveBtn: {
    flex: 1, borderRadius: 8,
    padding: 14, alignItems: 'center',
    backgroundColor: 'rgba(180,40,40,0.85)',
  },
  confirmLeaveBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#f2e4cf',
  },
});

const weekTabS = StyleSheet.create({
  tab: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: 'transparent',
  },
  tabActive: { borderColor: C.accent, backgroundColor: C.accent + '15' },
  tabText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
  tabTextActive: { color: C.accent },
});
