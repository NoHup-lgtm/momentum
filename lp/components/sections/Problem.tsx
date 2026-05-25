import FadeIn from '../FadeIn'

const PROBLEMS = [
  {
    title: 'O projeto esfriou',
    text: 'Você estava animado. Sumiu por uns dias. Quando voltou, o contexto foi embora junto. Recomeçar do zero toda vez drena mais do que o próprio trabalho.',
  },
  {
    title: 'Sem pressão externa, sem avanço',
    text: 'No trabalho tem prazo, tem time, tem cobrança. No projeto pessoal só tem você. E sem estrutura, a empolgação não dura mais do que duas semanas.',
  },
  {
    title: 'Comprometimento sem testemunhas',
    text: 'É fácil desistir quando ninguém sabe. Difícil é parar quando sua squad inteira vai ver que você quebrou a ofensiva de 47 dias.',
  },
  {
    title: 'Progresso invisível',
    text: 'Você trabalha, mas não vê crescer. Sem marcos, sem feedback visual, sem senso de conquista — parece que não sai do lugar.',
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
          }}>O problema é não ter nada em jogo quando você para.</p>
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
              <div style={{ padding: '28px 24px', background: 'var(--surface)', height: '100%' }}>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '17px',
                  fontWeight: '400', color: 'var(--text)', margin: '0 0 10px', lineHeight: '1.3',
                }}>{c.title}</h3>
                <p style={{
                  fontSize: '13.5px', color: 'var(--text-2)', lineHeight: '1.7', margin: 0,
                }}>{c.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
