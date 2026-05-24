import FadeIn from '../FadeIn'

const AGENTS = [
  {
    num: '01', name: 'Arquiteto', role: 'planejamento', featured: false,
    desc: 'Recebe sua ideia em linguagem natural e estrutura em 4 a 7 milestones — cada um concreto, entregável, com tarefas e estimativas de tempo.',
  },
  {
    num: '02', name: 'Re-onboarding', role: 'retomada', featured: true,
    desc: 'O mais importante. Detecta inatividade de 3+ dias. Quando você volta, gera um briefing personalizado e zera o custo de re-entrada.',
  },
  {
    num: '03', name: 'Accountability', role: 'rotina', featured: false,
    desc: 'Check-in diário com 4 opções rápidas. Resposta curta e específica ao projeto. Se houver bloqueio, aciona o Agente Desbloqueador.',
  },
  {
    num: '04', name: 'Desbloqueador', role: 'superação', featured: false,
    desc: 'Quando você trava, não resolve por você. Faz as perguntas certas para que você mesmo encontre o caminho.',
  },
]

export default function AgentsSection() {
  return (
    <section id="agentes" style={{
      background: 'var(--surface)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>os agentes</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 14px',
            letterSpacing: '-0.01em',
          }}>Quatro especialistas.<br />Uma missão.</h2>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '14px', marginTop: '48px',
        }}>
          {AGENTS.map((a, i) => (
            <FadeIn key={i} delay={i * 75}>
              <div style={{
                background: a.featured ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${a.featured ? 'rgba(212,103,58,0.22)' : 'var(--surface-2)'}`,
                borderRadius: '8px', padding: '26px 22px',
                position: 'relative', height: '100%', boxSizing: 'border-box',
              }}>
                {a.featured && (
                  <div style={{
                    position: 'absolute', top: '14px', right: '16px',
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--accent)', opacity: 0.7,
                  }}>principal</div>
                )}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: 'var(--text-3)', marginBottom: '14px',
                }}>{a.num}</div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '21px',
                  fontWeight: '400', color: 'var(--text)', margin: '0 0 4px',
                }}>{a.name}</h3>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--accent)', opacity: 0.65, marginBottom: '13px',
                }}>{a.role}</div>
                <p style={{
                  fontSize: '13px', color: 'var(--text-2)',
                  lineHeight: '1.7', margin: 0,
                }}>{a.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
