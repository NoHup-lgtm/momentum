'use client'

import SpiralIcon from '../SpiralIcon'
import PixelDev from '../PixelDev'
import { useT } from '@/lib/i18n'

const APP_URL = 'https://app.momentu.me'

// Hero no playbook da Duolingo: valor direto na headline, UMA ação (começar),
// secundária discreta (já tenho conta) e os mascotes dando alma — mas com a
// nossa identidade (pixel art + terracota + dark).
export default function Hero() {
  const t = useT().hero

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'var(--bg)',
      padding: '110px clamp(20px, 6vw, 80px) 70px',
      textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.05, pointerEvents: 'none', userSelect: 'none',
      }}>
        <SpiralIcon size={720} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, var(--bg) 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
        {/* Mascotes — os personagens da marca */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          gap: '18px', marginBottom: '30px',
        }}>
          <PixelDev size={52} variant={1} />
          <PixelDev size={72} variant={0} />
          <PixelDev size={52} variant={3} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '20px', opacity: 0.9,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          {t.badge}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(36px, 5.2vw, 64px)',
          fontWeight: '400', lineHeight: '1.12',
          color: 'var(--text)', margin: '0 0 20px',
          letterSpacing: '-0.02em',
        }}>
          {t.titleLine1}<br className="desktop-br" /> {t.titleLine2}
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 1.9vw, 19px)',
          lineHeight: '1.65', color: 'var(--text-2)',
          margin: '0 auto 36px', maxWidth: '480px',
        }}>
          {t.subtitle}
        </p>

        {/* HUD ilustrativo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '16px', marginBottom: '40px', flexWrap: 'wrap',
        }}>
          {t.stats.map((stat, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--surface-2)',
              borderRadius: '8px', padding: '12px 18px', textAlign: 'center',
              minWidth: '96px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '18px',
                color: 'var(--accent)', lineHeight: 1,
              }}>{stat.label} {stat.value}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--text-3)', marginTop: '5px',
              }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* CTAs empilhados (Duolingo): primário forte + secundário outline */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '12px', marginBottom: '18px',
        }}>
          <a
            href={APP_URL}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 'min(340px, 100%)', padding: '17px 0',
              borderRadius: '10px', textDecoration: 'none',
              background: 'var(--accent)', color: '#f2e4cf',
              fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 700,
              letterSpacing: '0.01em',
              boxShadow: '0 8px 30px rgba(212,103,58,0.3)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {t.ctaPrimary}
          </a>
          <a
            href={APP_URL}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 'min(340px, 100%)', padding: '15px 0',
              borderRadius: '10px', textDecoration: 'none',
              background: 'transparent', color: 'var(--accent)',
              border: '2px solid var(--surface-2)',
              fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600,
              transition: 'border-color 0.15s ease',
            }}
          >
            {t.ctaSecondary}
          </a>
        </div>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-3)', letterSpacing: '0.03em',
        }}>
          {t.footnote}
        </p>
      </div>

      <div style={{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        opacity: 0.3,
      }}>
        <div style={{ width: '1px', height: '44px', background: 'linear-gradient(to bottom, transparent, var(--text-3))' }} />
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-3)' }} />
      </div>
    </section>
  )
}
