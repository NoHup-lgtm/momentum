'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { content, type Lang } from './content'

const STORAGE_KEY = 'momentum.lang'

type Ctx = { lang: Lang; setLang: (l: Lang) => void }
const LangContext = createContext<Ctx>({ lang: 'pt', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  // SSR renderiza em pt; no cliente ajusta por localStorage/idioma do browser.
  const [lang, setLangState] = useState<Lang>('pt')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'pt' || saved === 'en') {
        setLangState(saved)
        return
      }
    } catch {
      /* localStorage indisponível */
    }
    const isPt = navigator.language?.toLowerCase().startsWith('pt')
    setLangState(isPt ? 'pt' : 'en')
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// Conteúdo traduzido do idioma atual.
export function useT() {
  const { lang } = useContext(LangContext)
  return content[lang]
}
