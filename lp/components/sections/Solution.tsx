import FadeIn from '../FadeIn'

const MOMENTS = [
  {
    num: '01', label: 'antes de começar',
    title: 'Do zero ao plano',
    text: 'Descreva sua ideia. O Agente Arquiteto devolve milestones concretos, tarefas com verbos no infinitivo e estimativas realistas para 1–2h por dia.',
    agent: 'Agente Arquiteto',
  },
  {
    num: '02', label: 'enquanto você trabalha',
    title: 'O ritmo não quebra',
    text: 'Check-in diário em 10 segundos. O Agente de Accountability lê o contexto do seu projeto e responde de forma específica — nunca genérica.',
    agent: 'Agente Accountability',
  },
  {
    num: '03', label: 'quando você volta',
    title: 'Re-entrada sem atrito',
    text: 'Ficou dias longe. Quando você volta, o Agente de Re-onboarding te briefa: onde parou, o que fez por último, qual é o próximo passo.',
    agent: 'Agente Re-onboarding',
  },
]

export default function SolutionSection() {
  return (
    <section id="como-funciona" style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>a solução</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 14px',
            letterSpacing: '-0.01em',
          }}>Três momentos críticos.</h2>
          <p style={{
            fontSize: '16px', color: 'var(--text-2)',
            lineHeight: '1.65', margin: 0, maxWidth: '520px',
          }}>O momentum entra onde os projetos costumam morrer.</p>
        </FadeIn>

        <div style={{ marginTop: '52px' }}>
          {MOMENTS.map((m, i) => (
            <FadeIn key={i} delay={i * 90}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr auto',
                gap: '20px 32px', alignItems: 'start',
                padding: '34px 0',
                borderTop: '1px solid var(--surface-2)',
              }}>
                {/* Serif numeral */}
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(32px, 3vw, 42px)',
                  fontWeight: '400', color: 'var(--accent)',
                  opacity: 0.55, lineHeight: '1', paddingTop: '3px',
                }}>{m.num}</span>

                {/* Label + title + text */}
                <div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--text-3)', display: 'block', marginBottom: '7px',
                  }}>{m.label}</span>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 2vw, 23px)',
                    fontWeight: '400', color: 'var(--text)', margin: '0 0 9px',
                  }}>{m.title}</h3>
                  <p style={{
                    fontSize: '14px', color: 'var(--text-2)',
                    lineHeight: '1.7', margin: 0, maxWidth: '500px',
                  }}>{m.text}</p>
                </div>

                {/* Agent name */}
                <span data-solution-agent="" style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--text-3)', textAlign: 'right',
                  paddingTop: '3px', whiteSpace: 'nowrap',
                }}>{m.agent}</span>
              </div>
            </FadeIn>
          ))}
          <div style={{ borderTop: '1px solid var(--surface-2)' }} />
        </div>
      </div>
    </section>
  )
}
