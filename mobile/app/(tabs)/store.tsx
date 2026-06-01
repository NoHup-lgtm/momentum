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
import { useAppStore } from '../../store/app';
import {
  getShop, buyItem, equipItem, fetchMe, meToStoreUser,
  type Shop, type ShopItem,
} from '../../lib/session';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 20 * 2 - 12) / 2;

const RARITY: Record<string, string> = {
  COMMON: C.text3, RARE: '#3a82f7', PREMIUM: C.purple, LEGENDARY: C.gold,
};
const CATS = ['all', 'HAT', 'SHIRT', 'GLASSES', 'ACCESSORY', 'BACKGROUND'] as const;

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().shop;
  const setUser = useAppStore((s) => s.setUser);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [cat, setCat] = useState<(typeof CATS)[number]>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => setShop(await getShop());
  useEffect(() => { (async () => { await load(); setLoading(false); })(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  async function act(item: ShopItem, kind: 'buy' | 'equip') {
    if (busy) return;
    setErr(null); setBusy(item.id);
    try {
      const updated = kind === 'buy' ? await buyItem(item.id) : await equipItem(item.id);
      setShop(updated);
      if (kind === 'buy') {
        const me = await fetchMe();
        if (me) setUser(meToStoreUser(me));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'erro');
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <View style={[s.screen, s.center, { paddingTop: insets.top }]}><ActivityIndicator color={C.accent} /></View>;
  }

  const items = (shop?.items ?? []).filter((i) => cat === 'all' || i.category === cat);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.h1}>{t.title}</Text>
        <View style={s.balance}>
          <CoinIcon size={15} /><Text style={s.coinTxt}>{shop?.coins ?? 0}</Text>
          <GemIcon size={15} /><Text style={s.gemTxt}>{shop?.gems ?? 0}</Text>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap} contentContainerStyle={s.tabs}>
        {CATS.map((cName) => (
          <TouchableOpacity key={cName} style={[s.tab, cat === cName && s.tabOn]} onPress={() => setCat(cName)}>
            <Text style={[s.tabTxt, cat === cName && s.tabTxtOn]}>{t.cats[cName as keyof typeof t.cats]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {err && <Text style={s.err}>{err}</Text>}

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        <View style={s.grid}>
          {items.map((item) => {
            const color = RARITY[item.rarity] ?? C.text3;
            const label = t.items[item.key as keyof typeof t.items] ?? item.key;
            const isGem = item.priceGems > 0;
            const afford = isGem ? (shop?.gems ?? 0) >= item.priceGems : (shop?.coins ?? 0) >= item.priceCoins;
            const loadingThis = busy === item.id;
            return (
              <View key={item.id} style={[s.card, { borderColor: color + '40' }]}>
                <View style={[s.art, { backgroundColor: color + '14' }]}>
                  <PixelItem id={item.key} size={CARD_W - 48} />
                </View>
                <Text style={s.name} numberOfLines={1}>{label}</Text>

                {item.equipped ? (
                  <View style={[s.btn, s.equipped]}><Text style={s.equippedTxt}>✓ {t.equipped}</Text></View>
                ) : item.owned ? (
                  <TouchableOpacity style={[s.btn, s.equipBtn, loadingThis && { opacity: 0.5 }]} onPress={() => act(item, 'equip')} disabled={loadingThis}>
                    {loadingThis ? <ActivityIndicator size="small" color={C.accent} /> : <Text style={s.equipTxt}>{t.equip}</Text>}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[s.btn, s.buyBtn, (!afford || loadingThis) && { opacity: 0.5 }]} onPress={() => act(item, 'buy')} disabled={!afford || loadingThis}>
                    {loadingThis ? <ActivityIndicator size="small" color="#f2e4cf" /> : (
                      <>
                        {isGem ? <GemIcon size={12} /> : <CoinIcon size={12} />}
                        <Text style={s.buyTxt}>{isGem ? item.priceGems : item.priceCoins}</Text>
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
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  h1: { fontFamily: 'Lora_400Regular', fontSize: 28, color: C.text },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  coinTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: C.gold, marginRight: 6 },
  gemTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: C.purple },
  tabsWrap: { maxHeight: 44, marginBottom: 4 },
  tabs: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.surface2 },
  tabOn: { backgroundColor: C.accent, borderColor: C.accent },
  tabTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3 },
  tabTxtOn: { color: '#f2e4cf' },
  err: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.danger, paddingHorizontal: 20, marginBottom: 6 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: CARD_W, backgroundColor: C.surface, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 10 },
  art: { width: '100%', height: CARD_W - 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 6, paddingVertical: 8, width: '100%' },
  buyBtn: { backgroundColor: C.accent },
  buyTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#f2e4cf' },
  equipBtn: { borderWidth: 1, borderColor: C.accent },
  equipTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.accent },
  equipped: { backgroundColor: C.success + '18', borderWidth: 1, borderColor: C.success + '40' },
  equippedTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.success },
});
