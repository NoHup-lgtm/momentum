'use client'

import { useState } from 'react'
import SpiralIcon from '../SpiralIcon'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'already'>('idle')

  const submit = async () => {
    if (!email.includes('@')) return
    setState('loading')
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setState(data.already ? 'already' : 'done')
  }

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
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.05, pointerEvents: 'none', userSelect: 'none',
      }}>
        <SpiralIcon size={720} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, var(--bg) 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
        <div style={{ marginBottom: '28px', display: 'inline-block' }}>
          <SpiralIcon size={50} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '22px',
          opacity: 0.85,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          App desktop para devs · em desenvolvimento
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(40px, 5.8vw, 72px)',
          fontWeight: '400', lineHeight: '1.1',
          color: 'var(--text)', margin: '0 0 22px',
          letterSpacing: '-0.02em',
        }}>
          Feito de dias<br />imperfeitos.
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 1.9vw, 19px)',
          lineHeight: '1.65', color: 'var(--text-2)',
          margin: '0 auto 44px', maxWidth: '480px',
        }}>
          O app desktop que mantém seus projetos vivos quando a motivação some. Agentes de IA que entendem o seu ritmo de dev.
        </p>

        {state === 'done' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 28px', borderRadius: '6px',
            background: 'rgba(90,122,80,0.12)', border: '1px solid rgba(90,122,80,0.3)',
          }}>
            <span style={{ color: 'var(--success)', fontSize: '16px' }}>✓</span>
            <span style={{ fontSize: '15px', color: 'var(--text-2)' }}>
              Você está na lista. Avisaremos quando lançar.
            </span>
          </div>
        ) : state === 'already' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 28px', borderRadius: '6px',
            background: 'var(--surface)', border: '1px solid var(--surface-2)',
          }}>
            <span style={{ fontSize: '15px', color: 'var(--text-2)' }}>
              Esse email já está na lista.
            </span>
          </div>
        ) : (
          <div id="waitlist" style={{
            display: 'flex', gap: '8px', justifyContent: 'center',
            flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto',
          }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="seu@email.com"
              style={{
                flex: 1, minWidth: '220px',
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
                cursor: state === 'loading' ? 'wait' : 'pointer',
                opacity: !email.includes('@') ? 0.5 : 1,
                transition: 'opacity 0.18s', whiteSpace: 'nowrap',
              }}
            >
              {state === 'loading' ? 'Entrando...' : 'Entrar na lista →'}
            </button>
          </div>
        )}

        <p style={{
          marginTop: '16px',
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-3)', letterSpacing: '0.03em',
        }}>
          Sem spam. Avisamos só quando o app estiver pronto.
        </p>

        <div style={{
          marginTop: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
        }}>
          <a
            href="https://github.com/NoHup-lgtm/momentum"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              fontSize: '13px', color: 'var(--text-3)',
              fontFamily: 'var(--font-mono)', textDecoration: 'none',
              transition: 'color 0.18s',
            }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = 'var(--text-2)')}
            onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = 'var(--text-3)')}
          >
            <GitHubIcon size={13} /> Star no GitHub.
          </a>
          <span style={{ color: 'var(--surface-2)', fontSize: '12px' }}>·</span>
          <span style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            macOS · Windows · Linux
          </span>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '36px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        opacity: 0.3,
      }}>
        <div style={{ width: '1px', height: '44px', background: 'linear-gradient(to bottom, transparent, var(--text-3))' }} />
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-3)' }} />
      </div>
    </section>
  )
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
