import { ImageResponse } from 'next/og'

export const alt = 'momentum — Feito de dias imperfeitos.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#140e08',
          position: 'relative',
        }}
      >
        {/* halo de fundo */}
        <div
          style={{
            position: 'absolute',
            width: 760,
            height: 760,
            borderRadius: 760,
            border: '2px solid rgba(212,103,58,0.10)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: 520,
            border: '2px solid rgba(212,103,58,0.16)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#d4673a',
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 10, background: '#d4673a' }} />
          App mobile para devs
        </div>

        <div style={{ fontSize: 130, color: '#f2e4cf', letterSpacing: -2, lineHeight: 1 }}>
          momentum
        </div>

        <div style={{ fontSize: 34, color: '#a08060', marginTop: 24 }}>
          Feito de dias imperfeitos.
        </div>

        <div style={{ width: 80, height: 2, background: 'rgba(212,103,58,0.4)', margin: '40px 0' }} />

        <div style={{ fontSize: 26, color: '#b8a898' }}>
          cada commit vira streak · XP · rank
        </div>
      </div>
    ),
    { ...size },
  )
}
