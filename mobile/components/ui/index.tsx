import React from 'react';
import { View, ViewStyle, Text, StyleSheet } from 'react-native';
import { C } from '../../constants/design';

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({ children, elevated = false, style }: CardProps) {
  return (
    <View style={[
      styles.card,
      elevated && styles.cardElevated,
      style,
    ]}>
      {children}
    </View>
  );
}

// ── XP Bar ────────────────────────────────────────────────────────────────────
interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

export function XPBar({ current, max, level }: XPBarProps) {
  const pct = Math.min(current / max, 1);
  return (
    <View>
      <View style={styles.xpRow}>
        <Text style={styles.xpLabel}>nível {level}</Text>
        <Text style={styles.xpCount}>{current} / {max} XP</Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${pct * 100}%` as any }]} />
      </View>
    </View>
  );
}

// ── Avatar Ring ───────────────────────────────────────────────────────────────
import PixelAvatar from '../avatar/PixelAvatar';
import type { RankId } from '../../constants/design';
import { getRank } from '../../constants/design';

interface AvatarRingProps {
  size?: number;
  variant?: number;
  rankId?: RankId;
}

export function AvatarRing({ size = 34, variant = 0, rankId }: AvatarRingProps) {
  const rank = rankId ? getRank(rankId) : null;
  const borderColor = rank ? rank.color : C.surface2;
  return (
    <View style={[
      styles.avatarRing,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderColor,
        overflow: 'hidden',
      },
    ]}>
      <PixelAvatar size={size - 4} variant={variant} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.surface2,
  },
  cardElevated: {
    backgroundColor: C.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: C.text3,
    textTransform: 'lowercase',
    letterSpacing: 0.05,
  },
  xpCount: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: C.text3,
  },
  xpTrack: {
    height: 4,
    backgroundColor: C.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: C.gold,
  },
  avatarRing: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
