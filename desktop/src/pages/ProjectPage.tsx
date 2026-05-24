import { useAppStore } from '../store/app'

export default function ProjectPage() {
  const { activeProject, setState, setActiveProject } = useAppStore()

  if (!activeProject) {
    setState('home')
    return null
  }

  const currentMilestone = activeProject.milestones.find(m => !m.completed) ?? activeProject.milestones[0]
  const progress = activeProject.milestones.length > 0
    ? (activeProject.milestones.filter(m => m.completed).length / activeProject.milestones.length) * 100
    : 0

  const close = () => {
    setActiveProject(null)
    setState('home')
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-2)' }}>
          <button onClick={close} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            fontSize: '12px', padding: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px',
          }}>← todos os projetos</button>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--text)' }}>
            {activeProject.name}
          </div>
          {activeProject.description && (
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>
              {activeProject.description}
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>progresso</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent)' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '3px', background: 'var(--surface-3)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Milestones list */}
        <nav style={{ flex: 1, padding: '12px 8px', overflow: 'auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '4px 8px 8px' }}>milestones</div>
          {activeProject.milestones.map((m, i) => (
            <div key={m.id} style={{
              padding: '8px', borderRadius: 'var(--radius-sm)',
              marginBottom: '2px',
              background: currentMilestone?.id === m.id ? 'var(--surface-2)' : 'transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                  border: `1px solid ${m.completed ? 'var(--success)' : currentMilestone?.id === m.id ? 'var(--accent)' : 'var(--surface-3)'}`,
                  background: m.completed ? 'var(--success)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '8px', color: '#fff',
                }}>{m.completed ? '✓' : String(i + 1)}</span>
                <span style={{
                  fontSize: '12px',
                  color: m.completed ? 'var(--text-3)' : currentMilestone?.id === m.id ? 'var(--text)' : 'var(--text-2)',
                  textDecoration: m.completed ? 'line-through' : 'none',
                }}>{m.title}</span>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="main" style={{ padding: '32px 36px' }}>
        {currentMilestone ? (
          <>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>milestone atual</span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--text)', marginTop: '8px' }}>
                {currentMilestone.title}
              </h1>
              {currentMilestone.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '8px', lineHeight: '1.6' }}>
                  {currentMilestone.description}
                </p>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)', marginTop: '10px' }}>
                ~{currentMilestone.estimated_days} dias estimados
              </div>
            </div>

            {/* Tasks */}
            <div style={{ maxWidth: '580px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '14px' }}>tarefas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentMilestone.tasks.map(task => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', background: 'var(--surface)',
                    border: '1px solid var(--surface-2)', borderRadius: 'var(--radius-sm)',
                  }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0,
                      border: `1px solid ${task.done ? 'var(--success)' : 'var(--surface-3)'}`,
                      background: task.done ? 'var(--success)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '10px', cursor: 'pointer',
                    }}>
                      {task.done ? '✓' : ''}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: task.done ? 'var(--text-3)' : 'var(--text)',
                      textDecoration: task.done ? 'line-through' : 'none',
                    }}>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in button */}
            <div style={{ marginTop: '36px' }}>
              <button style={{
                padding: '11px 24px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)', border: 'none',
                color: '#f2e4cf', fontSize: '14px', fontWeight: 500,
              }}>
                Fazer check-in de hoje
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--text)', opacity: 0.4, marginBottom: '8px' }}>✓</div>
              <p>Todos os milestones concluídos.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
