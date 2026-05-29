import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank, type RankId } from '../constants/design';
import { FlameIcon } from '../components/icons';
import { AvatarRing } from '../components/ui';

const SUGGESTED = [
  { username: 'lara_dev',  name: 'Lara Dev',   streak: 8,  rankId: 'build'  as RankId, avatarVariant: 1, mutual: true,  invited: false },
  { username: 'bit_ops',   name: 'Bit Ops',    streak: 14, rankId: 'deploy' as RankId, avatarVariant: 2, mutual: true,  invited: false },
  { username: 'joao_dev',  name: 'João Dev',   streak: 3,  rankId: 'init'   as RankId, avatarVariant: 3, mutual: false, invited: false },
  { username: 'xara_dev',  name: 'Xara Dev',   streak: 21, rankId: 'senior' as RankId, avatarVariant: 4, mutual: true,  invited: true  },
  { username: 'full_stack',name: 'Full Stack',  streak: 6,  rankId: 'build'  as RankId, avatarVariant: 5, mutual: false, invited: false },
];

export default function FriendInviteScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [invited, setInvited] = useState<Set<string>>(
    new Set(SUGGESTED.filter(u => u.invited).map(u => u.username))
  );

  const results = query.length > 0
    ? SUGGESTED.filter(u => u.username.includes(query) || u.name.toLowerCase().includes(query))
    : SUGGESTED;

  const toggle = (username: string) => {
    setInvited(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username); else next.add(username);
      return next;
    });
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>convidar</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="buscar por username…"
          placeholderTextColor={C.text3}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Share link */}
        <View style={s.shareCard}>
          <View>
            <Text style={s.shareTitle}>link de convite</Text>
            <Text style={s.shareUrl}>momentum.app/invite/void-runners</Text>
          </View>
          <TouchableOpacity style={s.copyBtn}>
            <Text style={s.copyBtnText}>copiar</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <Text style={s.sectionTitle}>
          {query ? `resultados para "${query}"` : 'sugestões · amigos mútuos'}
        </Text>

        {results.map(user => {
          const rank = getRank(user.rankId);
          const isInvited = invited.has(user.username);

          return (
            <View key={user.username} style={s.userRow}>
              <AvatarRing size={40} variant={user.avatarVariant} rankId={user.rankId} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.userName}>{user.name}</Text>
                  {user.mutual && (
                    <View style={s.mutualBadge}>
                      <Text style={s.mutualText}>mútuo</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <Text style={s.userHandle}>@{user.username}</Text>
                  <Text style={[s.userRank, { color: rank.color }]}>{rank.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <FlameIcon size={10} />
                    <Text style={s.streakText}>{user.streak}d</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[s.inviteBtn, isInvited && s.invitedBtn]}
                onPress={() => toggle(user.username)}
                activeOpacity={0.8}
              >
                <Text style={[s.inviteBtnText, isInvited && s.invitedBtnText]}>
                  {isInvited ? '✓ convidado' : 'convidar'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

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
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.surface2,
    paddingHorizontal: 18, paddingVertical: 12, gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1, fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13, color: C.text,
  },

  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', paddingTop: 4,
  },

  shareCard: {
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.accent + '40',
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  shareTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3, marginBottom: 4 },
  shareUrl:   { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  copyBtn: {
    backgroundColor: C.accent, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  copyBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#f2e4cf' },

  userRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, padding: 10,
  },
  userName:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  userHandle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
  userRank:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9 },
  streakText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
  mutualBadge: {
    backgroundColor: C.surface2, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  mutualText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 8, color: C.text3 },
  inviteBtn: {
    backgroundColor: C.surface2, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: C.accent + '50',
  },
  invitedBtn: { borderColor: C.success + '50', backgroundColor: C.success + '15' },
  inviteBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.accent },
  invitedBtnText: { color: C.success },
});
