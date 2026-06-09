import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getRank, type RankId } from '../constants/design';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { FlameIcon } from '../components/icons';
import { AvatarRing } from '../components/ui';
import { ListSkeleton } from '../components/Skeleton';
import { useT } from '../lib/i18n';
import {
  getFriends, acceptFriend, removeFriend,
  type FriendsView, type FriendRow,
} from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().social;
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [data, setData] = useState<FriendsView>({ friends: [], incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => setData(await getFriends());
  useFocusEffect(useCallback(() => { (async () => { await load(); setLoading(false); })(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const act = async (id: string, fn: (id: string) => Promise<FriendsView>) => {
    if (busy) return;
    setBusy(id);
    try { setData(await fn(id)); } catch {} finally { setBusy(null); }
  };

  const Row = ({ f, kind }: { f: FriendRow; kind: 'friend' | 'incoming' | 'outgoing' }) => {
    const rank = getRank(rid(f.rank));
    const loadingThis = busy === f.friendshipId;
    return (
      <View style={s.friendRow}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          activeOpacity={0.7}
          onPress={() => router.push({
            pathname: '/user-profile',
            params: {
              userId: f.userId, name: f.displayName || f.githubLogin,
              username: f.githubLogin, variant: String(f.avatarVariant), rank: f.rank,
            },
          })}
        >
          <AvatarRing size={44} variant={f.avatarVariant} rankId={rid(f.rank)} equipped={f.equipped} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.friendName}>{f.displayName || f.githubLogin}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <Text style={s.friendHandle}>@{f.githubLogin}</Text>
              <Text style={[s.friendRank, { color: rank.color }]}>{rank.label} · lvl {f.level}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {kind === 'incoming' ? (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity style={[s.miniBtn, s.acceptBtn]} disabled={loadingThis} onPress={() => act(f.friendshipId, acceptFriend)}>
              {loadingThis ? <ActivityIndicator size="small" color={c.success} /> : <Text style={s.acceptTxt}>{t.accept}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[s.miniBtn, s.removeBtn]} disabled={loadingThis} onPress={() => act(f.friendshipId, removeFriend)}>
              <Text style={s.removeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : kind === 'outgoing' ? (
          <Text style={s.sentTag}>{t.sent}</Text>
        ) : (
          <View style={s.friendStreak}>
            <FlameIcon size={14} glowing={f.currentStreak > 0} />
            <Text style={s.friendStreakText}>{f.currentStreak}d</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.title}>{t.friendsTitle}</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/friend-invite')}>
          <Text style={s.addBtnText}>{t.add}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
        >
          {data.incoming.length > 0 && (
            <>
              <Text style={s.sectionTitle}>{t.requests} · {data.incoming.length}</Text>
              {data.incoming.map((f) => <Row key={f.friendshipId} f={f} kind="incoming" />)}
            </>
          )}

          <Text style={[s.sectionTitle, { marginTop: data.incoming.length ? 12 : 4 }]}>
            {t.yourFriends} · {data.friends.length}
          </Text>
          {data.friends.length === 0 && data.incoming.length === 0 ? (
            <Text style={s.empty}>{t.noFriends}</Text>
          ) : (
            data.friends.map((f) => <Row key={f.friendshipId} f={f} kind="friend" />)
          )}

          {data.outgoing.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { marginTop: 12 }]}>{t.pending} · {data.outgoing.length}</Text>
              {data.outgoing.map((f) => <Row key={f.friendshipId} f={f} kind="outgoing" />)}
            </>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, gap: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.surface2,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: c.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text, flex: 1 },
  addBtn: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.accent, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  addBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.accent },
  sectionTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, textTransform: 'lowercase', paddingTop: 4 },
  empty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3, textAlign: 'center', marginTop: 24, paddingHorizontal: 20, lineHeight: 18 },
  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface, borderRadius: 10, borderWidth: 1, borderColor: c.surface2, padding: 12,
  },
  friendName: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.text },
  friendHandle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3 },
  friendRank: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9 },
  friendStreak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  friendStreakText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text2 },
  miniBtn: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center', justifyContent: 'center', minWidth: 36 },
  acceptBtn: { borderWidth: 1, borderColor: c.success + '60', backgroundColor: c.success + '15' },
  acceptTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.success },
  removeBtn: { borderWidth: 1, borderColor: c.surface2 },
  removeTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3 },
  sentTag: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3 },
});
