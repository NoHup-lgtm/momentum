'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SpiralIcon from './SpiralIcon'
import { useLang, useT } from '@/lib/i18n'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const lang = useLang()
  const router = useRouter()
  const t = useT()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const navItems = [
    { label: t.nav.howItWorks, id: 'como-funciona' },
    { label: t.nav.squad, id: 'squad' },
    { label: t.nav.roadmap, id: 'roadmap' },
    { label: t.nav.pricing, id: 'precos' },
  ]

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '13.5px', color: 'var(--text-2)', padding: '7px 12px',
              fontFamily: 'var(--font-sans)', borderRadius: '5px',
              transition: 'opacity 0.18s ease',
              display: scrolled ? 'block' : 'none',
            }}
          >{item.label}</button>
        ))}

        {/* Language toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2px',
          border: '1px solid var(--surface-2)', borderRadius: '5px',
          padding: '2px', marginRight: '4px',
        }}>
          {(['pt', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => router.push(l === 'pt' ? '/' : '/en')}
              style={{
                background: lang === l ? 'var(--surface-2)' : 'transparent',
                border: 'none', cursor: 'pointer', borderRadius: '3px',
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                color: lang === l ? 'var(--text)' : 'var(--text-3)',
                padding: '5px 8px', transition: 'all 0.15s ease',
              }}
            >{l}</button>
          ))}
        </div>

        <button
          onClick={() => scrollTo('waitlist')}
          style={{
            background: 'transparent', border: '1px solid var(--text-3)',
            borderRadius: '5px', cursor: 'pointer',
            fontSize: '13.5px', color: 'var(--text)',
            padding: '7px 18px', fontFamily: 'var(--font-sans)',
            transition: 'opacity 0.18s ease',
          }}
        >
          {t.nav.waitlist}
        </button>
      </div>
    </nav>
  )
}
