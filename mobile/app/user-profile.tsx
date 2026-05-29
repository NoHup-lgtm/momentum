import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank, type RankId } from '../constants/design';
import { FlameIcon, XPIcon } from '../components/icons';
import { AvatarRing } from '../components/ui';
import RankEmblem from '../components/rank/RankEmblem';

const { width: W } = Dimensions.get('window');

// Mock another user's profile
const OTHER_USER = {
  name: 'Kauã Dev',
  username: 'dev_k',
  rankId: 'deploy' as RankId,
  level: 11,
  totalCommits: 612,
  streak: 21,
  longestStreak: 45,
  totalXP: 14200,
  avatarVariant: 2,
  isFriend: false,
};

const RECENT_ACTIVITY = [
  { type: 'commit',   text: 'Commit em react-dashboard',   time: '2h atrás'  },
  { type: 'streak',   text: '21 dias de streak atingidos', time: '1d atrás'  },
  { type: 'achieve',  text: 'Conquista Centurião desbloqueada', time: '3d atrás'  },
  { type: 'rankup',   text: 'Subiu para rank Deploy',      time: '1w atrás'  },
];

const HEATMAP = Array.from({ length: 91 }, () =>
  Math.random() > 0.45 ? Math.floor(Math.random() * 5) + 1 : 0
);

const TYPE_ICON: Record<string, string> = {
  commit: '📝', streak: '🔥', achieve: '🏅', rankup: '↑',
};

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const [isFriend, setFriend] = useState(OTHER_USER.isFriend);
  const rank = getRank(OTHER_USER.rankId);
  const cellSize = (W - 56) / 13;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>perfil</Text>
        <TouchableOpacity style={s.moreBtn}>
          <Text style={s.moreText}>···</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Hero */}
        <View style={s.heroCard}>
          <RankEmblem rankId={OTHER_USER.rankId} size={64} glowing />
          <AvatarRing size={72} variant={OTHER_USER.avatarVariant} rankId={OTHER_USER.rankId} />
          <Text style={s.userName}>{OTHER_USER.name}</Text>
          <Text style={s.userHandle}>@{OTHER_USER.username}</Text>
          <View style={s.rankBadge}>
            <Text style={[s.rankText, { color: rank.color }]}>
              {rank.label} · Lv. {OTHER_USER.level}
            </Text>
          </View>

          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.friendBtn, isFriend && s.friendBtnActive]}
              onPress={() => setFriend(f => !f)}
              activeOpacity={0.8}
            >
              <Text style={[s.friendBtnText, isFriend && s.friendBtnTextActive]}>
                {isFriend ? '✓ amigos' : '+ adicionar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.squadBtn} onPress={() => router.push('/friend-invite')}>
              <Text style={s.squadBtnText}>convidar squad</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: 'commits', value: OTHER_USER.totalCommits },
            { label: 'ofensiva', value: `${OTHER_USER.streak}d` },
            { label: 'recorde', value: `${OTHER_USER.longestStreak}d` },
          ].map((st, i) => (
            <View key={i} style={[s.statCell, i < 2 && { borderRightWidth: 1, borderRightColor: C.surface2 }]}>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Heatmap */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>atividade · 13 semanas</Text>
          <View style={s.heatCard}>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              {Array.from({ length: 13 }, (_, w) => (
                <View key={w} style={{ gap: 2 }}>
                  {Array.from({ length: 7 }, (_, d) => {
                    const val = HEATMAP[w * 7 + d];
                    return (
                      <View
                        key={d}
                        style={{
                          width: cellSize - 2, height: cellSize - 2, borderRadius: 2,
                          backgroundColor: val === 0
                            ? C.surface2
                            : `${rank.color}${Math.round((val / 5) * 200 + 55).toString(16).padStart(2, '0')}`,
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent activity */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>atividade recente</Text>
          <View style={s.activityCard}>
            {RECENT_ACTIVITY.map((item, i) => (
              <View key={i} style={[s.activityRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.surface2 }]}>
                <View style={s.activityIcon}>
                  <Text style={{ fontSize: 14 }}>{TYPE_ICON[item.type]}</Text>
                </View>
                <Text style={s.activityText} numberOfLines={1}>{item.text}</Text>
                <Text style={s.activityTime}>{item.time}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  backBtn:  { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: C.text2 },
  title:    { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text, flex: 1 },
  moreBtn:  { padding: 4 },
  moreText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 16, color: C.text3, letterSpacing: 2 },

  heroCard: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.surface2,
    alignItems: 'center', padding: 24, gap: 6,
  },
  userName: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text, letterSpacing: -0.3 },
  userHandle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3 },
  rankBadge: {
    backgroundColor: C.surface2, borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 2,
  },
  rankText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
  friendBtn: {
    flex: 1, backgroundColor: C.accent, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  friendBtnActive: { backgroundColor: C.success + '20', borderWidth: 1, borderColor: C.success + '50' },
  friendBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#f2e4cf' },
  friendBtnTextActive: { color: C.success },
  squadBtn: {
    flex: 1, backgroundColor: C.surface2, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: C.surface2,
  },
  squadBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text2 },

  statsRow: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderRadius: 12, borderWidth: 1, borderColor: C.surface2,
  },
  statCell: { flex: 1, alignItems: 'center', padding: 16 },
  statValue: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text, letterSpacing: -0.3 },
  statLabel: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, marginTop: 2 },

  section: { gap: 8 },
  sectionTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3, textTransform: 'lowercase' },

  heatCard: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, padding: 12,
  },

  activityCard: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  activityIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
  },
  activityText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text, flex: 1 },
  activityTime: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
});
