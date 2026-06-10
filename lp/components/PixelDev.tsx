// Mascote da marca: o dev pixel-art do app (mesmo grid 16x16 do mobile).
// Funciona como os personagens da Duolingo — dá rosto e alma à landing.
const PALS: Array<Array<string | null>> = [
  [null, '#180c04', '#c48a5a', '#0d0806', '#d4673a', '#2a3040', '#4a9a80', '#241408'],
  [null, '#0e0a06', '#a87040', '#0d0806', '#2e3a5a', '#2a3040', '#5a8aaa', '#241408'],
  [null, '#1a1008', '#e8b888', '#0d0806', '#3a6a40', '#2a3040', '#5aaa70', '#281808'],
  [null, '#180e08', '#f0c898', '#100808', '#2a6878', '#2a3040', '#3ab0a0', '#1a1a28'],
]

const PX = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,1,1,0,0,0,0],
  [0,0,0,0,1,2,3,2,3,2,1,0,0,0,0,0],
  [0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0],
  [0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0],
  [0,0,0,4,4,4,4,4,4,4,4,4,0,0,0,0],
  [0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0],
  [0,0,4,4,4,5,5,5,5,5,4,4,4,0,0,0],
  [0,0,4,4,5,6,6,6,6,6,5,4,4,0,0,0],
  [0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,0],
  [0,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0],
  [0,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0],
  [0,0,0,0,7,7,0,0,0,7,7,0,0,0,0,0],
  [0,0,0,0,7,7,0,0,0,7,7,0,0,0,0,0],
]

export default function PixelDev({ size = 64, variant = 0 }: { size?: number; variant?: number }) {
  const pal = PALS[variant % PALS.length]
  const ps = size / 16
  const rects: React.ReactElement[] = []
  PX.forEach((row, y) => {
    row.forEach((v, x) => {
      if (!v) return
      const color = pal[v]
      if (!color) return
      rects.push(
        <rect key={`${y}-${x}`} x={x * ps} y={y * ps} width={ps + 0.4} height={ps + 0.4} fill={color} />,
      )
    })
  })
  return (
    <svg width={size} height={size} aria-hidden="true" style={{ imageRendering: 'pixelated' }}>
      {rects}
    </svg>
  )
}
