import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank, type RankId } from '../constants/design';
import { XPIcon } from '../components/icons';
import { AvatarRing } from '../components/ui';
import { useT } from '../lib/i18n';
import { useAppStore } from '../store/app';
import { getTopUsers, getTopSquads, type RankUser, type RankSquad } from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;
const prettyRank = (r: string) =>
  r.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');

type Tab = 'users' | 'squads';

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().ranking;
  const myLogin = useAppStore((s) => s.user?.githubLogin);

  const [tab, setTab] = useState<Tab>('users');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<RankUser[]>([]);
  const [squads, setSquads] = useState<RankSquad[]>([]);

  const load = async () => {
    const [u, sq] = await Promise.all([getTopUsers(), getTopSquads()]);
    setUsers(u);
    setSquads(sq);
  };

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const posColor = (p: number) => (p === 1 ? C.gold : p === 2 ? C.silver : p === 3 ? C.bronze : C.text3);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={{ width: 24 }}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['users', 'squads'] as const).map((tb) => (
          <TouchableOpacity key={tb} style={[s.tab, tab === tb && s.tabOn]} onPress={() => setTab(tb)}>
            <Text style={[s.tabTxt, tab === tb && s.tabTxtOn]}>
              {tb === 'users' ? t.tabUsers : t.tabSquads}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.accent} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        >
          {tab === 'users' ? (
            users.length === 0 ? <Text style={s.empty}>{t.empty}</Text> :
            users.map((u) => {
              const rank = getRank(rid(u.rank));
              const mine = u.githubLogin === myLogin;
              return (
                <View key={u.id} style={[s.row, mine && s.rowMine]}>
                  <Text style={[s.pos, { color: posColor(u.position) }]}>#{u.position}</Text>
                  <AvatarRing size={36} variant={u.avatarVariant} rankId={rid(u.rank)} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.name}>
                      {u.displayName || u.githubLogin}{mine ? ` · ${t.you}` : ''}
                    </Text>
                    <Text style={[s.sub, { color: rank.color }]}>{rank.label} · @{u.githubLogin}</Text>
                  </View>
                  <View style={s.xpWrap}>
                    <XPIcon size={13} />
                    <Text style={s.xp}>{u.totalXp.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            squads.length === 0 ? <Text style={s.empty}>{t.empty}</Text> :
            squads.map((sq) => (
              <View key={sq.id} style={s.row}>
                <Text style={[s.pos, { color: posColor(sq.position) }]}>#{sq.position}</Text>
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <Text style={s.name}>{sq.name}</Text>
                  <Text style={s.sub}>{prettyRank(sq.rank)} · {sq.memberCount} {t.members}</Text>
                </View>
                <View style={s.xpWrap}>
                  <XPIcon size={13} />
                  <Text style={s.xp}>{sq.totalXp.toLocaleString()}</Text>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  back: { fontSize: 24, color: C.text },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text },
  tabs: {
    flexDirection: 'row', gap: 6, marginHorizontal: 20, marginBottom: 10,
    backgroundColor: C.surface, borderRadius: 8, padding: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 6 },
  tabOn: { backgroundColor: C.accent },
  tabTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text3 },
  tabTxtOn: { color: '#f2e4cf' },
  content: { paddingHorizontal: 20 },
  empty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text3, textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.surface2,
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  rowMine: { borderColor: C.accent + '66', backgroundColor: C.accent + '0d' },
  pos: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, width: 34 },
  name: { fontSize: 14, color: C.text },
  sub: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, marginTop: 3, color: C.text3 },
  xpWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  xp: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: C.text2 },
});
