import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/design';
import { CoinIcon, GemIcon } from '../../components/icons';
import { PixelItem } from '../../components/store/PixelItem';
import { useT } from '../../lib/i18n';

// chave do cosmético → id da pixel art (PixelItem/GRIDS)
const ART: Record<string, string> = {
  dev_cap: 'c1', hacker_beanie: 'c3', desk_plant: 'c5', clone_hoodie: 'c2',
  hack_glasses: 'c4', mech_keyboard: 'c6', space_helmet: 'c11', matrix_bg: 'g3',
};
import { useAppStore } from '../../store/app';
import { getShop, buyItem, fetchMe, meToStoreUser, type Shop, type ShopItem } from '../../lib/session';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 20 * 2 - 12) / 2;

const RARITY: Record<string, string> = {
  COMMON: C.text3, RARE: '#3a82f7', PREMIUM: C.purple, LEGENDARY: C.gold,
};

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().shop;
  const setUser = useAppStore((s) => s.setUser);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => setShop(await getShop());
  useEffect(() => { (async () => { await load(); setLoading(false); })(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  async function buy(item: ShopItem) {
    if (busy) return;
    setErr(null); setBusy(item.id);
    try {
      const updated = await buyItem(item.id);
      setShop(updated);
      const me = await fetchMe();
      if (me) setUser(meToStoreUser(me));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'erro');
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <View style={[s.screen, s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.h1}>{t.title}</Text>
        <View style={s.balance}>
          <CoinIcon size={15} />
          <Text style={s.balanceTxt}>{shop?.coins ?? 0}</Text>
          <GemIcon size={15} />
          <Text style={[s.balanceTxt, { color: C.purple }]}>{shop?.gems ?? 0}</Text>
        </View>
      </View>

      {err && <Text style={s.err}>{err}</Text>}

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        <View style={s.grid}>
          {(shop?.items ?? []).map((item) => {
            const color = RARITY[item.rarity] ?? C.text3;
            const label = t.items[item.key as keyof typeof t.items] ?? item.key;
            const afford = (shop?.coins ?? 0) >= item.priceCoins;
            return (
              <View key={item.id} style={[s.card, { borderColor: color + '40' }]}>
                <View style={[s.art, { backgroundColor: color + '14' }]}>
                  <PixelItem id={ART[item.key] ?? 'c1'} size={CARD_W - 48} />
                </View>
                <Text style={s.name} numberOfLines={1}>{label}</Text>

                {item.owned ? (
                  <View style={s.owned}><Text style={s.ownedTxt}>{t.owned}</Text></View>
                ) : (
                  <TouchableOpacity
                    style={[s.buyBtn, (!afford || busy === item.id) && { opacity: 0.5 }]}
                    onPress={() => buy(item)}
                    disabled={!afford || busy === item.id}
                  >
                    {busy === item.id ? (
                      <ActivityIndicator size="small" color="#f2e4cf" />
                    ) : (
                      <>
                        <CoinIcon size={12} />
                        <Text style={s.buyTxt}>{item.priceCoins}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  h1: { fontFamily: 'Lora_400Regular', fontSize: 28, color: C.text },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: C.gold, marginRight: 6 },
  err: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.danger, paddingHorizontal: 20, marginBottom: 8 },
  content: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: CARD_W, backgroundColor: C.surface, borderWidth: 1, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 10,
  },
  art: {
    width: '100%', height: CARD_W - 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  artDot: { width: 28, height: 28, borderRadius: 8 },
  name: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: C.accent, borderRadius: 6, paddingVertical: 8, width: '100%',
  },
  buyTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#f2e4cf' },
  owned: {
    width: '100%', alignItems: 'center', paddingVertical: 8, borderRadius: 6,
    backgroundColor: C.success + '18', borderWidth: 1, borderColor: C.success + '40',
  },
  ownedTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.success },
});
