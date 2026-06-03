import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { FlameIcon, StarburstIcon, ProcessorIcon } from '../components/icons';
import { useT } from '../lib/i18n';
import { getAchievements, type AchievementItem } from '../lib/session';

const RARITY_COLOR: Record<string, string> = {
  COMMON: '#9a876c', RARE: '#3a82f7', EPIC: '#8b5cf6', LEGENDARY: '#c08a00',
};

function Icon({ category, dim }: { category: string; dim: boolean }) {
  const tint = dim ? '#9a876c' : undefined;
  switch (category) {
    case 'STREAK': return <FlameIcon size={26} glowing={!dim} />;
    case 'COMMIT': return <StarburstIcon size={26} color={tint ?? '#c08a00'} />;
    case 'RANK': return <ProcessorIcon size={26} color={tint ?? '#3a82f7'} />;
    default: return <StarburstIcon size={26} color={tint ?? '#c08a00'} />;
  }
}

function Card({ a, t }: { a: AchievementItem; t: ReturnType<typeof useT>['achievements'] }) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  const item = t.items[a.key as keyof typeof t.items] ?? { label: a.key, desc: '' };
  const dim = !a.unlocked;
  const rarityColor = RARITY_COLOR[a.rarity] ?? c.text3;
  const progress = Math.min(1, a.currentValue / a.target);

  return (
    <View style={[s.card, { borderColor: dim ? c.surface2 : rarityColor + '55' }]}>
      <View style={[s.iconWrap, { backgroundColor: dim ? c.surface2 : rarityColor + '18', opacity: dim ? 0.6 : 1 }]}>
        <Icon category={a.category} dim={dim} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.nameRow}>
          <Text style={[s.name, dim && { color: c.text3 }]}>{item.label}</Text>
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
  const { colors: c } = useTheme();
  const s = makeStyles(c);
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
        <View style={s.center}><ActivityIndicator color={c.accent} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
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

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  back: { fontSize: 24, color: c.text },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text },
  count: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3, width: 40, textAlign: 'right' },
  content: { paddingHorizontal: 20 },
  section: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 0.1,
    textTransform: 'uppercase', color: c.text3, marginTop: 18, marginBottom: 10,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: c.surface, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: 'Lora_400Regular', fontSize: 16, color: c.text },
  tag: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 },
  desc: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3, marginTop: 2 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressBar: { flex: 1, height: 4, backgroundColor: c.surface2, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: c.accent, borderRadius: 2 },
  progressTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3 },
});
