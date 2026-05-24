'use client'

import { useState, useEffect, useRef } from 'react'
import SpiralIcon from './SpiralIcon'

interface Milestone {
  title: string
  description?: string
  estimated_days: number
  tasks: string[]
}

interface Plan {
  project_name: string
  milestones: Milestone[]
}

export default function ProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'input' | 'loading' | 'result' | 'signup'>('input')
  const [desc, setDesc] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && step === 'input') {
      setTimeout(() => textRef.current?.focus(), 120)
    }
  }, [isOpen, step])

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const handleClose = () => {
    onClose()
    setTimeout(() => { setStep('input'); setDesc(''); setPlan(null); setError(null) }, 320)
  }

  const generate = async () => {
    if (desc.trim().length < 20) {
      setError('Descreva um pouco mais o projeto para o Arquiteto trabalhar.')
      return
    }
    setError(null)
    setStep('loading')
    try {
      const res = await fetch('/api/arquiteto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc.trim() }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan(data)
      setStep('result')
    } catch {
      setError('Não foi possível gerar o plano. Tente novamente.')
      setStep('input')
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(8,5,2,0.88)', backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }} />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface)', border: '1px solid var(--surface-2)',
        borderRadius: '12px', width: '100%', maxWidth: '560px',
        maxHeight: '88vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
      }}>
        {/* Sticky header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--surface-2)',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <SpiralIcon size={20} />
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '14px',
              color: 'var(--text)', fontWeight: '400', letterSpacing: '0.01em',
            }}>Agente Arquiteto</span>
            {step !== 'input' && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {step === 'loading' ? '· processando' : step === 'result' ? '· plano gerado' : '· salvar plano'}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', padding: '4px 8px',
              fontSize: '20px', lineHeight: 1, borderRadius: '4px',
              transition: 'color 0.15s', fontFamily: 'var(--font-sans)',
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '26px 22px' }}>
          {step === 'input'   && <InputStep desc={desc} setDesc={setDesc} error={error} onGenerate={generate} textRef={textRef} />}
          {step === 'loading' && <LoadingStep />}
          {step === 'result'  && plan && <ResultStep plan={plan} onContinue={() => setStep('signup')} onBack={() => setStep('input')} />}
          {step === 'signup'  && <SignupStep name={plan?.project_name} onClose={handleClose} />}
        </div>
      </div>
    </div>
  )
}

// ── Input step ────────────────────────────────────────────────────────────────
function InputStep({ desc, setDesc, error, onGenerate, textRef }: {
  desc: string
  setDesc: (v: string) => void
  error: string | null
  onGenerate: () => void
  textRef: React.RefObject<HTMLTextAreaElement>
}) {
  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--font-serif)', fontSize: '21px',
        fontWeight: '400', color: 'var(--text)', margin: '0 0 7px',
      }}>Descreva seu projeto.</h3>
      <p style={{
        fontSize: '13.5px', color: 'var(--text-2)',
        margin: '0 0 20px', lineHeight: '1.6',
      }}>
        Em linguagem natural. O Arquiteto vai estruturar em milestones concretos.
      </p>
      <textarea
        ref={textRef}
        value={desc}
        onChange={e => setDesc(e.target.value)}
        rows={5}
        placeholder="Ex: quero construir um app de controle de gastos pessoais para iOS, com categorias, gráficos mensais e exportação em CSV. Tenho experiência com React Native mas nunca publiquei na App Store."
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--surface-2)', border: '1px solid transparent',
          borderRadius: '6px', padding: '13px 15px',
          color: 'var(--text)', fontFamily: 'var(--font-sans)',
          fontSize: '14px', lineHeight: '1.65', resize: 'vertical',
          outline: 'none', transition: 'border-color 0.2s',
          minHeight: '120px',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'transparent')}
      />
      {error && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--error)', margin: '8px 0 0',
        }}>{error}</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
        <ModalBtn onClick={onGenerate} disabled={desc.trim().length < 20}>
          Gerar plano com IA →
        </ModalBtn>
      </div>
    </div>
  )
}

// ── Loading step ──────────────────────────────────────────────────────────────
function LoadingStep() {
  return (
    <div style={{ textAlign: 'center', padding: '36px 0' }}>
      <div style={{ display: 'inline-block', animation: 'spiral-rotate 3s linear infinite' }}>
        <SpiralIcon size={52} />
      </div>
      <p style={{
        marginTop: '22px', fontSize: '13px', color: 'var(--text-2)',
        fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
      }}>o arquiteto está estruturando seu plano...</p>
    </div>
  )
}

// ── Result step ───────────────────────────────────────────────────────────────
function ResultStep({ plan, onContinue, onBack }: {
  plan: Plan
  onContinue: () => void
  onBack: () => void
}) {
  const ms = plan.milestones || []
  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)', fontSize: '19px',
          fontWeight: '400', color: 'var(--text)', margin: '0 0 4px',
        }}>{plan.project_name}</h3>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-3)', margin: 0,
        }}>
          {ms.length} milestone{ms.length !== 1 ? 's' : ''} · gerado pelo Agente Arquiteto
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
        {ms.map((m, i) => (
          <div key={i} style={{
            background: 'var(--surface-2)', borderRadius: '6px', padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', marginBottom: '7px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                color: 'var(--accent)', opacity: 0.7, flexShrink: 0,
              }}>{String(i + 1).padStart(2, '0')}</span>
              <h4 style={{
                fontFamily: 'var(--font-serif)', fontSize: '14.5px',
                fontWeight: '400', color: 'var(--text)', margin: 0, flex: 1,
              }}>{m.title}</h4>
              {m.estimated_days > 0 && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--text-3)', flexShrink: 0,
                }}>~{m.estimated_days}d</span>
              )}
            </div>
            {(m.tasks || []).length > 0 && (
              <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
                {m.tasks.map((t, j) => (
                  <li key={j} style={{
                    fontSize: '12px', color: 'var(--text-2)',
                    lineHeight: '1.65', marginBottom: '2px',
                  }}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <ModalBtn variant="ghost" onClick={onBack}>← Ajustar</ModalBtn>
        <ModalBtn onClick={onContinue}>Salvar plano →</ModalBtn>
      </div>
    </div>
  )
}

// ── Signup step ───────────────────────────────────────────────────────────────
function SignupStep({ name, onClose }: { name?: string; onClose: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
        <SpiralIcon size={38} />
      </div>
      <h3 style={{
        fontFamily: 'var(--font-serif)', fontSize: '19px',
        fontWeight: '400', color: 'var(--text)', margin: '0 0 8px',
      }}>
        {name ? `"${name}" está pronto.` : 'Seu plano está pronto.'}
      </h3>
      <p style={{
        fontSize: '13.5px', color: 'var(--text-2)', lineHeight: '1.65',
        margin: '0 auto 26px', maxWidth: '340px',
      }}>
        Crie uma conta para salvar, conectar o GitHub e começar o acompanhamento.
      </p>
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '9px', maxWidth: '270px', margin: '0 auto',
      }}>
        <ModalBtn style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
          <GitHubIcon size={15} /> Entrar com GitHub
        </ModalBtn>
        <ModalBtn variant="outline" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
          Entrar com Google
        </ModalBtn>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12.5px', color: 'var(--text-3)', marginTop: '4px',
            fontFamily: 'var(--font-sans)', letterSpacing: '0.01em',
          }}
        >
          continuar sem conta
        </button>
      </div>
    </div>
  )
}

// ── Shared button ─────────────────────────────────────────────────────────────
function ModalBtn({ children, variant = 'primary', onClick, disabled, style }: {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', padding: '12px 24px', borderRadius: '5px',
    fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '450',
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
    transition: 'opacity 0.18s ease', letterSpacing: '0.01em',
    whiteSpace: 'nowrap', opacity: disabled ? 0.45 : 1,
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#f2e4cf' },
    outline: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--text-3)' },
    ghost:   { background: 'transparent', color: 'var(--text-2)', padding: '8px 12px' },
  }
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.235 1.905 1.235 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
