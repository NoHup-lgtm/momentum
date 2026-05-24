'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SpiralIcon from './SpiralIcon'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => router.push('/')}>
        <SpiralIcon size={26} />
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: '400',
          color: 'var(--text)', letterSpacing: '0.02em',
        }}>momentum</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {session ? (
          <>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '14px', color: 'var(--text-2)', padding: '8px 12px',
                fontFamily: 'var(--font-sans)', borderRadius: '5px',
                transition: 'opacity 0.18s ease',
              }}
            >
              Dashboard
            </button>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Sair"
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  cursor: 'pointer', border: '1px solid var(--surface-2)',
                  transition: 'opacity 0.18s ease',
                }}
              />
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
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
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              style={{
                background: 'transparent',
                border: '1px solid var(--text-3)',
                borderRadius: '5px', cursor: 'pointer',
                fontSize: '14px', color: 'var(--text)',
                padding: '8px 18px',
                fontFamily: 'var(--font-sans)',
                transition: 'opacity 0.18s ease',
                display: 'flex', alignItems: 'center', gap: '7px',
              }}
            >
              <GitHubIcon size={14} /> Criar projeto
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
