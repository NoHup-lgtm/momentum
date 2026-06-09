import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getRank, type RankId } from '../constants/design';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { AvatarRing } from '../components/ui';
import { useT } from '../lib/i18n';
import { useAppStore } from '../store/app';
import { getFeed, type FeedItem } from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

const TYPE_COLOR: Record<string, string> = {
  ACHIEVEMENT: '#8b5cf6', CHALLENGE_COMPLETED: '#d4673a', LIGA_PROMOTED: '#c08a00',
  STREAK_MILESTONE: '#d4673a', LEVEL_UP: '#5a7a50', RANK_UP: '#c08a00',
  CHEST_LEGENDARY: '#c08a00', SQUAD_JOIN: '#5a7a50',
};

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().social;
  const ta = useT().achievements;
  const tl = useT().liga;
  const openPreview = useAppStore((st) => st.openProfilePreview);
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => setItems(await getFeed());
  useFocusEffect(useCallback(() => { (async () => { await load(); setLoading(false); })(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // Texto localizado do evento a partir do type + payload.
  const eventText = (it: FeedItem): string => {
    const p = it.payload ?? {};
    switch (it.type) {
      case 'ACHIEVEMENT': {
        const label = p.key ? ta.items[p.key as keyof typeof ta.items]?.label : null;
        return label ? t.ev.achievement.replace('{x}', label) : t.ev.achievement_generic;
      }
      case 'CHALLENGE_COMPLETED': return t.ev.challenge;
      case 'LIGA_PROMOTED': {
        const name = tl.tiers[Number(p.toTier)] ?? `#${p.toTier}`;
        return t.ev.liga.replace('{x}', name);
      }
      case 'STREAK_MILESTONE': return t.ev.streak.replace('{x}', String(p.streak ?? ''));
      case 'LEVEL_UP': return t.ev.levelup;
      case 'RANK_UP': return t.ev.rankup;
      case 'CHEST_LEGENDARY': return t.ev.chest;
      case 'SQUAD_JOIN': return t.ev.squad;
      default: return '';
    }
  };

  const ago = (iso: string): string => {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.title}>{t.feedTitle}</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={c.accent} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
          ListEmptyComponent={<Text style={s.empty}>{t.feedEmpty}</Text>}
          ListFooterComponent={<View style={{ height: 32 }} />}
          renderItem={({ item: it }) => {
            const rank = getRank(rid(it.user.rank));
            const color = TYPE_COLOR[it.type] ?? c.accent;
            const name = it.user.isMe ? t.you : (it.user.displayName || it.user.githubLogin);
            return (
              <View style={[s.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
                <TouchableOpacity
                  activeOpacity={it.user.isMe ? 1 : 0.7}
                  disabled={it.user.isMe}
                  onPress={() => openPreview(it.user.id)}
                >
                  <AvatarRing size={40} variant={it.user.avatarVariant} rankId={rid(it.user.rank)} equipped={it.user.equipped} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.cardText}>
                    <Text style={[s.cardName, it.user.isMe && { color: c.accent }]}>{name} </Text>
                    {eventText(it)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text style={[s.cardRank, { color: rank.color }]}>{rank.label}</Text>
                    <Text style={s.cardTime}>· {ago(it.createdAt)}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, gap: 10, paddingTop: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.surface2,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: c.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text },
  empty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3, textAlign: 'center', marginTop: 48, paddingHorizontal: 24, lineHeight: 18 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface, borderRadius: 12,
    borderWidth: 1, borderColor: c.surface2, padding: 12,
  },
  cardText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text2, lineHeight: 18 },
  cardName: { color: c.text },
  cardRank: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9 },
  cardTime: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3 },
});
