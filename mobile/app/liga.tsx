import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { type RankId } from '../constants/design';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { XPIcon } from '../components/icons';
import { AvatarRing } from '../components/ui';
import { useT } from '../lib/i18n';
import { useAppStore } from '../store/app';
import { getMyLiga, type Liga } from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

// Cor de cada divisão (tier 1..6).
const TIER_COLOR: Record<number, string> = {
  1: '#cd7f32', 2: '#9aa0a8', 3: '#c08a00', 4: '#30d0d0', 5: '#7ab4e8', 6: '#8b5cf6',
};

export default function LigaScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().liga;
  const openPreview = useAppStore((st) => st.openProfilePreview);
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liga, setLiga] = useState<Liga | null>(null);

  const load = async () => setLiga(await getMyLiga());
  useEffect(() => { (async () => { await load(); setLoading(false); })(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const tierColor = liga ? (TIER_COLOR[liga.tier] ?? c.accent) : c.accent;
  const tierName = liga ? (t.tiers[liga.tier] ?? `Tier ${liga.tier}`) : '';

  const daysLabel = (d: number) =>
    d <= 0 ? t.today : `${d} ${d === 1 ? t.day : t.days}`;

  // Zonas de promoção/rebaixamento (índices na lista ordenada).
  const total = liga?.entries.length ?? 0;
  const promoteN = liga?.promoteCount ?? 0;
  const relegateN = liga?.relegateCount ?? 0;
  const inPromo = (pos: number) => promoteN > 0 && pos <= promoteN;
  const inRelegate = (pos: number) =>
    relegateN > 0 && total > promoteN && pos > total - relegateN;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={{ width: 24 }}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.title}</Text>
        <TouchableOpacity onPress={() => router.push('/ranking')} hitSlop={10}>
          <Text style={s.globalLink}>{t.globalRanking}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={c.accent} /></View>
      ) : !liga ? (
        <View style={s.center}><Text style={s.empty}>{t.empty}</Text></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
        >
          {/* Hero da divisão */}
          <View style={[s.hero, { borderColor: tierColor + '55' }]}>
            <View style={[s.badge, { borderColor: tierColor, backgroundColor: tierColor + '1a' }]}>
              <Text style={[s.badgeTier, { color: tierColor }]}>{liga.tier}</Text>
            </View>
            <Text style={[s.tierName, { color: tierColor }]}>{tierName}</Text>
            <Text style={s.sprintTxt}>
              {t.sprint} #{liga.sprintNumber} · {t.endsIn} {daysLabel(liga.daysLeft)}
            </Text>
            <Text style={s.howTxt}>{t.howItWorks}</Text>
          </View>

          {/* Legenda */}
          <View style={s.legend}>
            {promoteN > 0 && (
              <View style={s.legendItem}>
                <View style={[s.dot, { backgroundColor: c.success }]} />
                <Text style={s.legendTxt}>{t.promotion}</Text>
              </View>
            )}
            {relegateN > 0 && (
              <View style={s.legendItem}>
                <View style={[s.dot, { backgroundColor: c.danger }]} />
                <Text style={s.legendTxt}>{t.relegation}</Text>
              </View>
            )}
          </View>

          {/* Classificação */}
          {liga.entries.length === 0 ? (
            <Text style={s.empty}>{t.empty}</Text>
          ) : (
            liga.entries.map((e) => {
              const promo = inPromo(e.position);
              const releg = inRelegate(e.position);
              const edge = promo ? c.success : releg ? c.danger : 'transparent';
              return (
                <TouchableOpacity
                  key={e.userId}
                  activeOpacity={0.7}
                  onPress={() => !e.isMe && openPreview(e.userId)}
                  disabled={e.isMe}
                  style={[
                    s.row,
                    { borderLeftColor: edge, borderLeftWidth: 3 },
                    e.isMe && s.rowMine,
                  ]}
                >
                  <Text style={[s.pos, { color: promo ? c.success : releg ? c.danger : c.text3 }]}>
                    {e.position}
                  </Text>
                  <AvatarRing size={36} variant={e.avatarVariant} rankId={rid(e.rank)} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.name} numberOfLines={1}>
                      {e.displayName || e.githubLogin}{e.isMe ? ` · ${t.you}` : ''}
                    </Text>
                    <Text style={s.sub}>@{e.githubLogin} · lvl {e.level}</Text>
                  </View>
                  <View style={s.xpWrap}>
                    <XPIcon size={13} />
                    <Text style={s.xp}>{e.xpEarned.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  back: { fontSize: 24, color: c.text },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text },
  globalLink: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.accent },
  content: { paddingHorizontal: 20 },
  hero: {
    alignItems: 'center', backgroundColor: c.surface, borderWidth: 1,
    borderRadius: 14, paddingVertical: 22, paddingHorizontal: 18, marginBottom: 14,
  },
  badge: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  badgeTier: { fontFamily: 'Lora_400Regular', fontSize: 26 },
  tierName: { fontFamily: 'Lora_400Regular', fontSize: 24, marginBottom: 4 },
  sprintTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text2, marginBottom: 10 },
  howTxt: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3,
    textAlign: 'center', lineHeight: 15,
  },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 12, paddingHorizontal: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3 },
  empty: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3,
    textAlign: 'center', marginTop: 40, paddingHorizontal: 30, lineHeight: 18,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.surface2,
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  rowMine: { borderColor: c.accent + '66', backgroundColor: c.accent + '0d' },
  pos: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, width: 26, textAlign: 'center' },
  name: { fontSize: 14, color: c.text },
  sub: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, marginTop: 3, color: c.text3 },
  xpWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  xp: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.text2 },
});
