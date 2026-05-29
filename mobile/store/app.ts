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
  currentStreak: number;
  maxStreak: number;
  coins: number;
  gems: number;
  isPro: boolean;
  committedToday: boolean;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setLoading: (v: boolean) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null }),
}));
