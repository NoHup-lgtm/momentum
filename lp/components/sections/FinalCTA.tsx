'use client'

import { signIn } from 'next-auth/react'
import FadeIn from '../FadeIn'
import SpiralIcon from '../SpiralIcon'

export default function FinalCTASection() {
  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <SpiralIcon size={40} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', color: 'var(--text)',
            margin: '0 0 16px', lineHeight: '1.18',
          }}>O primeiro passo<br />é um plano.</h2>
          <p style={{
            fontSize: '15px', color: 'var(--text-2)',
            lineHeight: '1.65', margin: '0 auto 36px', maxWidth: '400px',
          }}>
            Entre com GitHub, conecte seu repositório e deixe o Agente Arquiteto estruturar seu projeto em milestones concretos.
          </p>
          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              padding: '14px 32px', borderRadius: '5px', border: 'none',
              background: 'var(--accent)', color: '#f2e4cf',
              fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '450',
              cursor: 'pointer', letterSpacing: '0.01em',
              transition: 'opacity 0.18s ease',
            }}
          >
            <GitHubIcon /> Começar com GitHub
          </button>
          <p style={{
            marginTop: '14px',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-3)', letterSpacing: '0.03em',
          }}>
            Sem cartão de crédito · Plano grátis disponível
          </p>
        </FadeIn>

        <FadeIn delay={200} style={{ marginTop: '64px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-3)', letterSpacing: '0.06em',
          }}>momentum · feito de dias imperfeitos.</p>
        </FadeIn>
      </div>
    </section>
  )
}

function GitHubIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
