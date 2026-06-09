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
  weekXp: number;
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
  // Preview de perfil: userId aberto no bottom-sheet (null = fechado).
  previewUserId: string | null;
  setUser: (user: User) => void;
  setEquipped: (equipped: EquippedMap | null) => void;
  setLoading: (v: boolean) => void;
  clearUser: () => void;
  openProfilePreview: (userId: string) => void;
  closeProfilePreview: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  equipped: null,
  isLoading: true,
  previewUserId: null,
  setUser: (user) => set({ user }),
  setEquipped: (equipped) => set({ equipped }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, equipped: null }),
  openProfilePreview: (userId) => set({ previewUserId: userId }),
  closeProfilePreview: () => set({ previewUserId: null }),
}));
