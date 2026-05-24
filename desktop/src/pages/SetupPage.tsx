import { useState } from 'react'
import { useAppStore } from '../store/app'
import { Project, Milestone } from '../types'

type Step = 'api-key' | 'repo' | 'architect'

export default function SetupPage() {
  const { setState, setProjects, projects } = useAppStore()
  const [step, setStep] = useState<Step>('api-key')
  const [provider, setProvider] = useState<'anthropic' | 'openai' | 'google'>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])

  const generatePlan = async () => {
    if (!projectName || !apiKey) return
    setLoading(true)
    // TODO: call Tauri command → Rust → AI API with BYOK
    // Simulated for now
    await new Promise(r => setTimeout(r, 1500))
    setMilestones([
      {
        id: '1', title: 'Setup inicial', order: 0, completed: false,
        description: 'Configuração do projeto e dependências base.',
        estimated_days: 2,
        tasks: [
          { id: '1a', title: 'Criar repositório', done: false, created_at: new Date().toISOString() },
          { id: '1b', title: 'Definir estrutura de pastas', done: false, created_at: new Date().toISOString() },
        ],
      },
      {
        id: '2', title: 'MVP', order: 1, completed: false,
        description: 'Funcionalidades mínimas para validar o produto.',
        estimated_days: 7,
        tasks: [
          { id: '2a', title: 'Implementar feature principal', done: false, created_at: new Date().toISOString() },
          { id: '2b', title: 'Testes básicos', done: false, created_at: new Date().toISOString() },
        ],
      },
    ])
    setStep('architect')
    setLoading(false)
  }

  const saveProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectName,
      repo_path: repoPath,
      description: projectDesc,
      milestones,
      checkins: [],
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    }
    setProjects([...projects, newProject])
    setState('home')
  }

  const containerStyle: React.CSSProperties = {
    height: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)',
  }

  const cardStyle: React.CSSProperties = {
    width: '480px', background: 'var(--surface)',
    border: '1px solid var(--surface-2)',
    borderRadius: '12px', padding: '36px 32px',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '10px',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--text-3)', display: 'block', marginBottom: '8px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--surface-2)',
    border: '1px solid var(--surface-3)',
    borderRadius: 'var(--radius-sm)', padding: '10px 12px',
    color: 'var(--text)', fontSize: '14px', outline: 'none',
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)',
    background: 'var(--accent)', border: 'none',
    color: '#f2e4cf', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', marginTop: '24px',
  }

  // ── Step: API key ──
  if (step === 'api-key') return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>1 / 2</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginTop: '8px' }}>Sua chave de API</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '6px', lineHeight: '1.6' }}>
            A chave fica salva localmente no keychain do sistema. Nunca sai do seu computador.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>provedor</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['anthropic', 'openai', 'google'] as const).map(p => (
              <button key={p} onClick={() => setProvider(p)} style={{
                flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${provider === p ? 'var(--accent)' : 'var(--surface-3)'}`,
                background: provider === p ? 'var(--accent-dim)' : 'transparent',
                color: provider === p ? 'var(--accent)' : 'var(--text-3)',
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>chave de API</label>
          <input
            type="password"
            placeholder={provider === 'anthropic' ? 'sk-ant-...' : provider === 'openai' ? 'sk-...' : 'AIza...'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={() => setStep('repo')}
          disabled={!apiKey}
          style={{ ...btnPrimary, opacity: apiKey ? 1 : 0.5 }}
        >Continuar →</button>

        <button onClick={() => setState('home')} style={{
          width: '100%', marginTop: '12px', padding: '8px', background: 'none',
          border: 'none', color: 'var(--text-3)', fontSize: '13px',
        }}>Cancelar</button>
      </div>
    </div>
  )

  // ── Step: Repo + Project info ──
  if (step === 'repo') return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>2 / 2</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginTop: '8px' }}>Seu projeto</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '6px', lineHeight: '1.6' }}>
            O Agente Arquiteto vai ler o repositório e criar o plano de milestones.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>nome do projeto</label>
            <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Ex: meu-saas" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>caminho do repositório</label>
            <input value={repoPath} onChange={e => setRepoPath(e.target.value)} placeholder="/Users/você/projetos/meu-saas" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>descrição (opcional)</label>
            <textarea
              value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
              placeholder="O que esse projeto faz?"
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={!projectName || loading}
          style={{ ...btnPrimary, opacity: projectName ? 1 : 0.5 }}
        >{loading ? 'Gerando plano...' : 'Gerar plano com IA →'}</button>

        <button onClick={() => setStep('api-key')} style={{
          width: '100%', marginTop: '12px', padding: '8px', background: 'none',
          border: 'none', color: 'var(--text-3)', fontSize: '13px',
        }}>← Voltar</button>
      </div>
    </div>
  )

  // ── Step: Review plan ──
  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, width: '560px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>plano gerado</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginTop: '8px' }}>Revise os milestones</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
          {milestones.map((m, i) => (
            <div key={m.id} style={{
              background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent)', opacity: 0.7 }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '14px' }}>{m.title}</div>
                  {m.description && <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{m.description}</div>}
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    {m.tasks.length} tarefas · ~{m.estimated_days}d
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={saveProject} style={btnPrimary}>Começar com esse plano →</button>
        <button onClick={() => setStep('repo')} style={{
          width: '100%', marginTop: '12px', padding: '8px', background: 'none',
          border: 'none', color: 'var(--text-3)', fontSize: '13px',
        }}>← Gerar novamente</button>
      </div>
    </div>
  )
}
