'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SpiralIcon from '@/components/SpiralIcon'

interface Milestone {
  title: string
  description?: string
  estimated_days: number
  tasks: string[]
}

interface Project {
  project_name: string
  milestones: Milestone[]
  created_at: number
  guest: boolean
  _taskState?: boolean[][]
}

export default function DashboardPage() {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [activeMs, setActiveMs] = useState(0)
  const [taskState, setTaskState] = useState<boolean[][]>([])
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('momentum_draft_project')
    if (!raw) { router.push('/'); return }
    const p: Project = JSON.parse(raw)
    setProject(p)
    const saved = p._taskState as boolean[][] | undefined
    setTaskState(saved ?? p.milestones.map(m => m.tasks.map(() => false)))
  }, [])

  if (!project) return null

  const ms = project.milestones
  const current = ms[activeMs]
  const currentTasks = taskState[activeMs] ?? []
  const doneCount = currentTasks.filter(Boolean).length
  const pct = current.tasks.length > 0 ? (doneCount / current.tasks.length) * 100 : 0

  const toggleTask = (mi: number, ti: number) => {
    const next = taskState.map((row, i) =>
      i === mi ? row.map((v, j) => (j === ti ? !v : v)) : row
    )
    setTaskState(next)
    const raw = localStorage.getItem('momentum_draft_project')
    if (raw) {
      const p = JSON.parse(raw)
      p._taskState = next
      localStorage.setItem('momentum_draft_project', JSON.stringify(p))
    }
  }

  const totalDone = taskState.flat().filter(Boolean).length
  const totalTasks = ms.reduce((a, m) => a + m.tasks.length, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Nav ── */}
      <nav style={{
        height: '52px', flexShrink: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', borderBottom: '1px solid var(--surface-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SpiralIcon size={18} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--text-2)', letterSpacing: '0.02em' }}>momentum</span>
          <span style={{ color: 'var(--surface-2)', fontSize: '18px', fontWeight: 300 }}>/</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text)' }}>{project.project_name}</span>
          <GuestBadge />
        </div>
        <button
          onClick={() => setShowSignup(true)}
          style={{
            fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '450',
            color: '#f2e4cf', background: 'var(--accent)',
            border: 'none', borderRadius: '5px',
            padding: '7px 16px', cursor: 'pointer',
          }}
        >Criar conta</button>
      </nav>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{
          width: '232px', flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--surface-2)',
          display: 'flex', flexDirection: 'column',
          overflow: 'auto',
        }}>
          {/* Project info */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--surface-2)' }}>
            <div style={LABEL_STYLE}>projeto</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14.5px', color: 'var(--text)', marginBottom: '8px' }}>{project.project_name}</div>
            <ProgressBar pct={(totalDone / totalTasks) * 100} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-3)', marginTop: '5px' }}>
              {totalDone}/{totalTasks} tarefas · {ms.length} milestones
            </div>
          </div>

          {/* Milestones */}
          <div style={{ padding: '14px 0', flex: 1 }}>
            <div style={{ ...LABEL_STYLE, padding: '0 16px', marginBottom: '6px' }}>milestones</div>
            {ms.map((m, i) => {
              const done = taskState[i]?.filter(Boolean).length ?? 0
              const total = m.tasks.length
              const active = i === activeMs
              return (
                <button key={i} onClick={() => setActiveMs(i)} style={{
                  width: '100%', textAlign: 'left', border: 'none',
                  borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  padding: '9px 16px', cursor: 'pointer',
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  background: active ? 'rgba(212,103,58,0.07)' : 'transparent',
                  transition: 'background 0.12s',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: active ? 'var(--accent)' : 'var(--text-3)', marginTop: '3px', flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', color: active ? 'var(--text)' : 'var(--text-2)', lineHeight: '1.35', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: done === total && total > 0 ? 'var(--success)' : 'var(--text-3)' }}>{done}/{total}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Agents */}
          <div style={{ borderTop: '1px solid var(--surface-2)', padding: '14px 0' }}>
            <div style={{ ...LABEL_STYLE, padding: '0 16px', marginBottom: '6px' }}>agentes</div>
            {AGENTS.map((a, i) => (
              <div key={a.name} onClick={i > 0 ? () => setShowSignup(true) : undefined} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', opacity: i === 0 ? 1 : 0.45,
                cursor: i > 0 ? 'pointer' : 'default',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? 'var(--success)' : 'var(--surface-2)',
                  border: i === 0 ? 'none' : '1px solid var(--text-3)',
                }} />
                <div>
                  <div style={{ fontSize: '12px', color: i === 0 ? 'var(--text-2)' : 'var(--text-3)' }}>{a.name}</div>
                  {i > 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', marginTop: '1px' }}>conta necessária</div>}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflow: 'auto', padding: '36px 48px', maxWidth: '760px' }}>

          {/* Milestone header */}
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              milestone {String(activeMs + 1).padStart(2, '0')}
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 2.5vw, 32px)',
            fontWeight: '400', color: 'var(--text)', margin: '4px 0 10px',
          }}>{current.title}</h1>
          <div style={{ display: 'flex', gap: '18px', marginBottom: '24px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)' }}>~{current.estimated_days} dias</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)' }}>{doneCount}/{current.tasks.length} tarefas</span>
          </div>

          {/* Progress */}
          <div style={{ height: '2px', background: 'var(--surface-2)', borderRadius: '1px', marginBottom: '32px' }}>
            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '1px', width: `${pct}%`, transition: 'width 0.4s ease' }} />
          </div>

          {/* Tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '52px' }}>
            {current.tasks.map((task, ti) => (
              <label key={ti} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  onClick={() => toggleTask(activeMs, ti)}
                  style={{
                    width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0,
                    border: `1.5px solid ${currentTasks[ti] ? 'var(--accent)' : 'var(--text-3)'}`,
                    background: currentTasks[ti] ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '2px', transition: 'all 0.15s', cursor: 'pointer',
                  }}
                >
                  {currentTasks[ti] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#f2e4cf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{
                  fontSize: '14px', lineHeight: '1.6', userSelect: 'none',
                  color: currentTasks[ti] ? 'var(--text-3)' : 'var(--text-2)',
                  textDecoration: currentTasks[ti] ? 'line-through' : 'none',
                  transition: 'color 0.15s',
                }}>{task}</span>
              </label>
            ))}
          </div>

          {/* Agents panel (locked) */}
          <div style={{
            background: 'var(--surface)', borderRadius: '8px',
            border: '1px solid var(--surface-2)', padding: '28px 24px',
          }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: '400', color: 'var(--text)', margin: '0 0 5px' }}>Agentes</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-3)', margin: 0, lineHeight: '1.5' }}>
                  Crie uma conta para ativar o check-in diário, re-onboarding e desbloqueador.
                </p>
              </div>
              <button onClick={() => setShowSignup(true)} style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                color: 'var(--accent)', background: 'rgba(212,103,58,0.1)',
                border: '1px solid rgba(212,103,58,0.2)',
                borderRadius: '4px', padding: '6px 12px',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '16px',
                letterSpacing: '0.05em',
              }}>Desbloquear →</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              {AGENTS.slice(1).map(a => (
                <div key={a.name} onClick={() => setShowSignup(true)} style={{
                  background: 'var(--bg)', border: '1px dashed var(--surface-2)',
                  borderRadius: '6px', padding: '16px 14px', cursor: 'pointer',
                  opacity: 0.55, transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
                >
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>{a.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{a.role}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ── Guest banner ── */}
      <div style={{
        flexShrink: 0, background: 'var(--surface)',
        borderTop: '1px solid var(--surface-2)',
        padding: '11px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>
            Projeto salvo só neste navegador.{' '}
            <span style={{ color: 'var(--text-3)' }}>Feche a aba e você perde.</span>
          </span>
        </div>
        <button
          onClick={() => setShowSignup(true)}
          style={{
            fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '450',
            color: '#f2e4cf', background: 'var(--accent)',
            border: 'none', borderRadius: '5px',
            padding: '8px 18px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >Salvar permanentemente →</button>
      </div>

      {/* ── Signup modal ── */}
      {showSignup && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowSignup(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: 'rgba(8,5,2,0.88)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--surface-2)',
            borderRadius: '12px', width: '100%', maxWidth: '370px',
            padding: '36px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <SpiralIcon size={34} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', fontWeight: '400', color: 'var(--text)', margin: '0 0 8px' }}>
              Salvar "{project.project_name}"
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: '1.65', margin: '0 auto 28px', maxWidth: '270px' }}>
              Crie uma conta para salvar o projeto, conectar o GitHub e desbloquear os agentes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <button style={{
                width: '100%', padding: '12px 20px', borderRadius: '5px', border: 'none',
                background: 'var(--accent)', color: '#f2e4cf',
                fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '450',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <GitHubIcon size={14} /> Entrar com GitHub
              </button>
              <button style={{
                width: '100%', padding: '12px 20px', borderRadius: '5px',
                background: 'transparent', color: 'var(--text)',
                border: '1px solid var(--text-3)',
                fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer',
              }}>
                Entrar com Google
              </button>
              <button onClick={() => setShowSignup(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: 'var(--text-3)', marginTop: '4px',
                fontFamily: 'var(--font-sans)',
              }}>continuar sem conta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '9px',
  letterSpacing: '0.12em', textTransform: 'uppercase',
  color: 'var(--text-3)',
}

const AGENTS = [
  { name: 'Arquiteto', role: 'planejamento' },
  { name: 'Accountability', role: 'rotina diária' },
  { name: 'Re-onboarding', role: 'retomada' },
  { name: 'Desbloqueador', role: 'superação' },
]

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: '2px', background: 'var(--surface-2)', borderRadius: '1px' }}>
      <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '1px', width: `${pct}%`, transition: 'width 0.4s ease' }} />
    </div>
  )
}

function GuestBadge() {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '9px',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'var(--text-3)', background: 'var(--surface-2)',
      padding: '3px 8px', borderRadius: '3px',
    }}>guest</span>
  )
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.235 1.905 1.235 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
