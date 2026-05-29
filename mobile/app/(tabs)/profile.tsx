import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank, type RankId } from '../../constants/design';
import { FlameIcon, XPIcon, CoinIcon, GemIcon } from '../../components/icons';
import { AvatarRing } from '../../components/ui';
import RankEmblem from '../../components/rank/RankEmblem';

const { width: W } = Dimensions.get('window');

// ── Mock data ─────────────────────────────────────────────────────────────────
const USER = {
  name: 'Arthur',
  username: 'araujo',
  rankId: 'build' as RankId,
  level: 7,
  totalCommits: 284,
  streak: 14,
  longestStreak: 31,
  totalXP: 8420,
  weekXP: 2340,
  coins: 480,
  gems: 15,
  avatarVariant: 0,
};

const FRIENDS = [
  { username: 'moyza',  streak: 9,  rankId: 'init'   as RankId, avatarVariant: 1, isOnline: false },
  { username: 'dev_k',  streak: 21, rankId: 'deploy' as RankId, avatarVariant: 2, isOnline: true  },
  { username: 'cata',   streak: 5,  rankId: 'init'   as RankId, avatarVariant: 3, isOnline: false },
  { username: 'carol_v',streak: 12, rankId: 'build'  as RankId, avatarVariant: 4, isOnline: true  },
];

// 13-week heatmap (Mon–Sun × 13)
const HEATMAP = Array.from({ length: 91 }, (_, i) => {
  const rnd = Math.random();
  if (i > 77) return rnd > 0.4 ? Math.floor(rnd * 5) + 1 : 0;
  return rnd > 0.6 ? Math.floor(rnd * 4) + 1 : 0;
});

const ACHIEVEMENTS = [
  { id: 'faísca',     label: 'Faísca',     desc: '7 dias seguidos',       earned: true  },
  { id: 'centurião',  label: 'Centurião',  desc: '100 commits',           earned: true  },
  { id: 'constante',  label: 'Constante',  desc: '30 dias seguidos',      earned: true  },
  { id: 'top1',       label: 'Top 1',      desc: 'Semana #1 na liga',     earned: true  },
  { id: 'inabalável', label: 'Inabalável', desc: '100 dias — em progresso', earned: false },
  { id: 'lenda',      label: 'Lenda Viva', desc: 'Alcance Legend',        earned: false },
];

// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap({ color }: { color: string }) {
  const cellSize = (W - 56) / 13;
  const weeks = Array.from({ length: 13 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => HEATMAP[w * 7 + d])
  );

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {weeks.map((week, wi) => (
        <View key={wi} style={{ gap: 2 }}>
          {week.map((val, di) => (
            <View
              key={di}
              style={{
                width: cellSize - 2,
                height: cellSize - 2,
                borderRadius: 2,
                backgroundColor: val === 0
                  ? C.surface2
                  : `${color}${Math.round((val / 5) * 200 + 55).toString(16).padStart(2, '0')}`,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Achievement Badge ─────────────────────────────────────────────────────────
function AchievementBadge({ achievement }: { achievement: typeof ACHIEVEMENTS[0] }) {
  const icons: Record<string, string> = {
    'faísca': '⚡', 'centurião': '💯', 'constante': '🔥',
    'top1': '🏆', 'inabalável': '🧊', 'lenda': '🌀',
  };
  return (
    <View style={[s.achieveBadge, !achievement.earned && s.achieveLocked]}>
      <Text style={s.achieveIcon}>{icons[achievement.id] ?? '🏅'}</Text>
      <Text style={[s.achieveLabel, !achievement.earned && { color: C.text3 }]}>
        {achievement.label}
      </Text>
    </View>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const rank = getRank(USER.rankId);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>perfil</Text>
          <TouchableOpacity style={s.settingsBtn}>
            <Text style={s.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + rank */}
        <View style={s.heroCard}>
          <View style={s.rankEmblemWrap}>
            <RankEmblem rankId={USER.rankId} size={72} glowing />
          </View>

          <View style={s.avatarWrap}>
            <AvatarRing size={80} variant={USER.avatarVariant} rankId={USER.rankId} />
          </View>

          <Text style={s.userName}>{USER.name}</Text>
          <Text style={s.userHandle}>@{USER.username}</Text>

          <View style={s.rankBadge}>
            <Text style={[s.rankBadgeText, { color: rank.color }]}>
              {rank.label} · Lv. {USER.level}
            </Text>
          </View>

          {/* Balances */}
          <View style={s.balances}>
            <View style={s.balanceItem}>
              <CoinIcon size={14} />
              <Text style={s.balanceVal}>{USER.coins}</Text>
            </View>
            <View style={s.balanceDivider} />
            <View style={s.balanceItem}>
              <GemIcon size={14} />
              <Text style={[s.balanceVal, { color: C.purple }]}>{USER.gems}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { label: 'commits',  value: USER.totalCommits },
            { label: 'ofensiva', value: `${USER.streak}d` },
            { label: 'recorde',  value: `${USER.longestStreak}d` },
          ].map((st, i) => (
            <View key={i} style={s.statCell}>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick nav */}
        <View style={s.quickNav}>
          {[
            { label: 'squad',    screen: '/(tabs)/squad'  },
            { label: 'loja',     screen: '/(tabs)/store'  },
            { label: 'liga',     screen: '/ranking'       },
            { label: 'amigos',   screen: '/friends'       },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.quickNavBtn}
              onPress={() => router.push(item.screen as any)}
              activeOpacity={0.75}
            >
              <Text style={s.quickNavText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contribution heatmap */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>atividade · 13 semanas</Text>
          <View style={s.heatmapCard}>
            <Heatmap color={rank.color} />
          </View>
        </View>

        {/* Achievements preview */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>conquistas</Text>
            <TouchableOpacity onPress={() => router.push('/achievements')}>
              <Text style={s.seeAll}>ver todas →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}>
            {ACHIEVEMENTS.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </ScrollView>
        </View>

        {/* Friends card */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>
              amigos · {FRIENDS.filter(f => f.isOnline).length} online
            </Text>
            <TouchableOpacity onPress={() => router.push('/friends')}>
              <Text style={s.seeAll}>ver todos →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.friendsCard}>
            <View style={s.friendAvatars}>
              {FRIENDS.map((f, i) => (
                <TouchableOpacity
                  key={i}
                  style={{ position: 'relative' }}
                  onPress={() => router.push('/user-profile')}
                >
                  <AvatarRing size={40} variant={f.avatarVariant} rankId={f.rankId} />
                  {f.isOnline && <View style={s.onlineDot} />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={s.addFriendBtn}
              onPress={() => router.push('/friend-invite')}
            >
              <Text style={s.addFriendText}>+ adicionar amigo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All-time stats */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>estatísticas gerais</Text>
          <View style={s.allTimeCard}>
            {[
              { label: 'XP total',         value: USER.totalXP.toLocaleString() },
              { label: 'XP esta semana',   value: USER.weekXP.toLocaleString()  },
              { label: 'maior ofensiva',   value: `${USER.longestStreak} dias`  },
            ].map((st, i) => (
              <View key={i} style={[s.allTimeRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.surface2 }]}>
                <Text style={s.allTimeLabel}>{st.label}</Text>
                <Text style={s.allTimeValue}>{st.value}</Text>
              </View>
            ))}
          </View>
        </View>

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
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 16, marginBottom: 4,
  },
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: C.text, letterSpacing: -0.3,
  },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 18, color: C.text3 },

  heroCard: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.surface2,
    alignItems: 'center', padding: 24, paddingTop: 20,
  },
  rankEmblemWrap: { marginBottom: 8 },
  avatarWrap: { marginBottom: 12 },
  userName: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: C.text, letterSpacing: -0.3,
  },
  userHandle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: C.text3, marginTop: 2, marginBottom: 10,
  },
  rankBadge: {
    backgroundColor: C.surface2, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  rankBadgeText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
  },
  balances: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceDivider: { width: 1, height: 14, backgroundColor: C.surface2 },
  balanceVal: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: C.gold,
  },

  statsRow: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderRadius: 12, borderWidth: 1, borderColor: C.surface2,
  },
  statCell: {
    flex: 1, alignItems: 'center', padding: 16,
    borderRightWidth: 1, borderRightColor: C.surface2,
  },
  statValue: {
    fontFamily: 'Lora_400Regular', fontSize: 20,
    color: C.text, letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.text3, marginTop: 2, textTransform: 'lowercase',
  },

  quickNav: { flexDirection: 'row', gap: 8 },
  quickNavBtn: {
    flex: 1, backgroundColor: C.surface, borderRadius: 8,
    borderWidth: 1, borderColor: C.surface2,
    paddingVertical: 10, alignItems: 'center',
  },
  quickNavText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text2, textTransform: 'lowercase',
  },

  section: { gap: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },
  seeAll: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.accent,
  },

  heatmapCard: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    padding: 14,
  },

  achieveBadge: {
    alignItems: 'center', gap: 4,
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2,
    paddingHorizontal: 14, paddingVertical: 12, minWidth: 72,
  },
  achieveLocked: { opacity: 0.4 },
  achieveIcon:  { fontSize: 22 },
  achieveLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.text2, textAlign: 'center',
  },

  friendsCard: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2,
    padding: 14, gap: 12,
  },
  friendAvatars: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: C.success, borderWidth: 1.5, borderColor: C.bg,
  },
  addFriendBtn: {
    backgroundColor: C.surface2, borderRadius: 6,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: C.accent + '40',
  },
  addFriendText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.accent,
  },

  allTimeCard: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, overflow: 'hidden',
  },
  allTimeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, alignItems: 'center',
  },
  allTimeLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3,
  },
  allTimeValue: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text2,
  },
});
