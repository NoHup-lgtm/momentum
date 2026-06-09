import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getRank, type RankId } from '../constants/design';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { AvatarRing } from '../components/ui';
import { ProfileSkeleton } from '../components/Skeleton';
import RankEmblem from '../components/rank/RankEmblem';
import { useT } from '../lib/i18n';
import {
  getUserProfile, addFriend, acceptFriend, removeFriend,
  type PublicProfile, type FriendshipState,
} from '../lib/session';

const { width: W } = Dimensions.get('window');
const rid = (r: string) => r.toLowerCase() as RankId;

const TYPE_ICON: Record<string, string> = {
  ACHIEVEMENT: '🏅', CHALLENGE_COMPLETED: '✅', LIGA_PROMOTED: '🏆',
  STREAK_MILESTONE: '🔥', LEVEL_UP: '⬆️', RANK_UP: '↑',
  CHEST_LEGENDARY: '🎁', SQUAD_JOIN: '👥',
};

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    userId?: string; name?: string; username?: string; variant?: string; rank?: string;
  }>();
  const userId = params.userId ?? '';
  const t = useT().social;
  const tp = t.profile;
  const ta = useT().achievements;
  const tl = useT().liga;
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const cellSize = (W - 56) / 13;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      if (!userId) { setLoading(false); return; }
      const p = await getUserProfile(userId);
      if (alive) { setProfile(p); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [userId]));

  // Fallback de exibição enquanto carrega (params passados pela tela anterior).
  const name = profile?.displayName || profile?.githubLogin || params.name || '...';
  const handle = profile?.githubLogin || params.username || '';
  const rankStr = profile?.rank || params.rank || 'INIT';
  const variant = profile?.avatarVariant ?? Number(params.variant ?? 0);
  const rank = getRank(rid(rankStr));

  const fstate: FriendshipState = profile?.friendship.state ?? 'none';
  const fid = profile?.friendship.friendshipId ?? null;

  // Ação do botão de amizade conforme o estado atual.
  const onFriendAction = async () => {
    if (busy || !profile) return;
    setBusy(true);
    try {
      if (fstate === 'none') {
        await addFriend(profile.githubLogin);
        patchFriendship('outgoing', fid);
      } else if (fstate === 'incoming' && fid) {
        await acceptFriend(fid);
        patchFriendship('friends', fid);
      } else if (fstate === 'friends' && fid) {
        await removeFriend(fid);
        patchFriendship('none', null);
      }
    } catch {} finally { setBusy(false); }
  };

  const patchFriendship = (state: FriendshipState, friendshipId: string | null) =>
    setProfile((p) => (p ? { ...p, friendship: { state, friendshipId } } : p));

  // Texto localizado de um evento de atividade recente.
  const eventText = (type: string, p: Record<string, any>): string => {
    switch (type) {
      case 'ACHIEVEMENT': {
        const label = p.key ? ta.items[p.key as keyof typeof ta.items]?.label : null;
        return label ? t.ev.achievement.replace('{x}', label) : t.ev.achievement_generic;
      }
      case 'CHALLENGE_COMPLETED': return t.ev.challenge;
      case 'LIGA_PROMOTED': return t.ev.liga.replace('{x}', tl.tiers[Number(p.toTier)] ?? `#${p.toTier}`);
      case 'STREAK_MILESTONE': return t.ev.streak.replace('{x}', String(p.streak ?? ''));
      case 'LEVEL_UP': return t.ev.levelup;
      case 'RANK_UP': return t.ev.rankup;
      case 'CHEST_LEGENDARY': return t.ev.chest;
      case 'SQUAD_JOIN': return t.ev.squad;
      default: return '';
    }
  };

  const ago = (iso: string): string => {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  // Config do botão de amizade conforme estado.
  const friendBtn = (() => {
    switch (fstate) {
      case 'friends':  return { label: tp.friendsLabel, active: true, disabled: false };
      case 'incoming': return { label: tp.acceptInvite, active: false, disabled: false };
      case 'outgoing': return { label: tp.pendingLabel, active: false, disabled: true };
      default:         return { label: tp.addFriend, active: false, disabled: false };
    }
  })();

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{tp.title}</Text>
        <View style={s.backBtn} />
      </View>

      {loading ? (
        <ProfileSkeleton />
      ) : !profile ? (
        <View style={s.center}><Text style={s.empty}>{tp.notFound}</Text></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

          {/* Hero */}
          <View style={s.heroCard}>
            <RankEmblem rankId={rid(rankStr)} size={64} glowing />
            <AvatarRing size={72} variant={variant} rankId={rid(rankStr)} equipped={profile.equipped} />
            <Text style={s.userName}>{name}</Text>
            {!!handle && <Text style={s.userHandle}>@{handle}</Text>}
            <View style={s.rankBadge}>
              <Text style={[s.rankText, { color: rank.color }]}>
                {rank.label} · Lv. {profile.level}
              </Text>
            </View>

            {fstate !== 'self' && (
              <View style={s.actionRow}>
                <TouchableOpacity
                  style={[s.friendBtn, friendBtn.active && s.friendBtnActive, friendBtn.disabled && s.friendBtnDisabled]}
                  onPress={onFriendAction}
                  disabled={friendBtn.disabled || busy}
                  activeOpacity={0.8}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color={friendBtn.active ? c.success : '#f2e4cf'} />
                  ) : (
                    <Text style={[s.friendBtnText, friendBtn.active && s.friendBtnTextActive]}>
                      {friendBtn.label}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={s.squadBtn} onPress={() => router.push('/friend-invite')}>
                  <Text style={s.squadBtnText}>{tp.inviteSquad}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { label: tp.statCommits, value: profile.totalCommits },
              { label: tp.statStreak, value: `${profile.currentStreak}d` },
              { label: tp.statRecord, value: `${profile.maxStreak}d` },
            ].map((st, i) => (
              <View key={i} style={[s.statCell, i < 2 && { borderRightWidth: 1, borderRightColor: c.surface2 }]}>
                <Text style={s.statValue}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          {/* Heatmap */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{tp.heatTitle}</Text>
            <View style={s.heatCard}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {Array.from({ length: 13 }, (_, w) => (
                  <View key={w} style={{ gap: 2 }}>
                    {Array.from({ length: 7 }, (_, d) => {
                      const val = profile.heatmap[w * 7 + d] ?? 0;
                      return (
                        <View
                          key={d}
                          style={{
                            width: cellSize - 2, height: cellSize - 2, borderRadius: 2,
                            backgroundColor: val === 0
                              ? c.surface2
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
            <Text style={s.sectionTitle}>{tp.recentTitle}</Text>
            <View style={s.activityCard}>
              {profile.recentActivity.length === 0 ? (
                <View style={s.activityRow}>
                  <Text style={s.activityEmpty}>{tp.recentEmpty}</Text>
                </View>
              ) : (
                profile.recentActivity.map((item, i) => (
                  <View key={i} style={[s.activityRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.surface2 }]}>
                    <View style={s.activityIcon}>
                      <Text style={{ fontSize: 14 }}>{TYPE_ICON[item.type] ?? '•'}</Text>
                    </View>
                    <Text style={s.activityText} numberOfLines={1}>{eventText(item.type, item.payload)}</Text>
                    <Text style={s.activityTime}>{ago(item.createdAt)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen:  { flex: 1, backgroundColor: c.bg },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, gap: 14, paddingTop: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.surface2,
  },
  backBtn:  { padding: 4, marginRight: 8, minWidth: 28 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: c.text2 },
  title:    { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text, flex: 1 },
  empty:    { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3, textAlign: 'center', paddingHorizontal: 24 },

  heroCard: {
    backgroundColor: c.surface, borderRadius: 14,
    borderWidth: 1, borderColor: c.surface2,
    alignItems: 'center', padding: 24, gap: 6,
  },
  userName: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text, letterSpacing: -0.3 },
  userHandle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3 },
  rankBadge: {
    backgroundColor: c.surface2, borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 2,
  },
  rankText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
  friendBtn: {
    flex: 1, backgroundColor: c.accent, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center', minHeight: 38,
  },
  friendBtnActive: { backgroundColor: c.success + '20', borderWidth: 1, borderColor: c.success + '50' },
  friendBtnDisabled: { backgroundColor: c.surface2 },
  friendBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#f2e4cf' },
  friendBtnTextActive: { color: c.success },
  squadBtn: {
    flex: 1, backgroundColor: c.surface2, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: c.surface2,
  },
  squadBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text2 },

  statsRow: {
    flexDirection: 'row', backgroundColor: c.surface,
    borderRadius: 12, borderWidth: 1, borderColor: c.surface2,
  },
  statCell: { flex: 1, alignItems: 'center', padding: 16 },
  statValue: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text, letterSpacing: -0.3 },
  statLabel: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3, marginTop: 2 },

  section: { gap: 8 },
  sectionTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, textTransform: 'lowercase' },

  heatCard: {
    backgroundColor: c.surface, borderRadius: 10,
    borderWidth: 1, borderColor: c.surface2, padding: 12,
  },

  activityCard: {
    backgroundColor: c.surface, borderRadius: 10,
    borderWidth: 1, borderColor: c.surface2, overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  activityIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center',
  },
  activityText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text, flex: 1 },
  activityTime: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3 },
  activityEmpty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3, flex: 1, textAlign: 'center' },
});
