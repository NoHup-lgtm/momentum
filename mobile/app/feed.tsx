import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { C, getRank, type RankId } from '../constants/design';
import { AvatarRing } from '../components/ui';
import { useT } from '../lib/i18n';
import { getFeed, type FeedItem } from '../lib/session';

const rid = (r: string) => r.toLowerCase() as RankId;

const TYPE_COLOR: Record<string, string> = {
  ACHIEVEMENT: C.purple, CHALLENGE_COMPLETED: C.accent, LIGA_PROMOTED: C.gold,
  STREAK_MILESTONE: C.accent, LEVEL_UP: C.success, RANK_UP: C.gold,
  CHEST_LEGENDARY: C.gold, SQUAD_JOIN: C.success,
};

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().social;
  const ta = useT().achievements;
  const tl = useT().liga;

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
        <View style={s.center}><ActivityIndicator color={C.accent} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        >
          {items.length === 0 ? (
            <Text style={s.empty}>{t.feedEmpty}</Text>
          ) : (
            items.map((it) => {
              const rank = getRank(rid(it.user.rank));
              const color = TYPE_COLOR[it.type] ?? C.accent;
              const name = it.user.isMe ? t.you : (it.user.displayName || it.user.githubLogin);
              return (
                <View key={it.id} style={[s.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
                  <AvatarRing size={40} variant={it.user.avatarVariant} rankId={rid(it.user.rank)} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardText}>
                      <Text style={[s.cardName, it.user.isMe && { color: C.accent }]}>{name} </Text>
                      {eventText(it)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <Text style={[s.cardRank, { color: rank.color }]}>{rank.label}</Text>
                      <Text style={s.cardTime}>· {ago(it.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              );
            })
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
  content: { paddingHorizontal: 18, gap: 10, paddingTop: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: C.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text },
  empty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text3, textAlign: 'center', marginTop: 48, paddingHorizontal: 24, lineHeight: 18 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2, padding: 12,
  },
  cardText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text2, lineHeight: 18 },
  cardName: { color: C.text },
  cardRank: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9 },
  cardTime: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
});
