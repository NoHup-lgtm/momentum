import React from 'react';
import Svg, { Rect } from 'react-native-svg';

type Grid = (string | null)[][];
const T = null;

function PixelArt({ grid, size }: { grid: Grid; size: number }) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 1;
  const pw = size / cols;
  const ph = size / rows;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {grid.map((row, r) =>
        row.map((color, c) =>
          color ? (
            <Rect
              key={`${r}-${c}`}
              x={c * pw} y={r * ph}
              width={pw + 0.5} height={ph + 0.5}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

// Colors
const W1 = '#c8a96e'; const W2 = '#9b7a42'; const W3 = '#6b4f24'; const W4 = '#3d2a0e';
const B1 = '#7ab4e8'; const B2 = '#3a82f7'; const B3 = '#1c4fa3'; const B4 = '#0d2560';
const P1 = '#c9a0f5'; const P2 = '#9b59f7'; const P3 = '#5b1fb8'; const P4 = '#2a0a6b';
const A1 = '#ffd97a'; const A2 = '#d4a017'; const A3 = '#8a6200'; const A4 = '#3d2a00';
const GR1 = '#c8c8c8'; const GR2 = '#888888'; const GR3 = '#444444';
const N4 = '#2a1f10';

// ── COMUM — wooden chest ──────────────────────────────────────────────────────
const CHEST_COMUM: Grid = [
  [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],  // lid top
  [W3, W1, W2, W1, W2, W1, W1, W2, W1, W2, W1, W3],  // wood grain
  [W3, W2, W1, W2, W1, W2, W2, W1, W2, W1, W2, W3],  // wood grain
  [W3, W1, W2, W1, W2, W1, W1, W2, W1, W2, W1, W3],  // wood grain
  [GR3,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR3], // metal band / hinge
  [W4, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W4],  // body top edge
  [W4, W3, W2, W3, W2, GR3,GR2,GR3, W2, W3, W2, W4], // body + lock sides
  [W4, W3, W3, W3, W3, GR2,A2, GR2, W3, W3, W3, W4], // lock keyhole
  [W4, W3, W2, W3, W2, GR3,GR2,GR3, W2, W3, W2, W4], // body + lock sides
  [W4, W3, W3, W2, W3, W3, W3, W3, W2, W3, W3, W4],  // body
  [W4, W3, W2, W3, W2, W3, W3, W2, W3, W2, W3, W4],  // body
  [W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4],  // base
];

// ── RARO — circuit metal chest ────────────────────────────────────────────────
const CHEST_RARO: Grid = [
  [B4, B3, B3, B3, B3, B3, B3, B3, B3, B3, B3, B4],
  [B4, B2, B1, B2, B1, B2, B2, B1, B2, B1, B2, B4],
  [B4, B1, B3, B1, B3, B2, B2, B3, B1, B3, B1, B4],
  [B4, B2, B1, B2, B1, B2, B2, B1, B2, B1, B2, B4],
  [GR3,GR2,B2, GR2,B2, GR2,GR2,B2, GR2,B2, GR2,GR3], // circuit band
  [B4, B3, B3, B3, B3, B3, B3, B3, B3, B3, B3, B4],
  [B4, B3, B2, B3, B2, GR3,GR2,GR3, B2, B3, B2, B4],
  [B4, B3, B3, B3, B3, GR2,B1, GR2, B3, B3, B3, B4],
  [B4, B3, B2, B3, B2, GR3,GR2,GR3, B2, B3, B2, B4],
  [B4, B2, B3, B2, B3, B2, B2, B3, B2, B3, B2, B4],
  [B4, B3, B2, B3, B2, B3, B3, B2, B3, B2, B3, B4],
  [B4, B4, B4, B4, B4, B4, B4, B4, B4, B4, B4, B4],
];

// ── ÉPICO — void chest with runes ─────────────────────────────────────────────
const CHEST_EPICO: Grid = [
  [P4, P3, P3, P3, P3, P3, P3, P3, P3, P3, P3, P4],
  [P4, P2, P1, P3, P1, P3, P3, P1, P3, P1, P2, P4],
  [P4, P3, P1, P2, P3, P1, P1, P3, P2, P1, P3, P4],
  [P4, P1, P3, P1, P2, P3, P3, P2, P1, P3, P1, P4],
  [P3, P2, P1, P2, P1, P2, P2, P1, P2, P1, P2, P3], // rune band
  [P4, P3, P3, P3, P3, P3, P3, P3, P3, P3, P3, P4],
  [P4, P3, P1, P3, P1, P3, P2, P3, P1, P3, P1, P4],
  [P4, P3, P3, P3, P3, P2, P1, P2, P3, P3, P3, P4], // glowing lock
  [P4, P3, P1, P3, P1, P3, P2, P3, P1, P3, P1, P4],
  [P4, P2, P3, P1, P3, P1, P1, P3, P1, P3, P2, P4],
  [P4, P3, P2, P3, P2, P3, P3, P2, P3, P2, P3, P4],
  [P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4],
];

// ── LENDÁRIO — golden spiral chest ───────────────────────────────────────────
const CHEST_LENDARIO: Grid = [
  [A3, A3, A3, A3, A3, A3, A3, A3, A3, A3, A3, A3],
  [A3, A2, A1, A2, A1, A2, A2, A1, A2, A1, A2, A3],
  [A3, A1, A2, A1, A2, A1, A1, A2, A1, A2, A1, A3],
  [A3, A2, A1, A2, A1, A2, A2, A1, A2, A1, A2, A3],
  [A4, A3, A2, A3, A2, A3, A3, A2, A3, A2, A3, A4], // engraved band
  [A4, A3, A3, A3, A3, A3, A3, A3, A3, A3, A3, A4],
  [A4, A3, A2, A3, A2, A4, A3, A4, A2, A3, A2, A4],
  [A4, A3, A3, A3, A3, A3, A1, A3, A3, A3, A3, A4], // radiant center
  [A4, A3, A2, A3, A2, A4, A3, A4, A2, A3, A2, A4],
  [A4, A2, A3, A2, A3, A2, A2, A3, A2, A3, A2, A4],
  [A4, A3, A2, A3, A2, A3, A3, A2, A3, A2, A3, A4],
  [A4, A4, A4, A4, A4, A4, A4, A4, A4, A4, A4, A4],
];

export type ChestRarity = 'comum' | 'raro' | 'epico' | 'lendario';

const GRIDS: Record<ChestRarity, Grid> = {
  comum:    CHEST_COMUM,
  raro:     CHEST_RARO,
  epico:    CHEST_EPICO,
  lendario: CHEST_LENDARIO,
};

export function PixelChest({ rarity, size = 80 }: { rarity: ChestRarity; size?: number }) {
  const grid = GRIDS[rarity];
  if (!grid) return null;
  return <PixelArt grid={grid} size={size} />;
}
