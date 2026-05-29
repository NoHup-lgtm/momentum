import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated } from 'react-native';

// ── Plan types ────────────────────────────────────────────────────────────────
export type PlanType = 'free' | 'pro' | 'max';

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

// ── Shared base (text, semantic colors unchanged across plans) ─────────────────
const BASE: Pick<ThemeColors, 'text' | 'text2' | 'text3' | 'success' | 'danger' | 'gold' | 'purple' | 'silver' | 'bronze'> = {
  text:    '#f2e4cf',
  text2:   '#b8a898',
  text3:   '#7a6a5a',
  success: '#5a7a50',
  danger:  '#c0392b',
  gold:    '#f0a500',
  purple:  '#8b5cf6',
  silver:  '#9aa0a8',
  bronze:  '#cd7f32',
};

// ── Three palettes ─────────────────────────────────────────────────────────────
export const THEMES: Record<PlanType, ThemeColors> = {
  // Free — warm amber/brown, the original Momentum look
  free: {
    ...BASE,
    bg:         '#140e08',
    surface:    '#1c1410',
    surface2:   '#2a1f17',
    accent:     '#d4673a',
    accentGlow: 'rgba(212,103,58,0.35)',
  },

  // Pro — cold deep blue, signals "professional" focus
  pro: {
    ...BASE,
    bg:         '#07111e',
    surface:    '#0e1c30',
    surface2:   '#152742',
    accent:     '#4a9eff',
    accentGlow: 'rgba(74,158,255,0.35)',
  },

  // Max — void purple, signals "elite" power user
  max: {
    ...BASE,
    bg:         '#0c0818',
    surface:    '#150e28',
    surface2:   '#1e1538',
    accent:     '#a370ff',
    accentGlow: 'rgba(163,112,255,0.38)',
  },
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
  colors: ThemeColors;
  setPlan: (plan: PlanType) => void;
  activationProgress: Animated.Value; // 0→1 flash on theme change
}

const ThemeContext = createContext<ThemeContextValue>({
  plan: 'free',
  colors: THEMES.free,
  setPlan: () => {},
  activationProgress: new Animated.Value(0),
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = useState<PlanType>('free');
  const activationProgress = useRef(new Animated.Value(0)).current;

  const setPlan = (newPlan: PlanType) => {
    if (newPlan === plan) return;
    // Flash animation on theme change
    activationProgress.setValue(0);
    Animated.sequence([
      Animated.timing(activationProgress, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(activationProgress, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    setPlanState(newPlan);
  };

  return (
    <ThemeContext.Provider value={{ plan, colors: THEMES[plan], setPlan, activationProgress }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useTheme = () => useContext(ThemeContext);
