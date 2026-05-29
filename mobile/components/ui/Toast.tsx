import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/design';

export type ToastHandle = { show: (msg: string, type?: 'success' | 'info') => void };

export const Toast = forwardRef<ToastHandle>((_, ref) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const [msg, setMsg] = React.useState('');
  const [type, setType] = React.useState<'success' | 'info'>('success');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    show(message: string, t: 'success' | 'info' = 'success') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMsg(message);
      setType(t);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
        Animated.timing(opacity,    { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 120, duration: 280, useNativeDriver: true }),
          Animated.timing(opacity,    { toValue: 0,   duration: 220, useNativeDriver: true }),
        ]).start();
      }, 2200);
    },
  }));

  const borderColor = type === 'success' ? C.success : C.accent;
  const icon        = type === 'success' ? '✓' : 'ℹ';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.container,
        { bottom: insets.bottom + 88, opacity, transform: [{ translateY }] },
        { borderColor: borderColor + '50' },
      ]}
    >
      <Text style={[s.icon, { color: borderColor }]}>{icon}</Text>
      <Text style={s.msg}>{msg}</Text>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  container: {
    position: 'absolute', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: '#000', shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
    elevation: 12, zIndex: 999,
    minWidth: 180, maxWidth: 300,
  },
  icon: { fontSize: 13, fontFamily: 'JetBrainsMono_400Regular' },
  msg:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text, flex: 1 },
});
