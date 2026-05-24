import { useAppStore } from '../store/app'

export default function HomePage() {
  const { projects, setState, setActiveProject } = useAppStore()

  const openProject = (p: typeof projects[0]) => {
    setActiveProject(p)
    setState('project')
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '15px',
              color: 'var(--text)', letterSpacing: '-0.01em',
            }}>momentum</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflow: 'auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-3)', padding: '4px 8px 8px',
          }}>projetos</div>

          {projects.length === 0 ? (
            <div style={{
              padding: '12px 8px', color: 'var(--text-3)',
              fontSize: '12px', lineHeight: '1.6',
            }}>Nenhum projeto ainda.</div>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                onClick={() => openProject(p)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  padding: '8px', color: 'var(--text-2)',
                  fontSize: '13px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {p.name}
              </button>
            ))
          )}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--surface-2)' }}>
          <button
            onClick={() => setState('setup')}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)', border: 'none',
              color: '#f2e4cf', fontSize: '13px', fontWeight: 500,
            }}
          >+ Novo projeto</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
        color: 'var(--text-3)',
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--text)', opacity: 0.15 }}>
          momentum
        </div>
        <p style={{ fontSize: '13px', maxWidth: '280px', textAlign: 'center', lineHeight: '1.6' }}>
          {projects.length === 0
            ? 'Crie seu primeiro projeto para começar.'
            : 'Selecione um projeto na barra lateral.'}
        </p>
      </main>
    </div>
  )
}
