import FadeIn from '../FadeIn'
import SpiralIcon from '../SpiralIcon'

export default function FinalCTASection({ onCTA }: { onCTA?: () => void }) {
  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <SpiralIcon size={40} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', color: 'var(--text)',
            margin: '0 0 16px', lineHeight: '1.18',
          }}>O primeiro passo<br />é um plano.</h2>
          <p style={{
            fontSize: '15px', color: 'var(--text-2)',
            lineHeight: '1.65', margin: '0 auto 36px', maxWidth: '400px',
          }}>
            Descreva seu projeto, veja o Agente Arquiteto estruturar em milestones. Cadastro só depois de entender o valor.
          </p>
          <button
            onClick={onCTA}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 32px', borderRadius: '5px', border: 'none',
              background: 'var(--accent)', color: '#f2e4cf',
              fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '450',
              cursor: 'pointer', letterSpacing: '0.01em',
              transition: 'opacity 0.18s ease',
            }}
          >
            Criar meu primeiro projeto
          </button>
        </FadeIn>

        <FadeIn delay={200} style={{ marginTop: '64px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-3)', letterSpacing: '0.06em',
          }}>momentum · feito de dias imperfeitos.</p>
        </FadeIn>
      </div>
    </section>
  )
}
