'use client'

import { useT } from '@/lib/i18n'

// Faixa de ranks — papel da barra de idiomas da Duolingo: comunicar a
// progressão do jogo num relance, logo abaixo do hero.
const RANKS = [
  { name: 'Init', color: '#3a82f7' },
  { name: 'Build', color: '#5a9a50' },
  { name: 'Deploy', color: '#f0a500' },
  { name: 'Senior', color: '#d4673a' },
  { name: 'Architect', color: '#c0392b' },
  { name: 'Legend', color: '#8b5cf6' },
]

export default function RankTicker() {
  const t = useT().ticker

  return (
    <section style={{
      borderTop: '1px solid var(--surface-2)',
      borderBottom: '1px solid var(--surface-2)',
      background: 'var(--bg)',
      padding: '18px clamp(20px, 5vw, 60px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '10px clamp(14px, 2.6vw, 30px)', flexWrap: 'wrap',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '9px',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--text-3)', marginRight: '6px',
      }}>{t.label}</span>
      {RANKS.map((r, i) => (
        <span key={r.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(14px, 2.6vw, 30px)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontFamily: 'var(--font-mono)', fontSize: '12px',
            letterSpacing: '0.04em', color: r.color,
          }}>
            <span style={{
              width: '8px', height: '8px', background: r.color,
              display: 'inline-block', transform: 'rotate(45deg)',
            }} />
            {r.name}
          </span>
          {i < RANKS.length - 1 && (
            <span style={{ color: 'var(--text-3)', fontSize: '11px', opacity: 0.6 }}>→</span>
          )}
        </span>
      ))}
    </section>
  )
}
