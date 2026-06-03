import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ── Plan types ────────────────────────────────────────────────────────────────
export type PlanType = 'free' | 'pro' | 'max';
export type ThemeMode = 'dark' | 'light';

// ── Color palette shape (matches C from design.ts) ────────────────────────────
export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  accent: string;
  accentGlow: string;
  text: string;
  text2: string;
  text3: string;
  success: string;
  danger: string;
  gold: string;
  purple: string;
  silver: string;
  bronze: string;
}

// ── Semantic colors (iguais em claro/escuro) ──────────────────────────────────
const SEMANTIC = {
  success: '#5a7a50',
  danger:  '#c0392b',
  gold:    '#c08a00',
  purple:  '#8b5cf6',
  silver:  '#9aa0a8',
  bronze:  '#cd7f32',
};

// ── Base por modo (fundo/superfícies/texto) ───────────────────────────────────
// Claro = paleta da marca: Pergaminho/Creme/Sépia/Tinta/Poeira.
const MODE_BASE: Record<ThemeMode, Pick<ThemeColors, 'bg' | 'surface' | 'surface2' | 'text' | 'text2' | 'text3'>> = {
  dark: {
    bg:       '#140e08',
    surface:  '#1c1410',
    surface2: '#2a1f17',
    text:     '#f2e4cf',
    text2:    '#b8a898',
    text3:    '#7a6a5a',
  },
  light: {
    bg:       '#faf5ec', // Pergaminho
    surface:  '#ede4d2', // Creme
    surface2: '#ddcfb6', // Creme escuro (bordas)
    text:     '#1a1008', // Tinta
    text2:    '#6a543c', // Sépia suave
    text3:    '#9a876c', // Poeira
  },
};

// ── Accent por plano (cor de destaque) ────────────────────────────────────────
const PLAN_ACCENT: Record<PlanType, Pick<ThemeColors, 'accent' | 'accentGlow'>> = {
  free: { accent: '#d4673a', accentGlow: 'rgba(212,103,58,0.35)' },
  pro:  { accent: '#4a9eff', accentGlow: 'rgba(74,158,255,0.35)' },
  max:  { accent: '#a370ff', accentGlow: 'rgba(163,112,255,0.38)' },
};

function buildColors(mode: ThemeMode, plan: PlanType): ThemeColors {
  return { ...SEMANTIC, ...MODE_BASE[mode], ...PLAN_ACCENT[plan] };
}

// Compat: alguns lugares importavam THEMES (mapa por plano, modo escuro).
export const THEMES: Record<PlanType, ThemeColors> = {
  free: buildColors('dark', 'free'),
  pro:  buildColors('dark', 'pro'),
  max:  buildColors('dark', 'max'),
};

// ── Plan display metadata ──────────────────────────────────────────────────────
export const PLAN_META: Record<PlanType, { label: string; badge: string; color: string }> = {
  free: { label: 'Gratuito', badge: 'FREE', color: '#7a6a5a' },
  pro:  { label: 'Pro',      badge: 'PRO',  color: '#4a9eff' },
  max:  { label: 'Max',      badge: 'MAX',  color: '#a370ff' },
};

// ── Context ────────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  plan: PlanType;
  mode: ThemeMode;
  colors: ThemeColors;
  setPlan: (plan: PlanType) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  activationProgress: Animated.Value;
}

const MODE_KEY = 'momentum.theme_mode';

const ThemeContext = createContext<ThemeContextValue>({
  plan: 'free',
  mode: 'dark',
  colors: buildColors('dark', 'free'),
  setPlan: () => {},
  setMode: () => {},
  toggleMode: () => {},
  activationProgress: new Animated.Value(0),
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = useState<PlanType>('free');
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const activationProgress = useRef(new Animated.Value(0)).current;

  // Carrega o modo persistido no boot.
  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(MODE_KEY);
      if (saved === 'light' || saved === 'dark') setModeState(saved);
    })();
  }, []);

  const setPlan = (newPlan: PlanType) => {
    if (newPlan === plan) return;
    activationProgress.setValue(0);
    Animated.sequence([
      Animated.timing(activationProgress, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(activationProgress, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    setPlanState(newPlan);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    SecureStore.setItemAsync(MODE_KEY, newMode).catch(() => {});
  };
  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider
      value={{ plan, mode, colors: buildColors(mode, plan), setPlan, setMode, toggleMode, activationProgress }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useTheme = () => useContext(ThemeContext);
