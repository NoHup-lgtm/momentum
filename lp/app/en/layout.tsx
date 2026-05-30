import type { Metadata } from 'next'
import { LangProvider } from '@/lib/i18n'

const DESCRIPTION =
  'Mobile app for devs: every commit turns into a streak, XP and rank. Compete with your squad. Don’t break the streak.'

export const metadata: Metadata = {
  title: 'momentum — Built from imperfect days.',
  description: DESCRIPTION,
  alternates: { canonical: '/en' },
  openGraph: {
    title: 'momentum — Built from imperfect days.',
    description: DESCRIPTION,
    url: 'https://momentu.me/en',
    siteName: 'momentum',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'momentum — Built from imperfect days.',
    description: DESCRIPTION,
  },
}

// Subárvore /en renderiza em inglês no servidor (SSR/SSG → bom p/ SEO).
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <LangProvider initialLang="en">{children}</LangProvider>
}
