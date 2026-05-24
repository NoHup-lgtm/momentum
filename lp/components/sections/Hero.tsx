'use client'

import { signIn } from 'next-auth/react'
import SpiralIcon from '../SpiralIcon'

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'var(--bg)',
      padding: '120px clamp(20px, 6vw, 80px) 80px',
      textAlign: 'center',
    }}>
      {/* Watermark spiral */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.05, pointerEvents: 'none', userSelect: 'none',
      }}>
        <SpiralIcon size={720} />
      </div>

      {/* Radial gradient to fade watermark edges */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, var(--bg) 100%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '660px' }}>
        <div style={{ marginBottom: '28px', display: 'inline-block' }}>
          <SpiralIcon size={50} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(38px, 5.5vw, 68px)',
          fontWeight: '400', lineHeight: '1.14',
          color: 'var(--text)', margin: '0 0 20px',
          letterSpacing: '-0.015em',
        }}>
          Feito de dias<br />imperfeitos.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 1.8vw, 18px)',
          lineHeight: '1.65', color: 'var(--text-2)',
          margin: '0 auto 40px', maxWidth: '440px',
        }}>
          Um co-piloto com IA para devs e estudantes que não conseguem terminar o que começaram.
        </p>

        <div style={{
          display: 'flex', gap: '10px',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <HeroBtn onClick={() => signIn('github', { callbackUrl: '/dashboard' })}>
            <GitHubIcon /> Entrar com GitHub
          </HeroBtn>
          <HeroBtn variant="outline" onClick={() => signIn('github', { callbackUrl: '/dashboard' })}>
            Começar grátis
          </HeroBtn>
        </div>

        <p style={{
          marginTop: '18px',
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-3)', letterSpacing: '0.03em',
        }}>
          Sem cartão de crédito · Plano grátis disponível
        </p>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '36px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        opacity: 0.35,
      }}>
        <div style={{
          width: '1px', height: '44px',
          background: 'linear-gradient(to bottom, transparent, var(--text-3))',
        }} />
        <div style={{
          width: '4px', height: '4px', borderRadius: '50%',
          background: 'var(--text-3)',
        }} />
      </div>
    </section>
  )
}

function HeroBtn({ children, variant = 'primary', onClick }: {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  onClick?: () => void
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '13px 28px', borderRadius: '5px',
    fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '450',
    cursor: 'pointer', letterSpacing: '0.01em',
    transition: 'opacity 0.18s ease', whiteSpace: 'nowrap',
    textDecoration: 'none', border: 'none',
  }
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#f2e4cf' },
    outline:  { background: 'transparent', color: 'var(--text)', border: '1px solid var(--text-3)' },
  }
  return (
    <button onClick={onClick} style={{ ...base, ...styles[variant] }}>
      {children}
    </button>
  )
}

function GitHubIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
