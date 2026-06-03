import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { PixelChest, type ChestRarity } from '../components/chests/PixelChest';
import { CoinIcon, GemIcon } from '../components/icons';
import { useT } from '../lib/i18n';
import { useAppStore } from '../store/app';
import {
  getChests, openChest, fetchMe, meToStoreUser,
  type PendingChest, type ChestReward,
} from '../lib/session';

const RARITY_COLOR: Record<string, string> = {
  COMUM: '#9a876c', RARO: '#3a82f7', EPICO: '#8b5cf6', LENDARIO: '#c08a00',
};

export default function ChestsScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().chests;
  const setUser = useAppStore((s) => s.setUser);
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [loading, setLoading] = useState(true);
  const [chests, setChests] = useState<PendingChest[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [reward, setReward] = useState<{ rarity: string; rewards: ChestReward[] } | null>(null);

  const load = async () => setChests(await getChests());
  useEffect(() => { (async () => { await load(); setLoading(false); })(); }, []);

  async function open(id: string) {
    if (busy) return;
    setBusy(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = await openChest(id);
    if (result) {
      setReward(result);
      const me = await fetchMe();
      if (me) setUser(meToStoreUser(me));
      await load();
    }
    setBusy(null);
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={{ width: 24 }}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={c.accent} /></View>
      ) : chests.length === 0 ? (
        <View style={s.center}><Text style={s.empty}>{t.empty}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {chests.map((c) => {
            const color = RARITY_COLOR[c.rarity] ?? '#9a876c';
            return (
              <View key={c.id} style={[s.card, { borderColor: color + '40' }]}>
                <PixelChest rarity={c.rarity.toLowerCase() as ChestRarity} size={56} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[s.rarity, { color }]}>{c.rarity}</Text>
                  <Text style={s.source}>{c.source.toLowerCase()}</Text>
                </View>
                <TouchableOpacity
                  style={[s.openBtn, busy === c.id && { opacity: 0.5 }]}
                  onPress={() => open(c.id)}
                  disabled={busy === c.id}
                >
                  {busy === c.id ? <ActivityIndicator size="small" color="#f2e4cf" /> : <Text style={s.openTxt}>{t.open}</Text>}
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* Reward reveal */}
      <Modal visible={!!reward} transparent animationType="fade" onRequestClose={() => setReward(null)}>
        <View style={s.backdrop}>
          <View style={s.sheet}>
            {reward && <PixelChest rarity={reward.rarity.toLowerCase() as ChestRarity} size={88} />}
            <Text style={s.youGot}>{t.youGot}</Text>
            <View style={s.rewards}>
              {reward?.rewards.map((r, i) => (
                <View key={i} style={s.rewardRow}>
                  {r.type === 'GEMS' ? <GemIcon size={20} /> : <CoinIcon size={20} />}
                  <Text style={s.rewardAmount}>+{r.amount}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={() => setReward(null)}>
              <Text style={s.closeTxt}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  empty: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text3 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10,
  },
  rarity: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, textTransform: 'lowercase' },
  source: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, marginTop: 3 },
  openBtn: {
    backgroundColor: c.accent, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center', minWidth: 80,
  },
  openTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: '#f2e4cf' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  sheet: {
    backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.surface2,
    padding: 32, alignItems: 'center', gap: 16, width: '78%',
  },
  youGot: { fontFamily: 'Lora_400Regular', fontSize: 18, color: c.text },
  rewards: { flexDirection: 'row', gap: 20 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardAmount: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 18, color: c.text },
  closeBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 28, borderRadius: 8, backgroundColor: c.accent },
  closeTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: '#f2e4cf' },
});
