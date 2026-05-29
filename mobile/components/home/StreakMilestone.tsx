import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { SpiralIcon } from '../icons';
import { C } from '../../constants/design';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');

const MILESTONES: Record<number, string> = {
  7:   'uma semana sólida',
  14:  'duas semanas sem parar',
  30:  'um mês de consistência',
  50:  'cinquenta dias. impressionante.',
  100: 'cem dias. você é diferente.',
};

interface Props {
  streak: number;
  visible: boolean;
  onDismiss: () => void;
}

export default function StreakMilestone({ streak, visible, onDismiss }: Props) {
  const opacity   = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(0.7)).current;
  const rotation  = useRef(new Animated.Value(0)).current;
  const numScale  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Entrance
    Animated.parallel([
      Animated.timing(opacity,  { toValue: 1,   duration: 320, useNativeDriver: true }),
      Animated.spring(scale,    { toValue: 1,   useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.spring(numScale, { toValue: 1,   useNativeDriver: true, speed: 10, bounciness: 12, delay: 120 }),
    ]).start();

    // Spiral slow rotation loop
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, [visible]);

  if (!visible) return null;

  const label = MILESTONES[streak] ?? `${streak} dias consecutivos`;
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[s.backdrop, { opacity }]}>
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        {/* Spiral bg */}
        <Animated.View style={[s.spiralBg, { transform: [{ rotate: spin }] }]}>
          <SpiralIcon size={300} color={C.accent} />
        </Animated.View>

        <Text style={s.tag}>marco de ofensiva</Text>

        <Animated.Text style={[s.number, { transform: [{ scale: numScale }] }]}>
          {streak}
        </Animated.Text>
        <Text style={s.unit}>dias</Text>
        <Text style={s.label}>{label}</Text>

        <TouchableOpacity style={s.btn} onPress={onDismiss} activeOpacity={0.8}>
          <Text style={s.btnText}>continuar →</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,7,3,0.94)',
    alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  card: {
    width: W * 0.82, alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 20, borderWidth: 1, borderColor: C.accent + '40',
    padding: 36, overflow: 'hidden',
  },
  spiralBg: {
    position: 'absolute', opacity: 0.06,
    top: -30, left: -30,
  },
  tag: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.accent, letterSpacing: 0.15, textTransform: 'lowercase',
    marginBottom: 16,
  },
  number: {
    fontFamily: 'Lora_400Regular', fontSize: 88,
    color: C.text, letterSpacing: -4, lineHeight: 92,
  },
  unit: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13,
    color: C.text3, marginTop: 4, marginBottom: 20,
  },
  label: {
    fontFamily: 'Lora_400Regular', fontSize: 17,
    color: C.text2, textAlign: 'center', letterSpacing: -0.2,
    marginBottom: 32, lineHeight: 24,
  },
  btn: {
    backgroundColor: C.accent, borderRadius: 8,
    paddingHorizontal: 32, paddingVertical: 12,
    shadowColor: C.accent, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 14,
  },
  btnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: '#f2e4cf',
  },
});
