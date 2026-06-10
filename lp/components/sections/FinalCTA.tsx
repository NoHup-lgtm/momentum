'use client'

import FadeIn from '../FadeIn'
import PixelDev from '../PixelDev'
import { useT } from '@/lib/i18n'

const APP_URL = 'https://app.momentu.me'

// Fechamento no estilo Duolingo: a frase-assinatura da marca + UMA ação.
export default function FinalCTASection() {
  const t = useT().finalCta

  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', alignItems: 'flex-end', marginBottom: '28px' }}>
            <PixelDev size={40} variant={1} />
            <PixelDev size={54} variant={0} />
            <PixelDev size={40} variant={2} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(30px, 4vw, 48px)',
            fontWeight: '400', color: 'var(--text)',
            margin: '0 0 16px', lineHeight: '1.18',
          }}>{t.titleLine1}<br />{t.titleLine2}</h2>
          <p style={{
            fontSize: '15px', color: 'var(--text-2)',
            lineHeight: '1.65', margin: '0 auto 36px', maxWidth: '420px',
          }}>
            {t.sub}
          </p>

          <a
            href={APP_URL}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 'min(340px, 100%)', padding: '17px 0',
              borderRadius: '10px', textDecoration: 'none',
              background: 'var(--accent)', color: '#f2e4cf',
              fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 700,
              boxShadow: '0 8px 30px rgba(212,103,58,0.3)',
            }}
          >
            {t.cta}
          </a>
        </FadeIn>

        <FadeIn delay={200} style={{ marginTop: '72px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-3)', letterSpacing: '0.06em',
          }}>{t.footer}</p>
        </FadeIn>
      </div>
    </section>
  )
}
