'use client'

import FadeIn from '../FadeIn'
import { useT } from '@/lib/i18n'

const RANKS = [
  { emoji: '🔵', name: 'Init' },
  { emoji: '🟢', name: 'Build' },
  { emoji: '🟡', name: 'Deploy' },
  { emoji: '🟠', name: 'Senior' },
  { emoji: '🔴', name: 'Architect' },
  { emoji: '💜', name: 'Legend' },
]

const LEADERBOARD = [
  { pos: 1, name: 'rafael.dev', commits: 34, xp: 1820, rank: 'Senior', up: true, avatar: '🧑‍💻' },
  { pos: 2, name: 'você', commits: 28, xp: 1540, rank: 'Deploy', up: true, isYou: true, avatar: '😎' },
  { pos: 3, name: 'marina_codes', commits: 25, xp: 1390, rank: 'Deploy', up: true, avatar: '👩‍💻' },
  { pos: 4, name: 'tiago.js', commits: 18, xp: 960, rank: 'Build', up: false, avatar: '🧔' },
  { pos: 5, name: 'lu_backend', commits: 11, xp: 580, rank: 'Init', up: false, avatar: '👤' },
]

export default function SquadsSection() {
  const t = useT().squads

  return (
    <section id="squad" style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 5vw, 80px)',
      borderTop: '1px solid var(--surface-2)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
            color: 'var(--text)', margin: '0 0 14px', letterSpacing: '-0.01em',
          }}>{t.titleLine1}<br />{t.titleLine2}</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: '1.65', margin: '0 0 52px', maxWidth: '500px' }}>
            {t.sub}
          </p>
        </FadeIn>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px', alignItems: 'start',
        }}>
          {/* Leaderboard mock */}
          <FadeIn>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--surface-2)',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--surface-2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                  {t.week}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)' }}>{t.live}</span>
              </div>

              {LEADERBOARD.map((user, i) => (
                <div key={i} style={{
                  padding: '14px 20px',
                  background: user.isYou ? 'rgba(212,103,58,0.06)' : 'transparent',
                  borderBottom: i < LEADERBOARD.length - 1 ? '1px solid var(--surface-2)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '13px',
                    color: i < 3 ? 'var(--accent)' : 'var(--text-3)',
                    minWidth: '20px',
                  }}>#{user.pos}</span>

                  <div style={{
                    width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0,
                    background: 'var(--surface-2)',
                    border: user.isYou ? '1px solid var(--accent)' : '1px solid var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px',
                  }}>{user.avatar}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px',
                      color: user.isYou ? 'var(--accent)' : 'var(--text)',
                      fontWeight: user.isYou ? '500' : '400',
                    }}>{user.isYou ? t.youName : user.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
                      {t.commitsXp(user.commits, user.xp)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '9px',
                      letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)',
                    }}>{user.rank}</span>
                    <span style={{ fontSize: '11px', color: user.up ? 'var(--success)' : 'var(--danger)' }}>
                      {user.up ? '↑' : '↓'}
                    </span>
                  </div>
                </div>
              ))}

              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--surface-2)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', textAlign: 'center' }}>
                  {t.lbFooter}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Ranks + rules */}
          <FadeIn delay={120}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--text-3)', marginBottom: '14px',
                }}>{t.ranksTitle}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {RANKS.map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '9px 14px',
                      background: i === 3 ? 'rgba(212,103,58,0.06)' : 'transparent',
                      border: `1px solid ${i === 3 ? 'rgba(212,103,58,0.2)' : 'var(--surface-2)'}`,
                      borderRadius: '6px',
                    }}>
                      <span>{r.emoji}</span>
                      <span style={{
                        fontFamily: 'var(--font-serif)', fontSize: '14px',
                        color: i === 3 ? 'var(--accent)' : 'var(--text-2)',
                      }}>{r.name}</span>
                      {i === 3 && (
                        <span style={{
                          marginLeft: 'auto', fontFamily: 'var(--font-mono)',
                          fontSize: '9px', color: 'var(--accent)', opacity: 0.7,
                        }}>{t.youTag}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'var(--surface)', border: '1px solid var(--surface-2)',
                borderRadius: '8px', padding: '20px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-3)', marginBottom: '14px',
                }}>{t.rulesTitle}</div>
                {t.rules.map((rule, i, arr) => (
                  <div key={i} style={{
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                    fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5',
                    marginBottom: i < arr.length - 1 ? '10px' : 0,
                  }}>
                    <span style={{ color: 'var(--accent)', opacity: 0.6, fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '1px', flexShrink: 0 }}>·</span>
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
