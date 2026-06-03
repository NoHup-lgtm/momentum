import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getRank, type RankId } from '../constants/design';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { AvatarRing } from '../components/ui';
import { useT } from '../lib/i18n';
import { getFriends, addFriend, removeFriend, type FriendRow } from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

export default function FriendInviteScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().social;
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [outgoing, setOutgoing] = useState<FriendRow[]>([]);

  const refresh = async () => setOutgoing((await getFriends()).outgoing);
  useFocusEffect(useCallback(() => { refresh(); }, []));

  const send = async () => {
    const handle = query.trim().replace(/^@/, '');
    if (!handle || busy) return;
    setBusy(true); setErr(null);
    try {
      const v = await addFriend(handle);
      setOutgoing(v.outgoing);
      setQuery('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'erro');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    try { setOutgoing((await removeFriend(id)).outgoing); } catch {}
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.title}>{t.inviteTitle}</Text>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.at}>@</Text>
        <TextInput
          style={s.searchInput}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={c.text3}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity style={[s.sendBtn, (!query.trim() || busy) && { opacity: 0.5 }]} onPress={send} disabled={!query.trim() || busy}>
          {busy ? <ActivityIndicator size="small" color="#f2e4cf" /> : <Text style={s.sendTxt}>{t.sendInvite}</Text>}
        </TouchableOpacity>
      </View>

      {err && <Text style={s.err}>{err}</Text>}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.hint}>{t.inviteHint}</Text>

        {outgoing.length > 0 && (
          <>
            <Text style={s.sectionTitle}>{t.pending} · {outgoing.length}</Text>
            {outgoing.map((f) => {
              const rank = getRank(rid(f.rank));
              return (
                <View key={f.friendshipId} style={s.userRow}>
                  <AvatarRing size={40} variant={f.avatarVariant} rankId={rid(f.rank)} equipped={f.equipped} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.userName}>{f.displayName || f.githubLogin}</Text>
                    <Text style={[s.userRank, { color: rank.color }]}>@{f.githubLogin} · {rank.label}</Text>
                  </View>
                  <TouchableOpacity style={s.cancelBtn} onPress={() => cancel(f.friendshipId)}>
                    <Text style={s.cancelTxt}>{t.sent} ✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  content: { paddingHorizontal: 18, gap: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.surface2,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: c.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12, gap: 8,
    borderBottomWidth: 1, borderBottomColor: c.surface2,
  },
  at: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 16, color: c.text3 },
  searchInput: { flex: 1, fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: c.text },
  sendBtn: { backgroundColor: c.accent, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  sendTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#f2e4cf' },
  err: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.danger, paddingHorizontal: 18, paddingTop: 10 },
  hint: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3, lineHeight: 17, paddingVertical: 8 },
  sectionTitle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, textTransform: 'lowercase', paddingTop: 4 },
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface, borderRadius: 10, borderWidth: 1, borderColor: c.surface2, padding: 10,
  },
  userName: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text },
  userRank: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, marginTop: 2 },
  cancelBtn: { borderWidth: 1, borderColor: c.surface2, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  cancelTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3 },
});
