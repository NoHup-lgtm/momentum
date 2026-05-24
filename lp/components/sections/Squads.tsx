import FadeIn from '../FadeIn'

const SQUAD_MEMBERS = [
  { name: 'Ana Lima',   proj: 'app de receitas', streak: 14, dots: 3 },
  { name: 'Carlos R.',  proj: 'SaaS de RH',      streak:  7, dots: 2 },
  { name: 'Mariana V.', proj: 'CLI tool',         streak: 21, dots: 5 },
  { name: 'você',       proj: 'seu projeto aqui', streak:  0, dots: 0, you: true },
]

const AVATAR_COLORS = [
  'oklch(46% 0.07 30deg)',
  'oklch(52% 0.07 80deg)',
  'oklch(44% 0.07 200deg)',
]

export default function SquadsSection() {
  return (
    <section id="squads" style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '56px', alignItems: 'center',
      }} data-squads-layout="">

        {/* Left: copy */}
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>squads</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(26px, 3.4vw, 42px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 14px',
            letterSpacing: '-0.01em',
          }}>Melhor<br />acompanhado.</h2>
          <p style={{
            fontSize: '16px', color: 'var(--text-2)',
            lineHeight: '1.65', marginTop: '14px', maxWidth: '520px',
          }}>
            Crie um grupo com pessoas em projetos diferentes. O squad cria accountability coletivo sem reunião — só pelo progresso visível de cada um.
          </p>
          <p style={{
            fontSize: '13.5px', color: 'var(--text-3)',
            lineHeight: '1.7', marginTop: '14px', maxWidth: '420px',
          }}>
            Ranking de squads por streak coletivo. Ranking individual por opt-in. Sem punição por quebra — alinhado com o tom da marca.
          </p>
        </FadeIn>

        {/* Right: squad card */}
        <FadeIn delay={140}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-2)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              padding: '16px 18px', borderBottom: '1px solid var(--surface-2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: '15px',
                  fontWeight: '400', color: 'var(--text)',
                }}>Builders BR</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--text-3)', marginTop: '2px',
                }}>squad · 4 membros</div>
              </div>
              <div style={{
                background: 'var(--surface-2)', borderRadius: '5px',
                padding: '5px 10px',
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--accent)', fontWeight: '500',
              }}>#1</div>
            </div>

            {/* Members */}
            <div style={{ padding: '6px 0' }}>
              {SQUAD_MEMBERS.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '10px 18px',
                  background: m.you ? 'rgba(212,103,58,0.05)' : 'transparent',
                  borderLeft: m.you ? '2px solid var(--accent)' : '2px solid transparent',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    flexShrink: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '10px',
                    fontFamily: 'var(--font-mono)', color: 'var(--text-2)',
                    background: m.you ? 'var(--surface-2)' : AVATAR_COLORS[i % 3],
                    border: m.you ? '1px dashed var(--text-3)' : 'none',
                  }}>
                    {m.you ? '?' : m.name[0]}
                  </div>

                  {/* Name + project */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '12.5px',
                      color: m.you ? 'var(--text-2)' : 'var(--text)',
                      fontStyle: m.you ? 'italic' : 'normal',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{m.name}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '9.5px',
                      color: 'var(--text-3)', marginTop: '1px',
                    }}>{m.proj}</div>
                  </div>

                  {/* Streak dots + count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[0,1,2,3,4].map(j => (
                        <div key={j} style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: j < m.dots ? 'var(--accent)' : 'var(--surface-2)',
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '10px',
                      color: m.streak ? 'var(--text-2)' : 'var(--text-3)',
                    }}>{m.streak ? `${m.streak}d` : '—'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Card footer */}
            <div style={{
              padding: '12px 18px', borderTop: '1px solid var(--surface-2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)',
              }}>streak coletivo</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '13px',
                color: 'var(--accent)', fontWeight: '500',
              }}>42 dias</span>
            </div>
          </div>
        </FadeIn>

      </div>
    </section>
  )
}
