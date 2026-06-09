import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { getRank, type RankId } from '../constants/design';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { AvatarRing } from './ui';
import { ProfileSkeleton } from './Skeleton';
import RankEmblem from './rank/RankEmblem';
import { useT } from '../lib/i18n';
import { useAppStore } from '../store/app';
import {
  getUserProfile, addFriend, acceptFriend, removeFriend,
  type PublicProfile, type FriendshipState,
} from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

// Bottom-sheet de preview de um usuário. Acionado por openProfilePreview(userId)
// de qualquer tela (ranking, liga, squad, feed, amigos). Mostra nível/infos +
// adicionar amigo, com atalho pro perfil completo.
export default function ProfilePreview() {
  const userId = useAppStore((s) => s.previewUserId);
  const close = useAppStore((s) => s.closeProfilePreview);
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const tp = useT().social.profile;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    setLoading(true);
    setProfile(null);
    (async () => {
      const p = await getUserProfile(userId);
      if (alive) {
        setProfile(p);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId]);

  const fstate: FriendshipState = profile?.friendship.state ?? 'none';
  const fid = profile?.friendship.friendshipId ?? null;

  const friendBtn = (() => {
    switch (fstate) {
      case 'friends':  return { label: tp.friendsLabel, active: true, disabled: false };
      case 'incoming': return { label: tp.acceptInvite, active: false, disabled: false };
      case 'outgoing': return { label: tp.pendingLabel, active: false, disabled: true };
      default:         return { label: tp.addFriend, active: false, disabled: false };
    }
  })();

  const onFriendAction = async () => {
    if (busy || !profile) return;
    setBusy(true);
    try {
      if (fstate === 'none') {
        await addFriend(profile.githubLogin);
        patch('outgoing', fid);
      } else if (fstate === 'incoming' && fid) {
        await acceptFriend(fid);
        patch('friends', fid);
      } else if (fstate === 'friends' && fid) {
        await removeFriend(fid);
        patch('none', null);
      }
    } catch {} finally { setBusy(false); }
  };

  const patch = (state: FriendshipState, friendshipId: string | null) =>
    setProfile((p) => (p ? { ...p, friendship: { state, friendshipId } } : p));

  const openFull = () => {
    if (!profile) return;
    close();
    router.push({
      pathname: '/user-profile',
      params: {
        userId: profile.id,
        name: profile.displayName || profile.githubLogin,
        username: profile.githubLogin,
        variant: String(profile.avatarVariant),
        rank: profile.rank,
      },
    });
  };

  const rankStr = profile?.rank ?? 'INIT';
  const rank = getRank(rid(rankStr));

  return (
    <Modal
      visible={userId != null}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <Pressable style={s.backdrop} onPress={close}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handle} />

          {loading || !profile ? (
            <ProfileSkeleton compact />
          ) : (
            <>
              <View style={s.hero}>
                <RankEmblem rankId={rid(rankStr)} size={52} glowing />
                <AvatarRing size={64} variant={profile.avatarVariant} rankId={rid(rankStr)} equipped={profile.equipped} />
                <Text style={s.name}>{profile.displayName || profile.githubLogin}</Text>
                <Text style={s.userHandle}>@{profile.githubLogin}</Text>
                <View style={s.rankBadge}>
                  <Text style={[s.rankText, { color: rank.color }]}>
                    {rank.label} · Lv. {profile.level}
                  </Text>
                </View>
              </View>

              <View style={s.statsRow}>
                {[
                  { label: tp.statCommits, value: profile.totalCommits },
                  { label: tp.statStreak, value: `${profile.currentStreak}d` },
                  { label: tp.statRecord, value: `${profile.maxStreak}d` },
                ].map((st, i) => (
                  <View key={i} style={[s.statCell, i < 2 && s.statBorder]}>
                    <Text style={s.statValue}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                ))}
              </View>

              {fstate !== 'self' && (
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
              )}

              <TouchableOpacity style={s.fullBtn} onPress={openFull} activeOpacity={0.8}>
                <Text style={s.fullBtnText}>{tp.seeFull}</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: c.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 18, paddingTop: 10, paddingBottom: 34,
    borderTopWidth: 1, borderColor: c.surface2,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.surface2, marginBottom: 14 },
  loadingBox: { height: 220, alignItems: 'center', justifyContent: 'center' },

  hero: { alignItems: 'center', gap: 6 },
  name: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text, letterSpacing: -0.3 },
  userHandle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3 },
  rankBadge: { backgroundColor: c.surface2, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginTop: 2 },
  rankText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11 },

  statsRow: {
    flexDirection: 'row', backgroundColor: c.surface, borderRadius: 12,
    borderWidth: 1, borderColor: c.surface2, marginTop: 16,
  },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderRightWidth: 1, borderRightColor: c.surface2 },
  statValue: { fontFamily: 'Lora_400Regular', fontSize: 18, color: c.text },
  statLabel: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3, marginTop: 2 },

  friendBtn: {
    backgroundColor: c.accent, borderRadius: 8, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 12, minHeight: 44,
  },
  friendBtnActive: { backgroundColor: c.success + '20', borderWidth: 1, borderColor: c.success + '50' },
  friendBtnDisabled: { backgroundColor: c.surface2 },
  friendBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: '#f2e4cf' },
  friendBtnTextActive: { color: c.success },

  fullBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 8 },
  fullBtnText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.accent },
});
