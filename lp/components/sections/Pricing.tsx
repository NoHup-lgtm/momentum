'use client'

import { useState } from 'react'
import FadeIn from '../FadeIn'

const PLANS = [
  {
    name: 'Grátis',
    price: null,
    badge: null,
    desc: 'Para começar e entender o valor antes de qualquer compromisso.',
    features: [
      '1 projeto ativo',
      '1 repositório conectado',
      'Agente Arquiteto',
      'Agente Accountability',
      '20 check-ins por mês',
    ],
    cta: 'Entrar na lista de espera',
    primary: false,
  },
  {
    name: 'Pro',
    price: 39,
    badge: '14 dias grátis',
    desc: 'Para quem leva projetos a sério e quer terminar o que começou.',
    features: [
      'Projetos ilimitados',
      'Todos os repositórios',
      'Todos os 4 agentes',
      'Check-ins ilimitados',
      'Integração MCP com AI IDEs',
      'Analytics de produtividade',
    ],
    cta: 'Entrar na lista de espera',
    primary: true,
  },
]

export default function PricingSection() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [active, setActive] = useState<number | null>(null)

  const submit = async (i: number) => {
    setActive(i)
    if (!email.includes('@')) return
    await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSubmitted(true)
  }

  return (
    <section id="precos" style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>preços</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.01em',
          }}>Simples e transparente.</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: '1.65', margin: 0, maxWidth: '480px' }}>
            Comece grátis. Upgrade só quando sentir o valor.
          </p>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px', marginTop: '52px', maxWidth: '760px',
        }}>
          {PLANS.map((plan, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div style={{
                position: 'relative',
                background: plan.primary ? 'var(--surface)' : 'transparent',
                border: `1px solid ${plan.primary ? 'rgba(212,103,58,0.3)' : 'var(--surface-2)'}`,
                borderRadius: '10px', padding: '32px 28px',
                display: 'flex', flexDirection: 'column',
                height: '100%', boxSizing: 'border-box',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--accent)', background: 'rgba(212,103,58,0.12)',
                    padding: '4px 9px', borderRadius: '4px',
                  }}>{plan.badge}</div>
                )}

                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: plan.primary ? 'var(--accent)' : 'var(--text-3)',
                  marginBottom: '14px',
                }}>{plan.name}</div>

                <div style={{ marginBottom: '10px' }}>
                  {plan.price ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: '400', color: 'var(--text)', lineHeight: 1 }}>R${plan.price}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)' }}>/mês</span>
                    </div>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: '400', color: 'var(--text)', lineHeight: 1 }}>Grátis</span>
                  )}
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: '1.65', margin: '0 0 28px' }}>{plan.desc}</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13.5px', color: 'var(--text-2)', lineHeight: '1.5' }}>
                      <span style={{ color: 'var(--accent)', opacity: 0.7, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '2px' }}>·</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {submitted && active === i ? (
                  <div style={{
                    width: '100%', padding: '12px 20px', borderRadius: '5px', boxSizing: 'border-box',
                    background: 'rgba(90,122,80,0.1)', border: '1px solid rgba(90,122,80,0.25)',
                    textAlign: 'center', fontSize: '13px', color: 'var(--success)',
                    fontFamily: 'var(--font-mono)',
                  }}>✓ Na lista de espera</div>
                ) : (
                  <button
                    onClick={() => submit(i)}
                    style={{
                      width: '100%', padding: '12px 20px', borderRadius: '5px',
                      fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '450',
                      cursor: 'pointer', letterSpacing: '0.01em',
                      border: plan.primary ? 'none' : '1px solid var(--text-3)',
                      background: plan.primary ? 'var(--accent)' : 'transparent',
                      color: plan.primary ? '#f2e4cf' : 'var(--text)',
                      transition: 'opacity 0.18s ease',
                    }}
                  >{plan.cta}</button>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={220}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-3)', marginTop: '28px', lineHeight: '1.7',
          }}>
            Preços estimados — podem mudar antes do lançamento.
            <br />Estudantes e open-source: <span style={{ color: 'var(--text-2)' }}>50% de desconto</span> — entre em contato.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
