import FadeIn from '../FadeIn'

const FEATURES = [
  {
    num: '01', name: 'Ofensiva', role: 'retenção', featured: false,
    desc: 'Só ativa quando o GitHub confirma um commit seu. Não tem como fingir. Às 20h você recebe alerta se ainda não commitou. Meia-noite sem commit — streak quebra.',
  },
  {
    num: '02', name: 'XP e Rank', role: 'progressão', featured: true,
    desc: 'Commits geram XP. XP determina seu rank semanal. Seis ranks: Init → Build → Deploy → Senior → Architect → Legend. Top 3 da squad sobem todo domingo.',
  },
  {
    num: '03', name: 'Squad', role: 'social', featured: false,
    desc: 'Leaderboard em tempo real com seus amigos devs. Commits do dia, XP da semana, rank atual — tudo visível. Difícil parar quando a squad está olhando.',
  },
  {
    num: '04', name: 'Cosméticos', role: 'identidade', featured: false,
    desc: 'Seu avatar de dev pixel art, personalizável. Itens comuns com Coins ganhas jogando. Itens lendários só desbloqueados por conquistas reais — não são compráveis.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" style={{
      background: 'var(--surface)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>o sistema</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 14px', letterSpacing: '-0.01em',
          }}>Quatro mecanismos.<br />Um hábito.</h2>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '14px', marginTop: '48px',
        }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={i} delay={i * 75}>
              <div style={{
                background: f.featured ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${f.featured ? 'rgba(212,103,58,0.22)' : 'var(--surface-2)'}`,
                borderRadius: '8px', padding: '26px 22px',
                position: 'relative', height: '100%', boxSizing: 'border-box',
              }}>
                {f.featured && (
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
                }}>{f.num}</div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '21px',
                  fontWeight: '400', color: 'var(--text)', margin: '0 0 4px',
                }}>{f.name}</h3>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--accent)', opacity: 0.65, marginBottom: '13px',
                }}>{f.role}</div>
                <p style={{
                  fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.7', margin: 0,
                }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
