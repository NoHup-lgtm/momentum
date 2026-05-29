import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { C } from '../../constants/design';
import { SpiralIcon } from '../icons';

interface Props {
  streak: number;
  username: string;
}

export default function ShareStreakCard({ streak, username }: Props) {
  const [copied, setCopied] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleShare = () => {
    // Simulate copy to clipboard
    setCopied(true);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 30 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }),
    ]).start();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={s.wrapper}>
      {/* The card itself (visual representation of what'd be shared) */}
      <Animated.View style={[s.shareCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={s.spiralBg} pointerEvents="none">
          <SpiralIcon size={80} color={C.accent} />
        </View>
        <View style={s.cardContent}>
          <Text style={s.cardStreak}>{streak}</Text>
          <Text style={s.cardUnit}>dias de ofensiva</Text>
          <Text style={s.cardUser}>@{username} · momentum</Text>
        </View>
      </Animated.View>

      <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.8}>
        <Text style={s.shareBtnText}>
          {copied ? 'link copiado' : 'compartilhar ofensiva'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: 10 },
  shareCard: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.accent + '35',
    padding: 18, flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden',
  },
  spiralBg: {
    position: 'absolute', right: -10, top: -10, opacity: 0.12,
  },
  cardContent: { flex: 1 },
  cardStreak: {
    fontFamily: 'Lora_400Regular', fontSize: 38,
    color: C.text, letterSpacing: -2, lineHeight: 42,
  },
  cardUnit: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, marginTop: 2,
  },
  cardUser: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.accent, marginTop: 8,
  },
  shareBtn: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent + '50',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center',
  },
  shareBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.accent,
  },
});
