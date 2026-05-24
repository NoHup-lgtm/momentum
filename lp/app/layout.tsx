import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'momentum — Feito de dias imperfeitos.',
  description:
    'Co-piloto de projetos com IA para devs e estudantes que não conseguem terminar o que começaram.',
  openGraph: {
    title: 'momentum',
    description: 'Feito de dias imperfeitos.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={lora.variable}>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
