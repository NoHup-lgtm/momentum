'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { content, type Lang } from './content'

// Idioma vem da ROTA (/ = pt, /en = en) → renderizado no servidor (bom p/ SEO).
// O default 'pt' cobre a rota raiz sem precisar de provider.
const LangContext = createContext<Lang>('pt')

export function LangProvider({
  initialLang = 'pt',
  children,
}: {
  initialLang?: Lang
  children: ReactNode
}) {
  return <LangContext.Provider value={initialLang}>{children}</LangContext.Provider>
}

export function useLang(): Lang {
  return useContext(LangContext)
}

// Conteúdo traduzido do idioma atual.
export function useT() {
  return content[useContext(LangContext)]
}
