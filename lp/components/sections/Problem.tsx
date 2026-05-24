import FadeIn from '../FadeIn'

const PROBLEMS = [
  {
    title: 'O contexto foi embora',
    text: 'Depois de alguns dias longe, voltar parece recomeçar do zero. Não é falta de vontade — é custo de re-entrada.',
  },
  {
    title: 'O projeto ficou grande demais',
    text: 'Começa pequeno, cresce sem estrutura. Sem milestones claros, a sensação é de que nunca se termina nada.',
  },
  {
    title: 'Travou num detalhe',
    text: 'Um bug, uma decisão de arquitetura. Você adia um dia, depois outro. O projeto esfria. O momentum vai embora.',
  },
  {
    title: 'A motivação foi. O projeto ficou.',
    text: 'A empolgação inicial passa para todos. O que separa quem termina é ter estrutura quando a motivação não está.',
  },
]

export default function ProblemSection() {
  return (
    <section style={{
      background: 'var(--surface)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>o problema</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 14px',
            letterSpacing: '-0.01em',
          }}>Você não é o problema.</h2>
          <p style={{
            fontSize: '16px', color: 'var(--text-2)',
            lineHeight: '1.65', margin: 0, maxWidth: '520px',
          }}>Parar faz parte. O que muda é o custo de voltar.</p>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1px', marginTop: '48px',
          border: '1px solid var(--surface-2)', borderRadius: '8px',
          overflow: 'hidden', background: 'var(--surface-2)',
        }}>
          {PROBLEMS.map((c, i) => (
            <FadeIn key={i} delay={i * 70}>
              <div style={{
                padding: '28px 24px',
                background: 'var(--surface)',
                height: '100%',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '17px',
                  fontWeight: '400', color: 'var(--text)',
                  margin: '0 0 10px', lineHeight: '1.3',
                }}>{c.title}</h3>
                <p style={{
                  fontSize: '13.5px', color: 'var(--text-2)',
                  lineHeight: '1.7', margin: 0,
                }}>{c.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
