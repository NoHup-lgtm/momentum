import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { strings, type Lang } from './strings';

const KEY = 'momentum.lang';

// Detecta o idioma do device via Intl (Hermes) — sem dependência nativa.
function detectLang(): Lang {
  try {
    const loc = new Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    return loc.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  } catch {
    return 'pt';
  }
}

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  loadLang: () => Promise<void>;
}

export const useLangStore = create<LangState>((set) => ({
  lang: detectLang(),
  setLang: (lang) => {
    set({ lang });
    SecureStore.setItemAsync(KEY, lang).catch(() => {});
  },
  // Carrega a preferência salva no boot (sobrepõe a detecção do device).
  loadLang: async () => {
    try {
      const saved = await SecureStore.getItemAsync(KEY);
      if (saved === 'pt' || saved === 'en') set({ lang: saved });
    } catch {
      /* ignore */
    }
  },
}));

export const useT = () => strings[useLangStore((s) => s.lang)];
export const useLang = () => useLangStore((s) => s.lang);
export const useSetLang = () => useLangStore((s) => s.setLang);
