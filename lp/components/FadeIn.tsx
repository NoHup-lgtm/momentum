'use client'

import { useRef, useState, useEffect } from 'react'

interface Props {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}

export default function FadeIn({ children, delay = 0, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); ob.disconnect() } },
      { threshold: 0.08 }
    )
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(26px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
