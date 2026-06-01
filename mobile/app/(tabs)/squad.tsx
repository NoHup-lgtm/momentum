import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Share, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, getRank, type RankId } from '../../constants/design';
import { useTheme } from '../../contexts/ThemeContext';
import { XPIcon, SpiralIcon } from '../../components/icons';
import { AvatarRing } from '../../components/ui';
import { useT } from '../../lib/i18n';
import {
  getMySquad, getSquadLeaderboard, createSquad, joinSquad, createSquadInvite, leaveSquad,
  type Squad, type SquadMember,
} from '../../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

export default function SquadScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = useT().squad;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [squad, setSquad] = useState<Squad | null>(null);
  const [board, setBoard] = useState<SquadMember[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sq = await getMySquad();
    setSquad(sq);
    setBoard(sq ? await getSquadLeaderboard() : []);
  }, []);

  useEffect(() => {
    (async () => { await load(); setLoading(false); })();
  }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  async function handleCreate() {
    if (!name.trim() || busy) return;
    setErr(null); setBusy(true);
    try { await createSquad(name.trim()); setName(''); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'erro'); }
    finally { setBusy(false); }
  }

  async function handleJoin() {
    if (!code.trim() || busy) return;
    setErr(null); setBusy(true);
    try { await joinSquad(code.trim().toUpperCase()); setCode(''); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'erro'); }
    finally { setBusy(false); }
  }

  async function handleInvite() {
    try {
      const c = await createSquadInvite();
      await Share.share({ message: `momentum · ${c}` });
    } catch (e) { setErr(e instanceof Error ? e.message : 'erro'); }
  }

  async function handleLeave() {
    if (busy) return;
    setBusy(true);
    try { await leaveSquad(); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'erro'); }
    finally { setBusy(false); }
  }

  if (loading) {
    return (
      <View style={[s.screen, s.center, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
        <ActivityIndicator color={C.accent} />
        <Text style={s.dim}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        <Text style={s.h1}>squad</Text>

        {err && <Text style={s.err}>{err}</Text>}

        {!squad ? (
          // ── Sem squad ──────────────────────────────────────────────
          <>
            <View style={s.heroCard}>
              <SpiralIcon size={44} color={C.text3} />
              <Text style={s.heroTitle}>{t.noSquadTitle}</Text>
              <Text style={s.heroSub}>{t.noSquadSubtitle}</Text>
            </View>

            <Text style={s.section}>{t.createTitle}</Text>
            <View style={s.row}>
              <TextInput
                value={name} onChangeText={setName}
                placeholder={t.namePlaceholder} placeholderTextColor={C.text3}
                style={s.input} maxLength={30}
              />
              <TouchableOpacity style={[s.btn, (!name.trim() || busy) && s.btnOff]} onPress={handleCreate} disabled={!name.trim() || busy}>
                <Text style={s.btnTxt}>{t.create}</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.section}>{t.joinTitle}</Text>
            <View style={s.row}>
              <TextInput
                value={code} onChangeText={setCode}
                placeholder={t.codePlaceholder} placeholderTextColor={C.text3}
                autoCapitalize="characters"
                style={s.input} maxLength={10}
              />
              <TouchableOpacity style={[s.btn, (!code.trim() || busy) && s.btnOff]} onPress={handleJoin} disabled={!code.trim() || busy}>
                <Text style={s.btnTxt}>{t.join}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // ── Com squad ──────────────────────────────────────────────
          <>
            <View style={s.squadHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.squadName}>{squad.name}</Text>
                <Text style={s.dim}>{squad.memberCount}/{squad.maxMembers} {t.members}</Text>
              </View>
              {squad.isOwner && (
                <TouchableOpacity style={s.inviteBtn} onPress={handleInvite}>
                  <Text style={s.inviteTxt}>＋ {t.invite}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={s.section}>{t.weekRanking}</Text>
            {board.every((m) => (m.weeklyXp ?? 0) === 0) && (
              <Text style={s.dim}>{t.noActivity}</Text>
            )}

            {board.map((m, i) => {
              const rank = getRank(rid(m.rank));
              return (
                <View key={m.userId} style={s.memberRow}>
                  <Text style={[s.pos, { color: i < 3 ? C.accent : C.text3 }]}>#{i + 1}</Text>
                  <AvatarRing size={38} variant={m.avatarVariant} rankId={rid(m.rank)} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={s.nameRow}>
                      <Text style={s.memberName}>{m.displayName || m.githubLogin}</Text>
                      {m.role === 'OWNER' && <Text style={s.ownerTag}>{t.owner}</Text>}
                    </View>
                    <Text style={[s.memberRank, { color: rank.color }]}>{rank.label} · @{m.githubLogin}</Text>
                  </View>
                  <View style={s.xpWrap}>
                    <XPIcon size={13} />
                    <Text style={s.xpTxt}>{m.weeklyXp ?? 0}</Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={s.leaveBtn} onPress={handleLeave} disabled={busy}>
              <Text style={s.leaveTxt}>{t.leave}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontFamily: 'Lora_400Regular', fontSize: 28, color: C.text, marginBottom: 18 },
  dim: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3, marginTop: 8 },
  err: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.danger, marginBottom: 12 },

  heroCard: {
    alignItems: 'center', backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2, padding: 28, marginBottom: 24,
  },
  heroTitle: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text, marginTop: 14 },
  heroSub: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text3, textAlign: 'center', marginTop: 8, lineHeight: 18 },

  section: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 0.1,
    textTransform: 'uppercase', color: C.text3, marginTop: 18, marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.surface2,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    color: C.text, fontFamily: 'JetBrainsMono_400Regular', fontSize: 14,
  },
  btn: {
    backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOff: { opacity: 0.45 },
  btnTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: '#f2e4cf' },

  squadHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  squadName: { fontFamily: 'Lora_400Regular', fontSize: 22, color: C.text },
  inviteBtn: {
    borderWidth: 1, borderColor: C.accent + '55', backgroundColor: C.accent + '12',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9,
  },
  inviteTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.accent },

  memberRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.surface2,
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  pos: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, width: 28 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { fontSize: 14, color: C.text },
  ownerTag: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 8, letterSpacing: 0.08,
    textTransform: 'uppercase', color: C.accent,
    backgroundColor: C.accent + '18', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  memberRank: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, marginTop: 3 },
  xpWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  xpTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: C.text2 },
  leaveBtn: { alignSelf: 'center', marginTop: 24, paddingVertical: 10, paddingHorizontal: 18 },
  leaveTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.danger },
});
