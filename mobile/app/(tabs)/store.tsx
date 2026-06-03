import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type ThemeColors } from '../../contexts/ThemeContext';
import { CoinIcon, GemIcon } from '../../components/icons';
import { PixelItem } from '../../components/store/PixelItem';
import { useT } from '../../lib/i18n';
import { useAppStore } from '../../store/app';
import {
  getShop, buyItem, equipItem, fetchMe, meToStoreUser, getEquipped, getUnlockables,
  type Shop, type ShopItem, type UnlockItem,
} from '../../lib/session';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 20 * 2 - 12) / 2;

const RARITY: Record<string, string> = {
  COMMON: '#9a876c', RARE: '#3a82f7', PREMIUM: '#8b5cf6', LEGENDARY: '#c08a00',
};
const CATS = ['all', 'HAT', 'SHIRT', 'GLASSES', 'ACCESSORY', 'BACKGROUND'] as const;
const MODES = ['shop', 'legendary', 'challenge'] as const;
type Mode = (typeof MODES)[number];

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().shop;
  const setUser = useAppStore((s) => s.setUser);
  const setEquipped = useAppStore((s) => s.setEquipped);
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [unlocks, setUnlocks] = useState<UnlockItem[]>([]);
  const [mode, setMode] = useState<Mode>('shop');
  const [cat, setCat] = useState<(typeof CATS)[number]>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const [sh, un] = await Promise.all([getShop(), getUnlockables()]);
    setShop(sh); setUnlocks(un);
  };
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
      } else {
        setEquipped(await getEquipped());
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'erro');
    } finally {
      setBusy(null);
    }
  }

  async function equipUnlock(item: UnlockItem) {
    if (busy || !item.unlocked) return;
    setErr(null); setBusy(item.id);
    try {
      await equipItem(item.id);
      setUnlocks(await getUnlockables());
      setEquipped(await getEquipped());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'erro');
    } finally {
      setBusy(null);
    }
  }

  const condLabel = (item: UnlockItem) => {
    const tpl = t.cond[item.metric as keyof typeof t.cond] ?? '{x}';
    return tpl.replace('{x}', String(item.target));
  };

  if (loading) {
    return <View style={[s.screen, s.center, { paddingTop: insets.top }]}><ActivityIndicator color={c.accent} /></View>;
  }

  const items = (shop?.items ?? []).filter((i) => cat === 'all' || i.category === cat);
  const track = mode === 'legendary' ? 'LEGENDARY' : 'CHALLENGE';
  const unlockItems = unlocks.filter((u) => u.track === track);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.h1}>{t.title}</Text>
        <View style={s.balance}>
          <CoinIcon size={15} /><Text style={s.coinTxt}>{shop?.coins ?? 0}</Text>
          <GemIcon size={15} /><Text style={s.gemTxt}>{shop?.gems ?? 0}</Text>
        </View>
      </View>

      {/* Mode tabs */}
      <View style={s.modes}>
        {MODES.map((m) => (
          <TouchableOpacity key={m} style={[s.mode, mode === m && s.modeOn]} onPress={() => setMode(m)}>
            <Text style={[s.modeTxt, mode === m && s.modeTxtOn]}>{t.modes[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category filter (só na loja) */}
      {mode === 'shop' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap} contentContainerStyle={s.tabs}>
          {CATS.map((cName) => (
            <TouchableOpacity key={cName} style={[s.tab, cat === cName && s.tabOn]} onPress={() => setCat(cName)}>
              <Text style={[s.tabTxt, cat === cName && s.tabTxtOn]}>{t.cats[cName as keyof typeof t.cats]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {err && <Text style={s.err}>{err}</Text>}

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
      >
        {mode === 'shop' ? (
          <View style={s.grid}>
            {items.map((item) => {
              const color = RARITY[item.rarity] ?? c.text3;
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
                      {loadingThis ? <ActivityIndicator size="small" color={c.accent} /> : <Text style={s.equipTxt}>{t.equip}</Text>}
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
        ) : (
          <View style={s.grid}>
            {unlockItems.map((item) => {
              const color = RARITY[item.rarity] ?? c.text3;
              const label = t.items[item.key as keyof typeof t.items] ?? item.key;
              const loadingThis = busy === item.id;
              const pct = Math.min(1, item.target ? item.current / item.target : 0);
              return (
                <View key={item.id} style={[s.card, { borderColor: color + '40' }, !item.unlocked && { opacity: 0.85 }]}>
                  <View style={[s.art, { backgroundColor: color + '14' }]}>
                    <PixelItem id={item.key} size={CARD_W - 48} />
                  </View>
                  <Text style={s.name} numberOfLines={1}>{label}</Text>
                  <Text style={s.cond} numberOfLines={1}>{condLabel(item)}</Text>

                  {/* progress */}
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: item.unlocked ? c.success : color }]} />
                  </View>
                  <Text style={s.prog}>{Math.min(item.current, item.target)}/{item.target}</Text>

                  {item.equipped ? (
                    <View style={[s.btn, s.equipped]}><Text style={s.equippedTxt}>✓ {t.equipped}</Text></View>
                  ) : item.unlocked ? (
                    <TouchableOpacity style={[s.btn, s.equipBtn, loadingThis && { opacity: 0.5 }]} onPress={() => equipUnlock(item)} disabled={loadingThis}>
                      {loadingThis ? <ActivityIndicator size="small" color={c.accent} /> : <Text style={s.equipTxt}>{t.equip}</Text>}
                    </TouchableOpacity>
                  ) : (
                    <View style={[s.btn, s.lockedBtn]}><Text style={s.lockedTxt}>🔒 {t.locked}</Text></View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  h1: { fontFamily: 'Lora_400Regular', fontSize: 28, color: c.text },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  coinTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: c.gold, marginRight: 6 },
  gemTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: c.purple },
  modes: { flexDirection: 'row', gap: 6, marginHorizontal: 20, marginBottom: 10, backgroundColor: c.surface, borderRadius: 8, padding: 4 },
  mode: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6 },
  modeOn: { backgroundColor: c.accent },
  modeTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3 },
  modeTxtOn: { color: '#f2e4cf' },
  tabsWrap: { maxHeight: 44, marginBottom: 4 },
  tabs: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: c.surface2 },
  tabOn: { backgroundColor: c.accent, borderColor: c.accent },
  tabTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3 },
  tabTxtOn: { color: '#f2e4cf' },
  err: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.danger, paddingHorizontal: 20, marginBottom: 6 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: CARD_W, backgroundColor: c.surface, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 8 },
  art: { width: '100%', height: CARD_W - 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.text },
  cond: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3 },
  barBg: { width: '100%', height: 5, borderRadius: 3, backgroundColor: c.surface2, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  prog: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: c.text3, marginTop: -2 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 6, paddingVertical: 8, width: '100%' },
  buyBtn: { backgroundColor: c.accent },
  buyTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#f2e4cf' },
  equipBtn: { borderWidth: 1, borderColor: c.accent },
  equipTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.accent },
  equipped: { backgroundColor: c.success + '18', borderWidth: 1, borderColor: c.success + '40' },
  equippedTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.success },
  lockedBtn: { borderWidth: 1, borderColor: c.surface2 },
  lockedTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: c.text3 },
});
