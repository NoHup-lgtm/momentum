import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { C } from '../../constants/design';
import { PixelChest } from '../chests/PixelChest';

interface Props {
  count: number;
  topRarity: 'comum' | 'raro' | 'epico' | 'lendario';
}

const RARITY_COLOR: Record<string, string> = {
  comum: C.text3, raro: '#3a82f7', epico: C.purple, lendario: C.gold,
};

const RARITY_LABEL: Record<string, string> = {
  comum: 'comum', raro: 'raro', epico: 'épico', lendario: 'lendário',
};

export default function PendingChestsCard({ count, topRarity }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const color = RARITY_COLOR[topRarity] ?? C.accent;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      style={[s.card, { borderColor: color + '50' }]}
      onPress={() => router.push('/chests')}
      activeOpacity={0.85}
    >
      {/* Pulsing chest art */}
      <Animated.View style={[s.artWrap, { backgroundColor: color + '12', transform: [{ scale: pulseAnim }] }]}>
        <PixelChest rarity={topRarity} size={48} />
      </Animated.View>

      <View style={s.info}>
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: color }]} />
          <Text style={[s.label, { color }]}>
            {count} {count === 1 ? 'baú esperando' : 'baús esperando'}
          </Text>
        </View>
        <Text style={s.sub}>
          melhor: baú {RARITY_LABEL[topRarity]} · toque para abrir
        </Text>
      </View>

      <Text style={[s.arrow, { color }]}>→</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  artWrap: {
    width: 64, height: 64, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  info:  { flex: 1, gap: 4 },
  row:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:   { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12 },
  sub:   { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3 },
  arrow: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 18 },
});
