import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, type ViewStyle, type DimensionValue } from 'react-native';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';

// Bloco "fantasma" que pulsa suavemente (opacity 0.35↔0.75). Dá a sensação de
// que o conteúdo está chegando — mais fluido que um spinner girando no vazio.
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 6,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const { colors: c } = useTheme();
  const op = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.75, duration: 700, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [op]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: c.surface2, opacity: op }, style]}
    />
  );
}

// Linha de lista (ranking/liga/feed/amigos): avatar + 2 linhas + barra à direita.
export function ListSkeleton({ rows = 7 }: { rows?: number }) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  return (
    <View style={s.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={s.row}>
          <Skeleton width={38} height={38} radius={19} />
          <View style={s.lines}>
            <Skeleton width="55%" height={12} />
            <Skeleton width="35%" height={9} />
          </View>
          <Skeleton width={44} height={12} />
        </View>
      ))}
    </View>
  );
}

// Grade de cards (loja/conquistas): N cards com área de arte + título + botão.
export function GridSkeleton({ count = 6 }: { count?: number }) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  return (
    <View style={s.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={s.card}>
          <Skeleton width="100%" height={90} radius={8} />
          <Skeleton width="70%" height={11} />
          <Skeleton width="100%" height={30} radius={6} />
        </View>
      ))}
    </View>
  );
}

// Perfil (user-profile / preview): hero centralizado + linha de stats + heatmap.
export function ProfileSkeleton({ compact = false }: { compact?: boolean }) {
  const { colors: c } = useTheme();
  const s = makeStyles(c);
  return (
    <View style={s.profile}>
      <Skeleton width={64} height={64} radius={32} />
      <Skeleton width={140} height={16} />
      <Skeleton width={90} height={10} />
      <Skeleton width={120} height={22} radius={12} />
      <View style={s.statsCard}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={s.statCol}>
            <Skeleton width={36} height={18} />
            <Skeleton width={48} height={9} />
          </View>
        ))}
      </View>
      {!compact && <Skeleton width="100%" height={92} radius={10} />}
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: 18, paddingTop: 8, gap: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    lines: { flex: 1, gap: 6 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8, gap: 12 },
    card: {
      width: '47%', backgroundColor: c.surface, borderRadius: 12,
      borderWidth: 1, borderColor: c.surface2, padding: 12, gap: 8, alignItems: 'center',
    },
    profile: { paddingHorizontal: 18, paddingTop: 20, alignItems: 'center', gap: 12 },
    statsCard: {
      flexDirection: 'row', width: '100%', backgroundColor: c.surface,
      borderRadius: 12, borderWidth: 1, borderColor: c.surface2, paddingVertical: 16, marginTop: 4,
    },
    statCol: { flex: 1, alignItems: 'center', gap: 6 },
  });
