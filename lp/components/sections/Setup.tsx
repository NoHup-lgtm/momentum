import FadeIn from '../FadeIn'

export default function SetupSection() {
  return (
    <section id="setup" style={{
      background: 'var(--surface)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>configuração</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 10px',
            letterSpacing: '-0.01em',
          }}>Pronto em minutos.</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: '1.65', margin: '0 0 52px', maxWidth: '480px' }}>
            Sem Docker, sem banco de dados, sem infraestrutura. Instala e usa.
          </p>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {SETUP_CARDS.map((card, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: 'var(--bg)', border: '1px solid var(--surface-2)',
                borderRadius: '10px', padding: '28px 24px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--accent)', opacity: 0.7, marginBottom: '14px',
                }}>{String(i + 1).padStart(2, '0')}</div>

                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '16px',
                  fontWeight: '400', color: 'var(--text)', margin: '0 0 10px',
                }}>{card.title}</h3>

                <p style={{
                  fontSize: '13.5px', color: 'var(--text-2)',
                  lineHeight: '1.65', margin: '0 0 18px',
                }}>{card.body}</p>

                {card.code && (
                  <div style={{
                    background: 'var(--surface-2)', borderRadius: '5px',
                    padding: '10px 14px',
                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                    color: 'var(--text-2)', letterSpacing: '0.02em',
                  }}>{card.code}</div>
                )}

                {card.providers && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {card.providers.map(p => (
                      <span key={p} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '10px',
                        color: 'var(--text-3)', background: 'var(--surface-2)',
                        padding: '4px 10px', borderRadius: '4px',
                        letterSpacing: '0.05em',
                      }}>{p}</span>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        {/* MCP callout */}
        <FadeIn delay={320}>
          <div style={{
            marginTop: '24px', padding: '24px 28px', borderRadius: '10px',
            background: 'rgba(212,103,58,0.06)', border: '1px solid rgba(212,103,58,0.18)',
            display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '8px',
              }}>integração com AI IDEs</div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontSize: '16px',
                fontWeight: '400', color: 'var(--text)', margin: '0 0 8px',
              }}>Funciona dentro do Claude Code, Cursor e Windsurf.</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: '1.6', margin: 0 }}>
                O momentum inclui um servidor MCP. A IA do seu editor sabe em qual milestone você está e pode marcar tarefas concluídas enquanto você trabalha.
              </p>
            </div>
            <div style={{
              background: 'var(--surface)', borderRadius: '6px',
              padding: '14px 18px', fontFamily: 'var(--font-mono)',
              fontSize: '11.5px', color: 'var(--text-2)', lineHeight: '1.8',
              flexShrink: 0, minWidth: '220px',
            }}>
              <div style={{ color: 'var(--text-3)', marginBottom: '4px' }}>// ~/.claude.json</div>
              <div><span style={{ color: 'var(--accent)' }}>"momentum"</span>: {'{'}</div>
              <div style={{ paddingLeft: '14px' }}><span style={{ color: 'var(--text-3)' }}>"command"</span>: <span style={{ color: 'var(--success)' }}>"momentum-mcp"</span></div>
              <div>{'}'}</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

const SETUP_CARDS = [
  {
    title: 'Baixa o app',
    body: 'Instalador nativo para macOS, Windows e Linux. Sem dependências externas.',
    code: '# Disponível em breve no GitHub Releases',
    providers: undefined,
  },
  {
    title: 'Adiciona sua chave de API',
    body: 'Cole a chave do provedor que você já usa. Ela fica criptografada no keychain do sistema operacional.',
    code: undefined,
    providers: ['Anthropic', 'OpenAI', 'Google'],
  },
  {
    title: 'Conecta seu projeto',
    body: 'Aponta para qualquer diretório com Git. O Arquiteto lê o contexto e cria o plano. Funciona offline.',
    code: '# Detecta automaticamente o repo aberto no VS Code',
    providers: undefined,
  },
]
