import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank, type RankId } from '../constants/design';
import { FlameIcon } from '../components/icons';
import { AvatarRing } from '../components/ui';

const FRIENDS = [
  { username: 'dev_k',   name: 'Kauã Dev',   streak: 21, rankId: 'deploy' as RankId, avatarVariant: 2, isOnline: true  },
  { username: 'carol_v', name: 'Carol V.',    streak: 12, rankId: 'build'  as RankId, avatarVariant: 4, isOnline: true  },
  { username: 'moyza',   name: 'Moyza',       streak: 9,  rankId: 'init'   as RankId, avatarVariant: 1, isOnline: false },
  { username: 'cata',    name: 'Catarina',    streak: 5,  rankId: 'init'   as RankId, avatarVariant: 3, isOnline: false },
  { username: 'jota',    name: 'João T.',     streak: 18, rankId: 'build'  as RankId, avatarVariant: 5, isOnline: false },
  { username: 'ana_lima',name: 'Ana Lima',    streak: 3,  rankId: 'init'   as RankId, avatarVariant: 0, isOnline: false },
];

function FriendRow({ friend }: { friend: typeof FRIENDS[0] }) {
  const rank = getRank(friend.rankId);
  return (
    <TouchableOpacity
      style={s.friendRow}
      activeOpacity={0.75}
      onPress={() => router.push('/user-profile')}
    >
      <View style={{ position: 'relative' }}>
        <AvatarRing size={44} variant={friend.avatarVariant} rankId={friend.rankId} />
        {friend.isOnline && <View style={s.onlineDot} />}
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={s.friendName}>{friend.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <Text style={s.friendHandle}>@{friend.username}</Text>
          <Text style={[s.friendRank, { color: rank.color }]}>{rank.label}</Text>
        </View>
      </View>

      <View style={s.friendStreak}>
        <FlameIcon size={14} />
        <Text style={s.friendStreakText}>{friend.streak}d</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const online  = FRIENDS.filter(f => f.isOnline);
  const offline = FRIENDS.filter(f => !f.isOnline);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>amigos</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/friend-invite')}>
          <Text style={s.addBtnText}>+ adicionar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {online.length > 0 && (
          <>
            <Text style={s.sectionTitle}>online agora · {online.length}</Text>
            {online.map(f => <FriendRow key={f.username} friend={f} />)}
          </>
        )}

        <Text style={[s.sectionTitle, { marginTop: 8 }]}>offline · {offline.length}</Text>
        {offline.map(f => <FriendRow key={f.username} friend={f} />)}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 8 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: C.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text, flex: 1 },
  addBtn: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5,
  },
  addBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.accent },

  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', paddingTop: 4,
  },

  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, padding: 12,
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.success, borderWidth: 2, borderColor: C.bg,
  },
  friendName: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: C.text },
  friendHandle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3 },
  friendRank: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9 },
  friendStreak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  friendStreakText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text2 },
});
