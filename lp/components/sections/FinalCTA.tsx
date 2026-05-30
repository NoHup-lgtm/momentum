'use client'

import { useState } from 'react'
import FadeIn from '../FadeIn'
import SpiralIcon from '../SpiralIcon'

export default function FinalCTASection() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const submit = async () => {
    if (!email.includes('@')) return
    setState('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'finalcta' }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <SpiralIcon size={40} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', color: 'var(--text)',
            margin: '0 0 16px', lineHeight: '1.18',
          }}>Você não é o problema.<br />O processo é.</h2>
          <p style={{
            fontSize: '15px', color: 'var(--text-2)',
            lineHeight: '1.65', margin: '0 auto 36px', maxWidth: '420px',
          }}>
            Entre na lista de espera e seja avisado quando o app estiver pronto para download.
          </p>

          {state === 'done' ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 28px', borderRadius: '6px',
              background: 'rgba(90,122,80,0.12)', border: '1px solid rgba(90,122,80,0.3)',
            }}>
              <span style={{ color: 'var(--success)' }}>✓</span>
              <span style={{ fontSize: '15px', color: 'var(--text-2)' }}>Você está na lista.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="seu@email.com"
                style={{
                  flex: 1, minWidth: '200px', maxWidth: '280px',
                  background: 'var(--surface)', border: '1px solid var(--surface-2)',
                  borderRadius: '6px', padding: '13px 18px',
                  color: 'var(--text)', fontFamily: 'var(--font-sans)',
                  fontSize: '15px', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--surface-2)')}
              />
              <button
                onClick={submit}
                disabled={state === 'loading' || !email.includes('@')}
                style={{
                  padding: '13px 28px', borderRadius: '6px', border: 'none',
                  background: 'var(--accent)', color: '#f2e4cf',
                  fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '450',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  opacity: !email.includes('@') ? 0.5 : 1,
                  transition: 'opacity 0.18s',
                }}
              >{state === 'loading' ? '...' : 'Entrar na lista →'}</button>
            </div>
          )}
          {state === 'error' && (
            <p style={{
              marginTop: '14px', fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--danger)',
            }}>Algo deu errado. Tenta de novo em instantes.</p>
          )}
        </FadeIn>

        <FadeIn delay={200} style={{ marginTop: '72px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-3)', letterSpacing: '0.06em',
          }}>momentum · feito de dias imperfeitos.</p>
        </FadeIn>
      </div>
    </section>
  )
}
