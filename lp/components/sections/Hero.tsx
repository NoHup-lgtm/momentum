'use client'

import { useState } from 'react'
import SpiralIcon from '../SpiralIcon'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'already' | 'error'>('idle')

  const submit = async () => {
    if (!email.includes('@')) return
    setState('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'hero' }),
      })
      if (!res.ok) { setState('error'); return }
      const data = await res.json()
      setState(data.already ? 'already' : 'done')
    } catch {
      setState('error')
    }
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
      {/* Background spiral */}
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
          color: 'var(--accent)', marginBottom: '22px', opacity: 0.85,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          App mobile para devs · em desenvolvimento
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
          Cada commit que você faz vira streak, XP e rank. Compita com sua squad. Não quebre a ofensiva.
        </p>

        {/* Streak preview badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '24px', marginBottom: '40px', flexWrap: 'wrap',
        }}>
          {[
            { label: '🔥', value: '23', sub: 'dias de ofensiva' },
            { label: '⚡', value: '1.4k', sub: 'XP esta semana' },
            { label: '🏆', value: '#2', sub: 'na sua squad' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--surface-2)',
              borderRadius: '8px', padding: '14px 20px', textAlign: 'center',
              minWidth: '100px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '20px',
                color: 'var(--accent)', lineHeight: 1,
              }}>{stat.label} {stat.value}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--text-3)', marginTop: '5px',
              }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Waitlist form */}
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
                fontSize: '15px', outline: 'none', transition: 'border-color 0.2s',
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
          marginTop: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: state === 'error' ? 'var(--danger)' : 'var(--text-3)', letterSpacing: '0.03em',
        }}>
          {state === 'error' ? 'Algo deu errado. Tenta de novo em instantes.' : 'iOS · Android · sem spam.'}
        </p>
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
