import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native';
import { C } from '../../constants/design';
import { SpiralIcon } from '../icons';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');

interface Props {
  level: number;
  visible: boolean;
  onDismiss: () => void;
}

export default function LevelUpOverlay({ level, visible, onDismiss }: Props) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const scale    = useRef(new Animated.Value(1.4)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    barWidth.setValue(0);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }),
    ]).start();

    // XP bar fills up after a short delay
    Animated.timing(barWidth, {
      toValue: 1, duration: 900, delay: 400, useNativeDriver: false,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.backdrop, { opacity }]}>
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        <View style={s.spiralWrap} pointerEvents="none">
          <SpiralIcon size={160} color={C.accent} />
        </View>

        <Text style={s.tag}>level up</Text>
        <Text style={s.level}>nível {level}</Text>
        <Text style={s.sub}>você subiu de nível. continue.</Text>

        <View style={s.barTrack}>
          <Animated.View style={[s.barFill, {
            width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]} />
        </View>
        <Text style={s.barLabel}>novo nível desbloqueado</Text>

        <TouchableOpacity style={s.btn} onPress={onDismiss} activeOpacity={0.8}>
          <Text style={s.btnText}>continuar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,7,3,0.9)',
    alignItems: 'center', justifyContent: 'center', zIndex: 998,
  },
  card: {
    width: W * 0.78, alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18, borderWidth: 1, borderColor: C.gold + '40',
    padding: 32, overflow: 'hidden',
  },
  spiralWrap: {
    position: 'absolute', opacity: 0.08, top: -20, right: -20,
  },
  tag: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.gold, letterSpacing: 0.2, textTransform: 'uppercase',
    marginBottom: 12,
  },
  level: {
    fontFamily: 'Lora_400Regular', fontSize: 52,
    color: C.text, letterSpacing: -2, lineHeight: 56,
  },
  sub: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, marginTop: 8, marginBottom: 24,
  },
  barTrack: {
    width: '100%', height: 4, backgroundColor: C.surface2,
    borderRadius: 2, overflow: 'hidden', marginBottom: 8,
  },
  barFill: {
    height: '100%', backgroundColor: C.gold, borderRadius: 2,
  },
  barLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.text3, marginBottom: 28,
  },
  btn: {
    backgroundColor: C.gold + 'ee', borderRadius: 8,
    paddingHorizontal: 28, paddingVertical: 11,
  },
  btnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#1a1000',
  },
});
