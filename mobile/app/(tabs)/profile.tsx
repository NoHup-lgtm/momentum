import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getRank, type RankId } from '../../constants/design';
import { useTheme, type ThemeColors } from '../../contexts/ThemeContext';
import {
  FlameIcon, XPIcon, CoinIcon, GemIcon,
  LightningIcon, StarburstIcon, TrophyIcon, IceIcon,
  SpiralIcon, ShieldIcon, MoonIcon, SunriseIcon, ProcessorIcon,
  InfinityPixelIcon, CrownIcon,
} from '../../components/icons';
import { AvatarRing } from '../../components/ui';
import RankEmblem from '../../components/rank/RankEmblem';
import { useAppStore } from '../../store/app';
import {
  getHeatmap, logout, getAchievements, getEquipped, getFriends,
  type AchievementItem, type FriendRow,
} from '../../lib/session';
import { useT } from '../../lib/i18n';

// converte contagem de commits em intensidade 0–5 para o heatmap
const toIntensity = (count: number) =>
  count === 0 ? 0 : Math.min(5, Math.ceil(count / 3));

const { width: W } = Dimensions.get('window');

// ── Mock data ─────────────────────────────────────────────────────────────────
const USER = {
  name: 'Arthur',
  username: 'araujo',
  rankId: 'build' as RankId,
  level: 7,
  totalCommits: 284,
  streak: 14,
  longestStreak: 31,
  totalXP: 8420,
  weekXP: 2340,
  coins: 480,
  gems: 15,
  avatarVariant: 0,
};

// 13-week heatmap (Mon–Sun × 13)
const HEATMAP = Array.from({ length: 91 }, (_, i) => {
  const rnd = Math.random();
  if (i > 77) return rnd > 0.4 ? Math.floor(rnd * 5) + 1 : 0;
  return rnd > 0.6 ? Math.floor(rnd * 4) + 1 : 0;
});


// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap({ color, data = HEATMAP }: { color: string; data?: number[] }) {
  const { colors: c } = useTheme();
  const cellSize = (W - 56) / 13;
  const weeks = Array.from({ length: 13 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => data[w * 7 + d] ?? 0)
  );

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {weeks.map((week, wi) => (
        <View key={wi} style={{ gap: 2 }}>
          {week.map((val, di) => (
            <View
              key={di}
              style={{
                width: cellSize - 2,
                height: cellSize - 2,
                borderRadius: 2,
                backgroundColor: val === 0
                  ? c.surface2
                  : `${color}${Math.round((val / 5) * 200 + 55).toString(16).padStart(2, '0')}`,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Achievement Icon (SVG, no emoji) ─────────────────────────────────────────
function AchieveIcon({ category, size = 24, dim = false }: { category: string; size?: number; dim?: boolean }) {
  const tint = dim ? '#9a876c' : undefined;
  switch (category) {
    case 'STREAK': return <FlameIcon size={size} glowing={!dim} />;
    case 'COMMIT': return <StarburstIcon size={size} color={tint ?? '#c08a00'} />;
    case 'RANK': return <ProcessorIcon size={size} color={tint ?? '#3a82f7'} />;
    default: return <StarburstIcon size={size} color={tint ?? '#c08a00'} />;
  }
}

// ── Achievement Badge ─────────────────────────────────────────────────────────
function AchievementBadge({ label, category, dim }: { label: string; category: string; dim: boolean }) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  return (
    <View style={[s.achieveBadge, dim && s.achieveLocked]}>
      <AchieveIcon category={category} size={24} dim={dim} />
      <Text style={[s.achieveLabel, dim && { color: c.text3 }]}>{label}</Text>
    </View>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, plan } = useTheme();
  const s = makeStyles(c);

  // Usuário real do store (/me). Fallback no mock por campo enquanto carrega.
  const su = useAppStore((s) => s.user);
  const clearUser = useAppStore((s) => s.clearUser);
  const equipped = useAppStore((s) => s.equipped);
  const setEquipped = useAppStore((s) => s.setEquipped);

  async function handleLogout() {
    await logout(); // limpa os tokens do SecureStore
    clearUser();
    router.replace('/(auth)');
  }

  // Heatmap + totalCommits + weekXP vêm do GitHub (13 semanas).
  const ta = useT().achievements;
  const [heatmap, setHeatmap] = useState<number[]>(HEATMAP);
  const [ghCommits, setGhCommits] = useState(USER.totalCommits);
  const [weekXP, setWeekXP] = useState(USER.weekXP);
  const [achs, setAchs] = useState<AchievementItem[]>([]);
  const [friends, setFriends] = useState<FriendRow[]>([]);

  useEffect(() => {
    (async () => {
      const [days, achievements] = await Promise.all([getHeatmap(), getAchievements()]);
      if (days.length > 0) {
        setHeatmap(days.map((d) => toIntensity(d.count)));
        setGhCommits(days.reduce((sum, d) => sum + d.count, 0));
        const activeLast7 = days.slice(-7).filter((d) => d.count > 0).length;
        setWeekXP(activeLast7 * 50);
      }
      setAchs(achievements);
    })();
  }, []);

  // Recarrega os cosméticos equipados ao focar (reflete equip feito na loja).
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const [eq, fr] = await Promise.all([getEquipped(), getFriends()]);
        setEquipped(eq);
        setFriends(fr.friends);
      })();
    }, [setEquipped]),
  );

  // Conquistas pra prévia: desbloqueadas primeiro.
  const achPreview = [...achs].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

  const user = {
    name: su?.displayName ?? USER.name,
    username: su?.githubLogin ?? USER.username,
    rankId: su?.rank ?? USER.rankId,
    level: su?.level ?? USER.level,
    streak: su?.currentStreak ?? USER.streak,
    longestStreak: su?.maxStreak ?? USER.longestStreak,
    totalXP: su?.totalXp ?? USER.totalXP,
    coins: su?.coins ?? USER.coins,
    gems: su?.gems ?? USER.gems,
    avatarVariant: su?.avatarVariant ?? USER.avatarVariant,
    totalCommits: ghCommits,
    weekXP: weekXP,
  };

  const rank = getRank(user.rankId);

  return (
    <View style={[s.screen, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>perfil</Text>
          <TouchableOpacity style={s.settingsBtn} onPress={() => router.push('/settings')}>
            <ProcessorIcon size={18} color={c.text3} />
          </TouchableOpacity>
        </View>

        {/* Avatar + rank */}
        <View style={[s.heroCard, { backgroundColor: c.surface, borderColor: c.surface2 }]}>
          <View style={s.rankEmblemWrap}>
            <RankEmblem rankId={user.rankId} size={72} glowing />
          </View>

          <View style={s.avatarWrap}>
            <AvatarRing size={80} variant={user.avatarVariant} rankId={user.rankId} equipped={equipped} />
          </View>

          <Text style={s.userName}>{user.name}</Text>
          <Text style={s.userHandle}>@{user.username}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={s.rankBadge}>
              <Text style={[s.rankBadgeText, { color: rank.color }]}>
                {rank.label} · Lv. {user.level}
              </Text>
            </View>
            {/* Plan badge — only shown when subscribed */}
            {plan !== 'free' && (
              <View style={{
                backgroundColor: c.accent + '18',
                borderWidth: 1, borderColor: c.accent + '50',
                borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2,
              }}>
                <Text style={{
                  fontFamily: 'JetBrainsMono_400Regular',
                  fontSize: 9, color: c.accent, letterSpacing: 0.5,
                }}>
                  {plan.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Balances */}
          <View style={s.balances}>
            <View style={s.balanceItem}>
              <CoinIcon size={14} />
              <Text style={s.balanceVal}>{user.coins}</Text>
            </View>
            <View style={s.balanceDivider} />
            <View style={s.balanceItem}>
              <GemIcon size={14} />
              <Text style={[s.balanceVal, { color: c.purple }]}>{user.gems}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { label: 'commits',  value: user.totalCommits },
            { label: 'ofensiva', value: `${user.streak}d` },
            { label: 'recorde',  value: `${user.longestStreak}d` },
          ].map((st, i) => (
            <View key={i} style={s.statCell}>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick nav */}
        <View style={s.quickNav}>
          {[
            { label: 'squad',    screen: '/(tabs)/squad'  },
            { label: 'loja',     screen: '/(tabs)/store'  },
            { label: 'liga',     screen: '/liga'          },
            { label: 'amigos',   screen: '/friends'       },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.quickNavBtn}
              onPress={() => router.push(item.screen as any)}
              activeOpacity={0.75}
            >
              <Text style={s.quickNavText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contribution heatmap */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>atividade · 13 semanas</Text>
          <View style={s.heatmapCard}>
            <Heatmap color={rank.color} data={heatmap} />
            <View style={{ height: 1, backgroundColor: c.surface2, marginVertical: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.success }} />
              <Text style={{
                fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3,
              }}>sincronizado há 2 min · github.com/{user.username}</Text>
            </View>
          </View>
        </View>

        {/* Achievements preview */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>conquistas</Text>
            <TouchableOpacity onPress={() => router.push('/achievements')}>
              <Text style={s.seeAll}>ver todas →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}>
            {achPreview.map((a) => (
              <AchievementBadge
                key={a.id}
                label={ta.items[a.key as keyof typeof ta.items]?.label ?? a.key}
                category={a.category}
                dim={!a.unlocked}
              />
            ))}
          </ScrollView>
        </View>

        {/* Friends card */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>
              amigos · {friends.length}
            </Text>
            <TouchableOpacity onPress={() => router.push('/friends')}>
              <Text style={s.seeAll}>ver todos →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.friendsCard}>
            {friends.length > 0 && (
              <View style={s.friendAvatars}>
                {friends.slice(0, 6).map((f) => (
                  <TouchableOpacity
                    key={f.friendshipId}
                    style={{ position: 'relative' }}
                    onPress={() => router.push({
                      pathname: '/user-profile',
                      params: {
                        userId: f.userId, name: f.displayName || f.githubLogin,
                        username: f.githubLogin, variant: String(f.avatarVariant), rank: f.rank,
                      },
                    })}
                  >
                    <AvatarRing
                      size={40}
                      variant={f.avatarVariant}
                      rankId={f.rank.toLowerCase() as RankId}
                      equipped={f.equipped}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={s.addFriendBtn}
              onPress={() => router.push('/friend-invite')}
            >
              <Text style={s.addFriendText}>+ adicionar amigo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All-time stats */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>estatísticas gerais</Text>
          <View style={s.allTimeCard}>
            {[
              { label: 'XP total',         value: user.totalXP.toLocaleString() },
              { label: 'XP esta semana',   value: user.weekXP.toLocaleString()  },
              { label: 'maior ofensiva',   value: `${user.longestStreak} dias`  },
            ].map((st, i) => (
              <View key={i} style={[s.allTimeRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.surface2 }]}>
                <Text style={s.allTimeLabel}>{st.label}</Text>
                <Text style={s.allTimeValue}>{st.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutText}>sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen:  { flex: 1, backgroundColor: c.bg },
  content: { paddingHorizontal: 18, gap: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 16, marginBottom: 4,
  },
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: c.text, letterSpacing: -0.3,
  },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 18, color: c.text3 },

  heroCard: {
    backgroundColor: c.surface, borderRadius: 14,
    borderWidth: 1, borderColor: c.surface2,
    alignItems: 'center', padding: 24, paddingTop: 20,
  },
  rankEmblemWrap: { marginBottom: 8 },
  avatarWrap: { marginBottom: 12 },
  userName: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: c.text, letterSpacing: -0.3,
  },
  userHandle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: c.text3, marginTop: 2, marginBottom: 10,
  },
  rankBadge: {
    backgroundColor: c.surface2, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  rankBadgeText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
  },
  balances: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceDivider: { width: 1, height: 14, backgroundColor: c.surface2 },
  balanceVal: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.gold,
  },

  statsRow: {
    flexDirection: 'row', backgroundColor: c.surface,
    borderRadius: 12, borderWidth: 1, borderColor: c.surface2,
  },
  statCell: {
    flex: 1, alignItems: 'center', padding: 16,
    borderRightWidth: 1, borderRightColor: c.surface2,
  },
  statValue: {
    fontFamily: 'Lora_400Regular', fontSize: 20,
    color: c.text, letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: c.text3, marginTop: 2, textTransform: 'lowercase',
  },

  quickNav: { flexDirection: 'row', gap: 8 },
  quickNavBtn: {
    flex: 1, backgroundColor: c.surface, borderRadius: 8,
    borderWidth: 1, borderColor: c.surface2,
    paddingVertical: 10, alignItems: 'center',
  },
  quickNavText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: c.text2, textTransform: 'lowercase',
  },

  section: { gap: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: c.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },
  seeAll: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.accent,
  },

  heatmapCard: {
    backgroundColor: c.surface, borderRadius: 10,
    borderWidth: 1, borderColor: c.surface2,
    padding: 14,
  },

  achieveBadge: {
    alignItems: 'center', gap: 4,
    backgroundColor: c.surface, borderRadius: 10,
    borderWidth: 1, borderColor: c.surface2,
    paddingHorizontal: 14, paddingVertical: 12, minWidth: 72,
  },
  achieveLocked: { opacity: 0.4 },
  achieveIcon:  { fontSize: 22 },
  achieveLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: c.text2, textAlign: 'center',
  },

  friendsCard: {
    backgroundColor: c.surface, borderRadius: 12,
    borderWidth: 1, borderColor: c.surface2,
    padding: 14, gap: 12,
  },
  friendAvatars: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: c.success, borderWidth: 1.5, borderColor: c.bg,
  },
  addFriendBtn: {
    backgroundColor: c.surface2, borderRadius: 6,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: c.accent + '40',
  },
  addFriendText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.accent,
  },

  allTimeCard: {
    backgroundColor: c.surface, borderRadius: 10,
    borderWidth: 1, borderColor: c.surface2, overflow: 'hidden',
  },
  allTimeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, alignItems: 'center',
  },
  allTimeLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3,
  },
  allTimeValue: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text2,
  },
  logoutBtn: {
    marginTop: 24, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 8,
    borderWidth: 1, borderColor: c.danger + '55',
    backgroundColor: c.danger + '12',
  },
  logoutText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.danger,
  },
});
