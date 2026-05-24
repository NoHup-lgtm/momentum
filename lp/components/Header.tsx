'use client'

import { useState, useEffect } from 'react'
import SpiralIcon from './SpiralIcon'

export default function Header({ onCTA }: { onCTA: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '16px clamp(20px, 5vw, 60px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(20,14,8,0.93)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none',
      transition: 'background 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <SpiralIcon size={26} />
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: '400',
          color: 'var(--text)', letterSpacing: '0.02em',
        }}>momentum</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={onCTA}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '14px', color: 'var(--text-2)', padding: '8px 12px',
            fontFamily: 'var(--font-sans)', borderRadius: '5px',
            transition: 'opacity 0.18s ease',
          }}
        >
          Entrar
        </button>
        <button
          onClick={onCTA}
          style={{
            background: 'transparent',
            border: '1px solid var(--text-3)',
            borderRadius: '5px', cursor: 'pointer',
            fontSize: '14px', color: 'var(--text)',
            padding: '8px 18px',
            fontFamily: 'var(--font-sans)',
            transition: 'opacity 0.18s ease',
          }}
        >
          Criar projeto
        </button>
      </div>
    </nav>
  )
}
