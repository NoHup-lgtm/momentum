import { create } from 'zustand';
import type { RankId } from '../constants/design';

export interface User {
  id: string;
  githubLogin: string;
  displayName: string;
  avatarUrl: string;
  avatarVariant: number;
  rank: RankId;
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  maxStreak: number;
  coins: number;
  gems: number;
  streakFreezes: number;
  isPro: boolean;
  committedToday: boolean;
}

export interface EquippedMap {
  HAT?: string;
  SHIRT?: string;
  GLASSES?: string;
  ACCESSORY?: string;
  BACKGROUND?: string;
}

interface AppState {
  user: User | null;
  equipped: EquippedMap | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setEquipped: (equipped: EquippedMap | null) => void;
  setLoading: (v: boolean) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  equipped: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setEquipped: (equipped) => set({ equipped }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, equipped: null }),
}));
