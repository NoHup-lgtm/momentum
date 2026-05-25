import FadeIn from '../FadeIn'

const STEPS = [
  {
    n: '01',
    title: 'Conecta o GitHub',
    body: 'Login com sua conta GitHub. O app passa a monitorar sua atividade — commits em qualquer repositório, público ou privado. Sem acesso de escrita, sem segredo.',
  },
  {
    n: '02',
    title: 'Commita. Normalmente.',
    body: 'Você trabalha como sempre. Quando o GitHub registra um commit seu, o momentum detecta automaticamente. Não tem botão pra apertar, não tem checklist manual.',
  },
  {
    n: '03',
    title: 'Sua ofensiva cresce',
    body: 'Cada dia com pelo menos 1 commit aumenta sua streak. Às 20h, se você ainda não commitou, chega uma notificação. Meia-noite sem commit — a ofensiva quebra.',
  },
  {
    n: '04',
    title: 'XP vira rank',
    body: 'Commits geram XP. XP acumulado na semana determina sua posição no ranking da squad. Domingo à noite: resultado. Top 3 sobem de rank. Nova semana começa na segunda.',
  },
  {
    n: '05',
    title: 'Personaliza, conquista, repete',
    body: 'Coins ganhas jogando desbloqueiam cosméticos. Streaks longas desbloqueiam itens lendários. Cada semana é uma nova rodada — nunca é tarde pra recuperar.',
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
            color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.01em',
          }}>Trabalha. O jogo<br />acontece sozinho.</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: '1.65', margin: '0 0 60px', maxWidth: '500px' }}>
            Não tem nada pra preencher. Só commitar.
          </p>
        </FadeIn>

        <div style={{ position: 'relative' }}>
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
