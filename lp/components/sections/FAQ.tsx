'use client'

import { useState } from 'react'
import FadeIn from '../FadeIn'
import { useT } from '@/lib/i18n'

export default function FAQSection() {
  const t = useT().faq
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>{t.eyebrow}</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 48px',
            letterSpacing: '-0.01em',
          }}>{t.title}</h2>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {t.items.map((item, i) => (
            <FadeIn key={i} delay={i * 40}>
              <div style={{ borderTop: '1px solid var(--surface-2)' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none',
                    border: 'none', cursor: 'pointer',
                    padding: '20px 0', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', gap: '20px',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-serif)', fontSize: '16.5px',
                    fontWeight: '400', color: 'var(--text)', lineHeight: '1.4',
                  }}>{item.q}</span>
                  <span style={{
                    color: 'var(--accent)', fontSize: '20px', lineHeight: 1,
                    flexShrink: 0, transition: 'transform 0.2s',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}>+</span>
                </button>

                {open === i && (
                  <p style={{
                    fontSize: '14.5px', color: 'var(--text-2)',
                    lineHeight: '1.7', margin: '0 0 20px',
                    paddingRight: '40px',
                  }}>{item.a}</p>
                )}
              </div>
            </FadeIn>
          ))}
          <div style={{ borderTop: '1px solid var(--surface-2)' }} />
        </div>
      </div>
    </section>
  )
}
