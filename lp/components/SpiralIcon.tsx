interface Props {
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

// Uses <line> elements to match the design file exactly
export default function SpiralIcon({ size = 80, color = 'var(--accent)', className = '', style }: Props) {
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.43
  const minR = size * 0.04
  const minSW = 0.008 * size
  const maxSW = 0.085 * size
  const SEGS = 150

  const pts: [number, number][] = []
  for (let i = 0; i <= SEGS; i++) {
    const t = i / SEGS
    const a = -Math.PI / 2 + t * 1.75 * 2 * Math.PI
    const r = minR + (maxR - minR) * t
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }

  const lines = pts.slice(0, -1).map((p, i) => ({
    x1: p[0], y1: p[1], x2: pts[i + 1][0], y2: pts[i + 1][1],
    sw: minSW + (maxSW - minSW) * (i / (SEGS - 1)),
  }))

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
      aria-hidden="true"
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={color}
          strokeWidth={l.sw}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
