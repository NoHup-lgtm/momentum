import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getRank, type RankId } from '../constants/design';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { AvatarRing } from '../components/ui';
import { ListSkeleton } from '../components/Skeleton';
import { useT } from '../lib/i18n';
import { useAppStore } from '../store/app';
import {
  getFriends, acceptFriend, removeFriend, getFeed,
  type FriendRow, type FeedItem,
} from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().social;
  const ta = useT().achievements;
  const tl = useT().liga;
  const openPreview = useAppStore((st) => st.openProfilePreview);
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [incoming, setIncoming] = useState<FriendRow[]>([]);
  const [activity, setActivity] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const [fr, feed] = await Promise.all([getFriends(), getFeed('friends')]);
    setIncoming(fr.incoming);
    setActivity(feed.filter((it) => !it.user.isMe).slice(0, 30));
  };
  useFocusEffect(useCallback(() => { (async () => { await load(); setLoading(false); })(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const respond = async (fid: string, fn: (id: string) => Promise<unknown>) => {
    setBusy(fid);
    try { await fn(fid); setIncoming((prev) => prev.filter((f) => f.friendshipId !== fid)); }
    catch {} finally { setBusy(null); }
  };

  const eventText = (it: FeedItem): string => {
    const p = it.payload ?? {};
    switch (it.type) {
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
    const m = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const empty = incoming.length === 0 && activity.length === 0;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.title}>{t.notifTitle}</Text>
      </View>

      {loading ? (
        <ListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
        >
          {/* Pedidos de amizade */}
          {incoming.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>{t.requests} · {incoming.length}</Text>
              {incoming.map((f) => (
                <View key={f.friendshipId} style={s.reqRow}>
                  <TouchableOpacity onPress={() => openPreview(f.userId)} activeOpacity={0.7}>
                    <AvatarRing size={40} variant={f.avatarVariant} rankId={rid(f.rank)} equipped={f.equipped} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.reqName} numberOfLines={1}>{f.displayName || f.githubLogin}</Text>
                    <Text style={s.reqHandle} numberOfLines={1}>@{f.githubLogin}</Text>
                  </View>
                  <TouchableOpacity style={[s.miniBtn, s.acceptBtn]} disabled={busy === f.friendshipId} onPress={() => respond(f.friendshipId, acceptFriend)}>
                    {busy === f.friendshipId ? <ActivityIndicator size="small" color={c.success} /> : <Text style={s.acceptTxt}>{t.accept}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.miniBtn, s.declineBtn]} disabled={busy === f.friendshipId} onPress={() => respond(f.friendshipId, removeFriend)}>
                    <Text style={s.declineTxt}>{t.remove}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Atividade da rede */}
          {activity.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>{t.notifActivity}</Text>
              {activity.map((it) => {
                const rank = getRank(rid(it.user.rank));
                return (
                  <TouchableOpacity key={it.id} style={s.actRow} activeOpacity={0.7} onPress={() => openPreview(it.user.id)}>
                    <AvatarRing size={36} variant={it.user.avatarVariant} rankId={rid(it.user.rank)} equipped={it.user.equipped} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.actText} numberOfLines={2}>
                        <Text style={[s.actName, { color: rank.color }]}>{it.user.displayName || it.user.githubLogin} </Text>
                        {eventText(it)}
                      </Text>
                    </View>
                    <Text style={s.actTime}>{ago(it.createdAt)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {empty && <Text style={s.empty}>{t.notifEmpty}</Text>}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.surface2,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: c.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text },
  content: { paddingHorizontal: 18, paddingTop: 14, gap: 18 },
  section: { gap: 10 },
  sectionTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, textTransform: 'lowercase' },

  reqRow: { flexDirection: 'row', alignItems: 'center' },
  reqName: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.text },
  reqHandle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, marginTop: 2 },
  miniBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, marginLeft: 6, minWidth: 56, alignItems: 'center' },
  acceptBtn: { backgroundColor: c.success + '20', borderWidth: 1, borderColor: c.success + '50' },
  acceptTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.success },
  declineBtn: { borderWidth: 1, borderColor: c.surface2 },
  declineTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3 },

  actRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  actText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text2, lineHeight: 17 },
  actName: { fontFamily: 'JetBrainsMono_400Regular' },
  actTime: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3, marginLeft: 8 },

  empty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3, textAlign: 'center', marginTop: 48, paddingHorizontal: 24, lineHeight: 18 },
});
