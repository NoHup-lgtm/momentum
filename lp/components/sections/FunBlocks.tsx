'use client'

import FadeIn from '../FadeIn'
import PixelDev from '../PixelDev'
import { useT } from '@/lib/i18n'

// O coração do playbook Duolingo ("grátis. divertido. eficaz."): blocos curtos,
// positivos, alternando texto e ilustração. Aqui a ilustração são mini-mocks do
// HUD real do app (XP, ofensiva, squad).
export default function FunBlocks() {
  const t = useT().fun

  const visuals = [<XpMock key="xp" />, <StreakMock key="streak" />, <SquadMock key="squad" />]

  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'var(--section-pad) clamp(20px, 6vw, 80px)',
      display: 'flex', flexDirection: 'column', gap: 'clamp(72px, 9vw, 130px)',
    }}>
      {t.blocks.map((block, i) => (
        <FadeIn key={i}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(36px, 6vw, 90px)', flexWrap: 'wrap',
            flexDirection: i % 2 === 1 ? 'row-reverse' : 'row',
            maxWidth: '980px', margin: '0 auto',
          }}>
            <div style={{ flex: '1 1 320px', maxWidth: '440px' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(30px, 4vw, 46px)',
                fontWeight: 400, lineHeight: 1.15,
                color: 'var(--accent)', margin: '0 0 16px',
                letterSpacing: '-0.02em',
              }}>{block.title}</h2>
              <p style={{
                fontSize: '16px', lineHeight: 1.7,
                color: 'var(--text-2)', margin: 0,
              }}>{block.text}</p>
            </div>
            <div style={{ flex: '0 1 320px', display: 'flex', justifyContent: 'center' }}>
              {visuals[i]}
            </div>
          </div>
        </FadeIn>
      ))}
    </section>
  )
}

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--surface-2)',
  borderRadius: '14px', padding: '22px', width: '300px',
  boxShadow: '0 16px 50px rgba(0,0,0,0.35)',
}
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

// Bloco 1 — XP / nível / rank
function XpMock() {
  const m = useT().fun.mock
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <PixelDev size={44} variant={2} />
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ ...mono, fontSize: '13px', color: 'var(--text)' }}>{m.xpName}</div>
          <div style={{ ...mono, fontSize: '10px', color: '#5a9a50', marginTop: '3px' }}>{m.xpRank}</div>
        </div>
        <div style={{
          ...mono, fontSize: '10px', color: 'var(--accent)',
          border: '1px solid var(--surface-2)', borderRadius: '12px', padding: '4px 9px',
        }}>{m.xpChip}</div>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ width: '68%', height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--accent), #f0a500)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <span style={{ ...mono, fontSize: '9px', color: 'var(--text-3)' }}>680 / 1000 XP</span>
        <span style={{ ...mono, fontSize: '9px', color: 'var(--text-3)' }}>🎁 ×2</span>
      </div>
    </div>
  )
}

// Bloco 2 — ofensiva + lembrete das 20h
function StreakMock() {
  const m = useT().fun.mock
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <span style={{ fontSize: '34px', lineHeight: 1 }}>🔥</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ ...mono, fontSize: '15px', color: 'var(--text)' }}>{m.streakValue}</div>
          <div style={{ ...mono, fontSize: '10px', color: 'var(--text-3)', marginTop: '3px' }}>{m.streakSub}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '16px' }}>
        {[1, 1, 1, 1, 1, 1, 0].map((on, i) => (
          <div key={i} style={{
            flex: 1, height: '26px', borderRadius: '5px',
            background: on ? 'var(--accent)' : 'var(--surface-2)',
            opacity: on ? 0.55 + i * 0.075 : 1,
          }} />
        ))}
      </div>
      <div style={{
        ...mono, fontSize: '10px', color: 'var(--text-2)', textAlign: 'left',
        background: 'rgba(212,103,58,0.1)', border: '1px solid rgba(212,103,58,0.25)',
        borderRadius: '8px', padding: '10px 12px', lineHeight: 1.5,
      }}>{m.reminder}</div>
    </div>
  )
}

// Bloco 3 — leaderboard da squad
function SquadMock() {
  const m = useT().fun.mock
  const variants = [0, 1, 3]
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
          {m.squadTitle}
        </span>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
      </div>
      {m.members.map((member, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 10px', borderRadius: '8px',
          background: i === 0 ? 'rgba(212,103,58,0.1)' : 'transparent',
          border: i === 0 ? '1px solid rgba(212,103,58,0.25)' : '1px solid transparent',
          marginBottom: '4px',
        }}>
          <span style={{ ...mono, fontSize: '11px', color: i === 0 ? 'var(--accent)' : 'var(--text-3)', width: '18px', textAlign: 'left' }}>#{i + 1}</span>
          <PixelDev size={28} variant={variants[i]} />
          <span style={{ ...mono, fontSize: '12px', color: 'var(--text)', flex: 1, textAlign: 'left' }}>{member.name}</span>
          <span style={{ ...mono, fontSize: '11px', color: 'var(--text-2)' }}>{member.xp}</span>
        </div>
      ))}
    </div>
  )
}
