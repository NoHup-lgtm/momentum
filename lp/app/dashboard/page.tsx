'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
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
  _connectedRepo?: string
}

interface Repo {
  id: number
  full_name: string
  name: string
  private: boolean
  language: string | null
  updated_at: string
}

const IS_PRO = false // toggle when billing is live

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [activeMs, setActiveMs] = useState(0)
  const [taskState, setTaskState] = useState<boolean[][]>([])
  const [showSignup, setShowSignup] = useState(false)
  const [repos, setRepos] = useState<Repo[]>([])
  const [reposLoading, setReposLoading] = useState(false)
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null)
  const [showRepoModal, setShowRepoModal] = useState(false)

  // Load project from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('momentum_draft_project')
    if (!raw && status !== 'loading') { router.push('/'); return }
    if (raw) {
      const p: Project = JSON.parse(raw)
      setProject(p)
      setConnectedRepo(p._connectedRepo ?? null)
      const saved = p._taskState as boolean[][] | undefined
      setTaskState(saved ?? p.milestones.map(m => m.tasks.map(() => false)))
    }
  }, [status])

  // Fetch GitHub repos when authenticated
  useEffect(() => {
    if (!session?.accessToken) return
    setReposLoading(true)
    fetch('/api/github/repos')
      .then(r => r.json())
      .then((data: Repo[]) => setRepos(Array.isArray(data) ? data : []))
      .catch(() => setRepos([]))
      .finally(() => setReposLoading(false))
  }, [session])

  if (!project) return null

  const ms = project.milestones
  const current = ms[activeMs]
  const currentTasks = taskState[activeMs] ?? []
  const doneCount = currentTasks.filter(Boolean).length
  const pct = current.tasks.length > 0 ? (doneCount / current.tasks.length) * 100 : 0
  const totalDone = taskState.flat().filter(Boolean).length
  const totalTasks = ms.reduce((a, m) => a + m.tasks.length, 0)
  const isAuthenticated = !!session

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

  const connectRepo = (repoName: string) => {
    if (!IS_PRO && connectedRepo && connectedRepo !== repoName) {
      // free plan: can only have 1 repo — prompt upgrade
      return
    }
    const newRepo = connectedRepo === repoName ? null : repoName
    setConnectedRepo(newRepo)
    const raw = localStorage.getItem('momentum_draft_project')
    if (raw) {
      const p = JSON.parse(raw)
      p._connectedRepo = newRepo
      localStorage.setItem('momentum_draft_project', JSON.stringify(p))
    }
    setShowRepoModal(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Nav ── */}
      <nav style={{
        height: '52px', flexShrink: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', borderBottom: '1px solid var(--surface-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SpiralIcon size={18} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--text-2)', letterSpacing: '0.02em' }}>momentum</span>
          </div>
          <span style={{ color: 'var(--surface-2)', fontSize: '18px', fontWeight: 300 }}>/</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text)' }}>{project.project_name}</span>
          {!isAuthenticated && <GuestBadge />}
        </div>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              {session.user?.name}
            </span>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Sair"
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  cursor: 'pointer', border: '1px solid var(--surface-2)',
                }}
              />
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowSignup(true)}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '450',
              color: '#f2e4cf', background: 'var(--accent)',
              border: 'none', borderRadius: '5px',
              padding: '7px 16px', cursor: 'pointer',
            }}
          >Criar conta</button>
        )}
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
            {AGENTS.map((a, i) => {
              const locked = !isAuthenticated && i > 0
              return (
                <div key={a.name} onClick={locked ? () => setShowSignup(true) : undefined} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', opacity: locked ? 0.45 : 1,
                  cursor: locked ? 'pointer' : 'default',
                }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? 'var(--success)' : locked ? 'var(--surface-2)' : 'var(--accent)',
                    border: (!locked && i > 0) ? 'none' : locked ? '1px solid var(--text-3)' : 'none',
                  }} />
                  <div>
                    <div style={{ fontSize: '12px', color: locked ? 'var(--text-3)' : 'var(--text-2)' }}>{a.name}</div>
                    {locked && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', marginTop: '1px' }}>conta necessária</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Repo */}
          {isAuthenticated && (
            <div style={{ borderTop: '1px solid var(--surface-2)', padding: '14px 16px' }}>
              <div style={{ ...LABEL_STYLE, marginBottom: '8px' }}>repositório</div>
              {connectedRepo ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <GitHubIcon size={11} color="var(--success)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {connectedRepo.split('/')[1]}
                    </span>
                  </div>
                  <button onClick={() => setShowRepoModal(true)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)',
                    padding: 0, flexShrink: 0,
                  }}>trocar</button>
                </div>
              ) : (
                <button onClick={() => setShowRepoModal(true)} style={{
                  width: '100%', padding: '8px 10px', borderRadius: '4px',
                  background: 'none', border: '1px dashed var(--surface-2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  color: 'var(--text-3)', fontSize: '11px', fontFamily: 'var(--font-sans)',
                }}>
                  <GitHubIcon size={11} color="var(--text-3)" />
                  Conectar repositório
                </button>
              )}
            </div>
          )}
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

          {/* Agents panel */}
          <div style={{
            background: 'var(--surface)', borderRadius: '8px',
            border: '1px solid var(--surface-2)', padding: '28px 24px',
          }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: '400', color: 'var(--text)', margin: '0 0 5px' }}>Agentes</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-3)', margin: 0, lineHeight: '1.5' }}>
                  {isAuthenticated
                    ? 'Ative os agentes para check-in diário, re-onboarding e desbloqueio.'
                    : 'Crie uma conta para ativar o check-in diário, re-onboarding e desbloqueador.'}
                </p>
              </div>
              {!isAuthenticated && (
                <button onClick={() => setShowSignup(true)} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--accent)', background: 'rgba(212,103,58,0.1)',
                  border: '1px solid rgba(212,103,58,0.2)',
                  borderRadius: '4px', padding: '6px 12px',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '16px',
                  letterSpacing: '0.05em',
                }}>Desbloquear →</button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              {AGENTS.slice(1).map(a => {
                const locked = !isAuthenticated
                return (
                  <div key={a.name} onClick={locked ? () => setShowSignup(true) : undefined} style={{
                    background: 'var(--bg)', border: locked ? '1px dashed var(--surface-2)' : '1px solid var(--surface-2)',
                    borderRadius: '6px', padding: '16px 14px',
                    cursor: locked ? 'pointer' : 'default',
                    opacity: locked ? 0.55 : 1, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => locked && (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => locked && (e.currentTarget.style.opacity = '0.55')}
                  >
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>{a.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: locked ? 'var(--text-3)' : 'var(--accent)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {locked ? 'conta necessária' : a.role}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      {/* ── Guest banner ── */}
      {!isAuthenticated && (
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
      )}

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
              Entre com GitHub para salvar o projeto, conectar seu repositório e desbloquear os agentes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <button
                onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                style={{
                  width: '100%', padding: '12px 20px', borderRadius: '5px', border: 'none',
                  background: 'var(--accent)', color: '#f2e4cf',
                  fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '450',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                <GitHubIcon size={14} /> Entrar com GitHub
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

      {/* ── Repo selection modal ── */}
      {showRepoModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowRepoModal(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: 'rgba(8,5,2,0.88)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--surface-2)',
            borderRadius: '12px', width: '100%', maxWidth: '480px',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
          }}>
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <GitHubIcon size={15} />
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--text)' }}>
                  Escolher repositório
                </span>
              </div>
              <button onClick={() => setShowRepoModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', fontSize: '20px', lineHeight: 1,
                padding: '4px 8px', borderRadius: '4px',
                fontFamily: 'var(--font-sans)',
              }}>×</button>
            </div>

            {!IS_PRO && (
              <div style={{
                margin: '12px 22px 0',
                padding: '9px 12px', borderRadius: '5px',
                background: 'rgba(212,103,58,0.08)', border: '1px solid rgba(212,103,58,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5' }}>
                  Plano grátis: 1 repositório. Faça upgrade para conectar todos.
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  color: 'var(--accent)', whiteSpace: 'nowrap', letterSpacing: '0.08em',
                }}>PRO →</span>
              </div>
            )}

            <div style={{ overflowY: 'auto', padding: '12px 0' }}>
              {reposLoading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  carregando repositórios...
                </div>
              ) : repos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)', fontSize: '13px' }}>
                  Nenhum repositório encontrado.
                </div>
              ) : repos.map(repo => {
                const isConnected = connectedRepo === repo.full_name
                const isLocked = !IS_PRO && connectedRepo !== null && !isConnected
                return (
                  <div
                    key={repo.id}
                    onClick={() => !isLocked && connectRepo(repo.full_name)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 22px', cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.35 : 1,
                      background: isConnected ? 'rgba(212,103,58,0.06)' : 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => !isLocked && (e.currentTarget.style.background = isConnected ? 'rgba(212,103,58,0.1)' : 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isConnected ? 'rgba(212,103,58,0.06)' : 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <GitHubIcon size={13} color={isConnected ? 'var(--accent)' : 'var(--text-3)'} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: isConnected ? 'var(--text)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {repo.name}
                          {repo.private && (
                            <span style={{ marginLeft: '6px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.05em' }}>PRIVATE</span>
                          )}
                        </div>
                        {repo.language && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-3)', marginTop: '2px' }}>{repo.language}</div>
                        )}
                      </div>
                    </div>
                    {isConnected && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent)', letterSpacing: '0.08em', flexShrink: 0 }}>CONECTADO</span>
                    )}
                  </div>
                )
              })}
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

function GitHubIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
