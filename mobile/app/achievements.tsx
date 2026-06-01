import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C } from '../constants/design';
import {
  LightningIcon, FlameIcon, IceIcon, StarburstIcon, ProcessorIcon,
} from '../components/icons';
import { useT } from '../lib/i18n';
import { getAchievements, type AchievementItem } from '../lib/session';

const RARITY_COLOR: Record<string, string> = {
  COMMON: C.text3, RARE: '#3a82f7', EPIC: C.purple, LEGENDARY: C.gold,
};

function Icon({ keyName, dim }: { keyName: string; dim: boolean }) {
  const c = dim ? C.text3 : undefined;
  switch (keyName) {
    case 'spark': return <LightningIcon size={26} color={c ?? '#ffd97a'} />;
    case 'consistent': return <FlameIcon size={26} glowing={!dim} />;
    case 'unstoppable': return <IceIcon size={26} color={c ?? '#7ab4e8'} />;
    case 'centurion': return <StarburstIcon size={26} color={c ?? C.gold} />;
    case 'ascendant': return <ProcessorIcon size={26} color={c ?? '#3a82f7'} />;
    default: return <StarburstIcon size={26} color={c ?? C.gold} />;
  }
}

function Card({ a, t }: { a: AchievementItem; t: ReturnType<typeof useT>['achievements'] }) {
  const item = t.items[a.key as keyof typeof t.items] ?? { label: a.key, desc: '' };
  const dim = !a.unlocked;
  const rarityColor = RARITY_COLOR[a.rarity] ?? C.text3;
  const progress = Math.min(1, a.currentValue / a.target);

  return (
    <View style={[s.card, { borderColor: dim ? C.surface2 : rarityColor + '55' }]}>
      <View style={[s.iconWrap, { backgroundColor: dim ? C.surface2 : rarityColor + '18', opacity: dim ? 0.6 : 1 }]}>
        <Icon keyName={a.key} dim={dim} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.nameRow}>
          <Text style={[s.name, dim && { color: C.text3 }]}>{item.label}</Text>
          {a.unlocked && <Text style={[s.tag, { color: rarityColor }]}>✓</Text>}
        </View>
        <Text style={s.desc}>{item.desc}</Text>
        {!a.unlocked && (
          <View style={s.progressWrap}>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={s.progressTxt}>{a.currentValue}/{a.target}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().achievements;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<AchievementItem[]>([]);

  const load = async () => setItems(await getAchievements());
  useEffect(() => { (async () => { await load(); setLoading(false); })(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const unlocked = items.filter((a) => a.unlocked);
  const locked = items.filter((a) => !a.unlocked);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={{ width: 24 }}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.title}</Text>
        <Text style={s.count}>{unlocked.length}/{items.length}</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.accent} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        >
          {unlocked.length > 0 && <Text style={s.section}>{t.unlocked}</Text>}
          {unlocked.map((a) => <Card key={a.id} a={a} t={t} />)}
          {locked.length > 0 && <Text style={s.section}>{t.locked}</Text>}
          {locked.map((a) => <Card key={a.id} a={a} t={t} />)}
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
  count: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text3, width: 40, textAlign: 'right' },
  content: { paddingHorizontal: 20 },
  section: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 0.1,
    textTransform: 'uppercase', color: C.text3, marginTop: 18, marginBottom: 10,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: 'Lora_400Regular', fontSize: 16, color: C.text },
  tag: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 },
  desc: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3, marginTop: 2 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressBar: { flex: 1, height: 4, backgroundColor: C.surface2, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.accent, borderRadius: 2 },
  progressTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
});
