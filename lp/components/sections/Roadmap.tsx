'use client'

import FadeIn from '../FadeIn'
import { useT } from '@/lib/i18n'

export default function Roadmap() {
  const t = useT().roadmap

  return (
    <section id="roadmap" style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', display: 'block', marginBottom: '14px', opacity: 0.85,
          }}>{t.eyebrow}</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: '400', lineHeight: '1.15',
            color: 'var(--text)', margin: '0 0 14px', letterSpacing: '-0.01em',
          }}>{t.titleLine1}<br />{t.titleLine2}</h2>
          <p style={{
            fontSize: 'clamp(15px, 1.7vw, 18px)', lineHeight: '1.65',
            color: 'var(--text-2)', margin: 0, maxWidth: '520px',
          }}>
            {t.sub}
          </p>
        </FadeIn>

        {/* Featured — Study Mode */}
        <FadeIn delay={80}>
          <div style={{
            marginTop: '48px',
            background: 'var(--surface)',
            border: '1px solid rgba(212,103,58,0.28)',
            borderRadius: '12px',
            padding: 'clamp(26px, 4vw, 44px)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '18px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
              {t.studyTag}
            </div>

            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 34px)',
              fontWeight: '400', color: 'var(--text)', margin: '0 0 12px',
              letterSpacing: '-0.01em',
            }}>{t.studyTitle}</h3>

            <p style={{
              fontSize: '15px', lineHeight: '1.7', color: 'var(--text-2)',
              margin: '0 0 28px', maxWidth: '600px',
            }}>
              {t.studyDesc}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
            }}>
              {t.studyPoints.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  fontSize: '13px', lineHeight: '1.6', color: 'var(--text-2)',
                }}>
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '1px' }}>›</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* On the radar */}
        <FadeIn delay={140}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-3)', margin: '40px 0 16px',
          }}>{t.radarTitle}</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {t.radar.map((r, i) => (
              <div key={i} style={{
                border: '1px solid var(--surface-2)', borderRadius: '8px',
                padding: '18px 20px', background: 'transparent',
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: '17px',
                  color: 'var(--text)', marginBottom: '6px',
                }}>{r.name}</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-3)', lineHeight: '1.6', margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
