import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})

const DESCRIPTION =
  'App mobile para devs: cada commit vira streak, XP e rank. Compita com sua squad. Não quebre a ofensiva.'

export const metadata: Metadata = {
  metadataBase: new URL('https://momentu.me'),
  title: 'momentum — Feito de dias imperfeitos.',
  description: DESCRIPTION,
  keywords: ['momentum', 'devs', 'github', 'streak', 'gamificação', 'commits', 'app mobile'],
  openGraph: {
    title: 'momentum — Feito de dias imperfeitos.',
    description: DESCRIPTION,
    url: 'https://momentu.me',
    siteName: 'momentum',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'momentum — Feito de dias imperfeitos.',
    description: DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={lora.variable}>
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  )
}
