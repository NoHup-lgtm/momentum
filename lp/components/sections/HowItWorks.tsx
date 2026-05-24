import FadeIn from '../FadeIn'

const STEPS = [
  {
    n: '01',
    title: 'Instala o app',
    body: 'Um app desktop nativo para macOS, Windows e Linux. Nada de extensão de browser ou terminal aberto o tempo todo.',
  },
  {
    n: '02',
    title: 'Adiciona sua chave de API',
    body: 'Anthropic, OpenAI ou Google — você escolhe e traz a sua própria chave. Custo zero pra você, privacidade máxima: nenhum dado passa pelo nosso servidor.',
  },
  {
    n: '03',
    title: 'Conecta o repositório',
    body: 'Aponta pro seu repo local ou GitHub. O Arquiteto lê o contexto do projeto e estrutura um plano em milestones concretos.',
  },
  {
    n: '04',
    title: 'Trabalha normalmente',
    body: 'Os agentes rodam em segundo plano. Check-in diário no system tray, notificação quando você para por muitos dias, briefing quando você volta.',
  },
  {
    n: '05',
    title: 'Mantém o momentum',
    body: 'O Re-onboarding zera o custo de voltar. O Desbloqueador te ajuda quando você trava. A cada sessão, o projeto avança.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" style={{
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
          }}>como funciona</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 10px',
            letterSpacing: '-0.01em',
          }}>Simples de usar.<br />Difícil de ignorar.</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: '1.65', margin: '0 0 60px', maxWidth: '500px' }}>
            Do zero ao primeiro milestone em menos de cinco minutos.
          </p>
        </FadeIn>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: '19px', top: '12px',
            width: '1px', bottom: '12px',
            background: 'linear-gradient(to bottom, var(--accent), var(--surface-2))',
            opacity: 0.25,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((step, i) => (
              <FadeIn key={step.n} delay={i * 80}>
                <div style={{
                  display: 'flex', gap: '32px', alignItems: 'flex-start',
                  padding: '24px 0',
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--surface-2)' : 'none',
                }}>
                  {/* Step number bubble */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? 'var(--accent)' : 'var(--surface)',
                    border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--surface-2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: i === 0 ? '#f2e4cf' : 'var(--text-3)',
                    letterSpacing: '0.05em', marginTop: '2px',
                  }}>{step.n}</div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)', fontSize: '18px',
                      fontWeight: '400', color: 'var(--text)', margin: '0 0 7px',
                    }}>{step.title}</h3>
                    <p style={{
                      fontSize: '14.5px', color: 'var(--text-2)',
                      lineHeight: '1.65', margin: 0, maxWidth: '540px',
                    }}>{step.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
