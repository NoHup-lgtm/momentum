import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'momentum — Feito de dias imperfeitos.',
  description: 'O app desktop que mantém seus projetos de software vivos quando a motivação some. Agentes de IA que entendem o seu ritmo.',
  openGraph: {
    title: 'momentum',
    description: 'Feito de dias imperfeitos.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={lora.variable}>
      <body>{children}</body>
    </html>
  )
}
