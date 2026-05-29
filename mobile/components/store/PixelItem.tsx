import React from 'react';
import Svg, { Rect, G } from 'react-native-svg';

// ── Pixel art engine ──────────────────────────────────────────────────────────
// Each grid cell is a hex color string or null (transparent)
type Grid = (string | null)[][];

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
              x={c * pw}
              y={r * ph}
              width={pw + 0.5}   // slight overlap to avoid hairlines
              height={ph + 0.5}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

// ── Color palettes ────────────────────────────────────────────────────────────
const T = null; // transparent

// common warm tones
const W1 = '#c8a96e'; // warm highlight
const W2 = '#9b7a42'; // warm mid
const W3 = '#6b4f24'; // warm shadow
const W4 = '#3d2a0e'; // dark

// blues
const B1 = '#7ab4e8'; // light blue
const B2 = '#3a82f7'; // blue
const B3 = '#1c4fa3'; // dark blue

// greens
const G1 = '#a8d87a'; // light green
const G2 = '#5a9e40'; // green
const G3 = '#2e5e1a'; // dark green

// purples
const P1 = '#c9a0f5'; // light purple
const P2 = '#9b59f7'; // purple
const P3 = '#5b1fb8'; // dark purple

// neutrals
const N1 = '#f2e4cf'; // cream
const N2 = '#c4b49a'; // tan
const N3 = '#7a6a52'; // dark tan
const N4 = '#2a1f10'; // very dark

// accent (amber)
const A1 = '#ffd97a'; // gold highlight
const A2 = '#d4a017'; // amber
const A3 = '#8a6200'; // dark amber

// red
const R1 = '#f47a7a'; // light red
const R2 = '#d03030'; // red
const R3 = '#8a1010'; // dark red

// gray
const GR1 = '#c8c8c8';
const GR2 = '#888888';
const GR3 = '#444444';

// More colors
const CY1 = '#a0f0f0'; // cyan light
const CY2 = '#30d0d0'; // cyan
const CY3 = '#108888'; // dark cyan
const OR2 = '#e06020'; // orange
const WH  = '#ffffff'; // pure white (unused but kept for completeness)

// ── Pixel art grids (12×12) ───────────────────────────────────────────────────

/** Boné Dev — baseball cap */
export const GRID_BONE_DEV: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  W2, W2, W2, W2, W2, T,  T,  T,  T],
  [T,  T,  W2, W1, W1, W1, W1, W1, W2, T,  T,  T],
  [T,  W3, W2, W1, W1, W1, W1, W2, W3, W3, T,  T],
  [T,  W3, W2, W2, W2, W2, W2, W2, W3, W3, T,  T],
  [T,  W3, W3, W3, W3, W3, W3, W3, W3, W3, T,  T],
  [T,  T,  W3, W3, W3, W3, W3, W3, W3, T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  W4, W4, W4, W4, W4, W4, W4, W4, W4, T,  T],  // brim
  [T,  W4, W3, W3, W3, W3, W3, W3, W3, W4, T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Hoodie Clone — dark hoodie */
export const GRID_HOODIE: Grid = [
  [T,  T,  B3, B3, T,  T,  B3, B3, T,  T,  T,  T],
  [T,  B3, B2, B2, B3, B3, B2, B2, B3, T,  T,  T],
  [T,  B3, B2, B1, B2, B2, B1, B2, B3, T,  T,  T],
  [B3, B2, B2, B2, B2, B2, B2, B2, B2, B3, T,  T],
  [B3, B2, B2, B2, B2, B2, B2, B2, B2, B3, T,  T],
  [B3, B2, B1, B2, B2, B2, B2, B1, B2, B3, T,  T],
  [B3, B2, B2, B3, B2, B2, B3, B2, B2, B3, T,  T],
  [B3, B2, B2, B3, B2, B2, B3, B2, B2, B3, T,  T],
  [B3, B2, B2, B2, B2, B2, B2, B2, B2, B3, T,  T],
  [B3, B2, B2, B2, B2, B2, B2, B2, B2, B3, T,  T],
  [T,  B3, B2, B2, T,  T,  B2, B2, B3, T,  T,  T],
  [T,  T,  B3, B3, T,  T,  B3, B3, T,  T,  T,  T],
];

/** Gorro Hacker — beanie */
export const GRID_GORRO: Grid = [
  [T,  T,  T,  G2, G2, G2, G2, G2, T,  T,  T,  T],
  [T,  T,  G2, G1, G1, G1, G1, G1, G2, T,  T,  T],
  [T,  G2, G1, G2, G1, G1, G2, G1, G2, G2, T,  T],
  [T,  G2, G1, G1, G1, G1, G1, G1, G1, G2, T,  T],
  [T,  G3, G2, G1, G2, G1, G2, G1, G2, G3, T,  T],
  [T,  G3, G2, G2, G2, G2, G2, G2, G2, G3, T,  T],
  [T,  G3, G3, G3, G3, G3, G3, G3, G3, G3, T,  T],
  [T,  G3, G3, G3, G3, G3, G3, G3, G3, G3, T,  T],
  [T,  T,  N2, N2, N2, N2, N2, N2, N2, T,  T,  T],  // fold
  [T,  T,  N3, N2, N3, N2, N3, N2, N3, T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Óculos Hack — glasses */
export const GRID_OCULOS: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  N3, N3, N3, N3, N3, N3, N3, N3, N3, N3, T],
  [N3, B1, B1, B1, N3, N3, N3, B1, B1, B1, N3, T],
  [N3, B1, B2, B1, N3, N3, N3, B1, B2, B1, N3, T],
  [N3, B1, B1, B1, N3, N3, N3, B1, B1, B1, N3, T],
  [T,  N3, N3, N3, N3, N3, N3, N3, N3, N3, N3, T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Planta Desk — desk plant */
export const GRID_PLANTA: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  G1, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  G1, G2, G1, T,  T,  G1, T,  T,  T],
  [T,  T,  G2, G2, G3, G2, G2, G1, G2, T,  T,  T],
  [T,  G1, G2, G3, G2, G3, G2, G2, G1, T,  T,  T],
  [T,  G1, G2, G2, G3, G2, G2, G1, T,  T,  T,  T],
  [T,  T,  T,  G2, G2, G2, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  G3, G2, G3, T,  T,  T,  T,  T,  T],
  [T,  T,  W2, W2, W2, W2, W2, T,  T,  T,  T,  T],  // pot
  [T,  T,  W2, W3, W3, W3, W2, T,  T,  T,  T,  T],
  [T,  T,  W3, W3, W3, W3, W3, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Teclado Mecânico — mechanical keyboard */
export const GRID_TECLADO: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  GR3,GR3,GR3,GR3,GR3,GR3,GR3,GR3,GR3,GR3,T],
  [T,  GR3,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR3,T],
  [T,  GR3,GR1,GR1,GR1,GR1,GR1,GR1,GR1,GR1,GR3,T],
  [T,  GR3,GR2,GR1,GR2,GR1,GR2,GR1,GR2,GR1,GR3,T],  // keys row 1
  [T,  GR3,GR1,GR2,GR1,GR2,A2, GR2,GR1,GR2,GR3,T],  // keys row 2 (accent key)
  [T,  GR3,GR2,GR1,GR2,GR1,GR2,GR1,GR2,GR1,GR3,T],  // keys row 3
  [T,  GR3,GR1,GR2,GR3,GR3,GR3,GR3,GR2,GR1,GR3,T],  // spacebar
  [T,  GR3,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR3,T],
  [T,  GR3,GR3,GR3,GR3,GR3,GR3,GR3,GR3,GR3,GR3,T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Bucket Hat */
export const GRID_BUCKET: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  A2, A2, A2, A2, A2, T,  T,  T,  T],
  [T,  T,  A2, A1, A1, A1, A1, A1, A2, T,  T,  T],
  [T,  A3, A2, A1, A1, A1, A1, A2, A3, T,  T,  T],
  [T,  A3, A2, A2, A2, A2, A2, A2, A3, T,  T,  T],
  [T,  A3, A3, A3, A3, A3, A3, A3, A3, T,  T,  T],
  [A3, A3, A3, A3, A3, A3, A3, A3, A3, A3, T,  T],  // brim
  [A3, A2, A2, A2, A2, A2, A2, A2, A2, A3, T,  T],
  [T,  A3, A3, A3, A3, A3, A3, A3, A3, T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Polo Corporativo */
export const GRID_POLO: Grid = [
  [T,  T,  N2, N2, T,  T,  N2, N2, T,  T,  T,  T],  // collar
  [T,  N2, N1, N1, N3, N3, N1, N1, N2, T,  T,  T],
  [T,  N3, N1, N3, N1, N1, N3, N1, N3, T,  T,  T],
  [N3, N1, N1, N1, N1, N1, N1, N1, N1, N3, T,  T],
  [N3, N1, N1, N1, N1, N1, N1, N1, N1, N3, T,  T],
  [N3, N1, N2, N1, N1, N1, N1, N2, N1, N3, T,  T],  // button strip
  [N3, N1, N1, N1, N1, N1, N1, N1, N1, N3, T,  T],
  [N3, N1, N2, N1, N1, N1, N1, N2, N1, N3, T,  T],
  [N3, N2, N1, N1, N1, N1, N1, N1, N2, N3, T,  T],
  [N3, N2, N1, N1, N1, N1, N1, N1, N2, N3, T,  T],
  [T,  N3, N2, N2, T,  T,  N2, N2, N3, T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Hoodie Hacker (gem — purple) */
export const GRID_HOODIE_PURPLE: Grid = [
  [T,  T,  P3, P3, T,  T,  P3, P3, T,  T,  T,  T],
  [T,  P3, P2, P2, P3, P3, P2, P2, P3, T,  T,  T],
  [T,  P3, P2, P1, P2, P2, P1, P2, P3, T,  T,  T],
  [P3, P2, P2, P2, P2, P2, P2, P2, P2, P3, T,  T],
  [P3, P2, P1, P2, P2, P2, P2, P1, P2, P3, T,  T],
  [P3, P2, P2, P3, P2, P2, P3, P2, P2, P3, T,  T],
  [P3, P2, P2, P3, P2, P2, P3, P2, P2, P3, T,  T],
  [P3, P2, P2, P2, P2, P2, P2, P2, P2, P3, T,  T],
  [P3, P1, P2, P2, P2, P2, P2, P2, P1, P3, T,  T],
  [P3, P2, P2, P2, P2, P2, P2, P2, P2, P3, T,  T],
  [T,  P3, P2, P2, T,  T,  P2, P2, P3, T,  T,  T],
  [T,  T,  P3, P3, T,  T,  P3, P3, T,  T,  T,  T],
];

/** Coroa Dados — dice crown */
export const GRID_COROA: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [A1, T,  T,  A1, T,  T,  A1, T,  T,  A1, T,  T],
  [A1, T,  T,  A1, T,  T,  A1, T,  T,  A1, T,  T],
  [A1, T,  T,  A2, A2, A2, A2, T,  T,  A1, T,  T],
  [A2, A2, A2, A2, A3, A3, A2, A2, A2, A2, T,  T],
  [A2, A3, A2, A3, A1, A1, A3, A2, A3, A2, T,  T],
  [A2, A3, A3, A3, A2, A2, A3, A3, A3, A2, T,  T],
  [A3, A2, A2, A2, A2, A2, A2, A2, A2, A3, T,  T],
  [A3, A3, A3, A3, A3, A3, A3, A3, A3, A3, T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Headset Pro */
export const GRID_HEADSET: Grid = [
  [T,  T,  GR3,GR3,GR3,GR3,GR3,GR3,GR3,T,  T,  T],
  [T,  GR3,GR2,GR2,GR2,GR2,GR2,GR2,GR2,GR3,T,  T],
  [GR3,GR2,T,  T,  T,  T,  T,  T,  T,  GR2,GR3,T],
  [GR3,GR2,T,  T,  T,  T,  T,  T,  T,  GR2,GR3,T],
  [GR3,GR1,GR2,T,  T,  T,  T,  T,  GR2,GR1,GR3,T],
  [GR3,GR1,GR2,T,  T,  T,  T,  T,  GR2,GR1,GR3,T],
  [GR3,GR1,GR2,T,  T,  T,  T,  T,  GR2,GR1,GR3,T],
  [T,  GR3,GR2,T,  T,  T,  T,  T,  GR2,GR3,T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  GR2,T,  T,  T],  // mic
  [T,  T,  T,  T,  T,  T,  T,  GR2,GR3,T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  GR3,T,  T,  T,  T],
];

/** Bg: Matrix — matrix screen */
export const GRID_MATRIX: Grid = [
  [G3, G2, G3, G2, G3, G2, G3, G2, G3, G2, G3, G2],
  [G2, G1, G3, G1, G2, G1, G3, G1, G2, G1, G3, G1],
  [G3, G3, G2, G3, G1, G3, G2, G3, G1, G3, G2, G3],
  [G1, G2, G1, G2, G3, G2, G1, G2, G3, G2, G1, G2],
  [G2, G3, G2, G1, G2, G3, G2, G1, G2, G3, G2, G1],
  [G3, G1, G3, G2, G1, G2, G3, G2, G1, G2, G3, G2],
  [G2, G2, G1, G3, G2, G1, G2, G3, G2, G1, G2, G3],
  [G1, G3, G2, G1, G3, G2, G1, G3, G2, G1, G3, G2],
  [G3, G2, G3, G2, G2, G3, G2, G2, G3, G2, G2, G3],
  [G2, G1, G2, G1, G3, G1, G3, G1, G2, G3, G1, G2],
  [G1, G3, G1, G3, G1, G2, G1, G2, G1, G2, G3, G1],
  [G3, G2, G3, G2, G3, G3, G2, G3, G3, G1, G2, G3],
];

/** c9 - Jaleco Lab (lab coat) */
export const GRID_JALECO: Grid = [
  [T,  N1, N1, N3, T,  T,  N3, N1, N1, T,  T,  T],
  [N1, N1, N1, N3, N3, N3, N3, N1, N1, N1, T,  T],
  [N1, N1, N1, N1, N1, N1, N1, N1, N1, N1, T,  T],
  [N1, T,  N2, N1, N1, N1, N1, N2, T,  N1, T,  T],
  [N1, T,  N1, N1, N1, N1, N1, N1, T,  N1, T,  T],
  [N1, N1, N1, N1, N1, N1, N1, N1, N1, N1, T,  T],
  [N1, N1, N2, N2, N1, N1, N2, N2, N1, N1, T,  T],
  [N1, N1, N2, N2, N1, N1, N2, N2, N1, N1, T,  T],
  [N1, N1, N1, N1, N1, N1, N1, N1, N1, N1, T,  T],
  [N1, N1, N1, N1, N1, N1, N1, N1, N1, N1, T,  T],
  [T,  N1, N1, N1, T,  T,  N1, N1, N1, T,  T,  T],
  [T,  T,  N1, T,  T,  T,  T,  N1, T,  T,  T,  T],
];

/** c10 - Mochila Git (git backpack) */
export const GRID_MOCHILA: Grid = [
  [T,  T,  W2, W2, W2, W2, W2, T,  T,  T,  T,  T],
  [T,  W3, W1, W1, W1, W1, W1, W3, T,  T,  T,  T],
  [W3, W2, W1, W1, W1, W1, W1, W2, W3, T,  T,  T],
  [W3, W2, W1, G2, W1, G2, W1, W2, W3, T,  T,  T],
  [W3, W2, W1, G3, G2, G3, W1, W2, W3, T,  T,  T],
  [W3, W2, W1, W1, G2, W1, W1, W2, W3, T,  T,  T],
  [W3, W2, W1, W1, W1, W1, W1, W2, W3, T,  T,  T],
  [W3, W2, W2, W2, W2, W2, W2, W2, W3, T,  T,  T],
  [W3, W3, W2, W2, W2, W2, W2, W3, W3, T,  T,  T],
  [T,  W3, W3, W3, W3, W3, W3, W3, T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** c11 - Capacete Espacial (space helmet) */
export const GRID_CAPACETE: Grid = [
  [T,  T,  GR2,GR2,GR2,GR2,GR2,GR2,T,  T,  T,  T],
  [T,  GR2,GR1,GR1,GR1,GR1,GR1,GR1,GR2,T,  T,  T],
  [GR2,GR1,GR1,GR1,GR1,GR1,GR1,GR1,GR1,GR2,T,  T],
  [GR2,GR1,B1, B1, B2, B2, B1, B1, GR1,GR2,T,  T],
  [GR2,GR1,B1, B2, B3, B3, B2, B1, GR1,GR2,T,  T],
  [GR2,GR1,B1, B1, B2, B2, B1, B1, GR1,GR2,T,  T],
  [GR2,GR1,GR1,GR1,GR1,GR1,GR1,GR1,GR1,GR2,T,  T],
  [T,  GR3,GR2,GR2,GR2,GR2,GR2,GR2,GR3,T,  T,  T],
  [T,  GR3,GR3,GR3,GR3,GR3,GR3,GR3,GR3,T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** c12 - Caneca Dev (dev mug with "> _") */
export const GRID_CANECA: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  N3, N3, N3, N3, N3, N3, N3, T,  T,  T],
  [T,  N3, N4, N4, N4, N4, N4, N4, N4, N3, T,  T],
  [T,  N3, N4, G2, N4, N4, N4, N4, N4, N3, GR2,T],
  [T,  N3, N4, N4, G2, N4, N4, N4, N4, N3, GR2,T],
  [T,  N3, N4, G2, N4, A2, N4, N4, N4, N3, GR2,T],
  [T,  N3, N4, N4, N4, N4, N4, N4, N4, N3, GR2,T],
  [T,  N3, N4, N4, N4, N4, N4, N4, N4, N3, T,  T],
  [T,  N3, N3, N3, N3, N3, N3, N3, N3, N3, T,  T],
  [T,  T,  N3, N3, N3, N3, N3, N3, N3, T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** c13 - Cachecol Binário (binary scarf) */
export const GRID_CACHECOL: Grid = [
  [T,  T,  N2, N3, N2, N3, N2, T,  T,  T,  T,  T],
  [T,  N2, N3, A2, N3, A2, N3, N2, T,  T,  T,  T],
  [T,  N3, N2, N3, N2, N3, N2, N3, T,  T,  T,  T],
  [T,  N2, N3, N2, N3, N2, N3, N2, T,  T,  T,  T],
  [T,  T,  N3, N2, N3, N2, N3, T,  T,  T,  T,  T],
  [T,  T,  N2, N3, N2, N3, N2, T,  T,  T,  T,  T],
  [T,  T,  T,  N3, N2, N3, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  N2, N3, N2, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  N3, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  N2, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** c14 - Luvas Táticas (fingerless tactical gloves) */
export const GRID_LUVAS: Grid = [
  [T,  N3, N2, T,  T,  N3, N2, T,  T,  T,  T,  T],
  [N3, N2, N2, T,  T,  N3, N2, N2, T,  T,  T,  T],
  [N3, N2, N3, N2, T,  N3, N2, N3, N2, T,  T,  T],
  [N3, N2, N2, N3, T,  N3, N2, N2, N3, T,  T,  T],
  [T,  N3, N2, N2, N3, N3, N2, N2, T,  T,  T,  T],
  [T,  N3, N2, N2, N2, N2, N2, N3, T,  T,  T,  T],
  [T,  N3, N3, N2, N2, N2, N3, N3, T,  T,  T,  T],
  [T,  T,  N3, N2, N2, N2, N3, T,  T,  T,  T,  T],
  [T,  T,  N3, N3, N3, N3, N3, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** c15 - Robô de Mesa (desk companion robot) */
export const GRID_ROBO: Grid = [
  [T,  T,  T,  T,  A2, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  GR2,GR2,GR2,T,  T,  T,  T,  T,  T],
  [T,  T,  GR2,GR1,GR1,GR1,GR2,T,  T,  T,  T,  T],
  [T,  T,  GR2,B2, GR1,B2, GR2,T,  T,  T,  T,  T],
  [T,  T,  GR2,GR1,GR1,GR1,GR2,T,  T,  T,  T,  T],
  [T,  T,  GR2,A2, GR1,A2, GR2,T,  T,  T,  T,  T],
  [T,  GR3,GR2,GR2,GR2,GR2,GR2,GR3,T,  T,  T,  T],
  [T,  GR3,GR2,GR1,GR2,GR1,GR2,GR3,T,  T,  T,  T],
  [T,  GR3,GR2,GR2,GR2,GR2,GR2,GR3,T,  T,  T,  T],
  [T,  T,  GR3,GR2,T,  GR2,GR3,T,  T,  T,  T,  T],
  [T,  T,  GR3,GR3,T,  GR3,GR3,T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** c16 - Faixa de Antena (antenna headband) */
export const GRID_ANTENA: Grid = [
  [T,  T,  T,  T,  A2, T,  A2, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  A2, T,  A2, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  A3, T,  A3, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  A3, T,  A3, T,  T,  T,  T,  T],
  [T,  N2, N2, N2, N3, N2, N3, N2, N2, N2, T,  T],
  [T,  N3, N2, N3, N2, N3, N2, N3, N2, N3, T,  T],
  [T,  N2, N2, N2, N3, N2, N3, N2, N2, N2, T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** g5 - Manto do Void (dark flowing cloak) */
export const GRID_MANTO: Grid = [
  [T,  T,  P3, P3, P3, P3, P3, T,  T,  T,  T,  T],
  [T,  P3, P2, P2, P2, P2, P2, P3, T,  T,  T,  T],
  [T,  P3, P2, P1, P2, P1, P2, P3, T,  T,  T,  T],
  [P3, P2, P2, P2, P2, P2, P2, P2, P3, T,  T,  T],
  [P3, P2, P3, P2, P2, P2, P3, P2, P3, T,  T,  T],
  [P3, P2, P2, P3, P2, P3, P2, P2, P3, T,  T,  T],
  [P3, P3, P2, P2, P2, P2, P2, P3, P3, T,  T,  T],
  [T,  P3, P3, P2, P2, P2, P3, P3, T,  T,  T,  T],
  [T,  P3, P2, P3, P2, P3, P2, P3, T,  T,  T,  T],
  [T,  T,  P3, P2, P2, P2, P3, T,  T,  T,  T,  T],
  [T,  T,  T,  P3, P2, P3, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  P3, T,  T,  T,  T,  T,  T,  T],
];

/** g6 - Armadura Neon (neon cyan chest piece) */
export const GRID_ARMADURA: Grid = [
  [T,  T,  CY3,CY2,CY2,CY2,CY3,T,  T,  T,  T,  T],
  [T,  CY3,CY2,CY1,CY1,CY1,CY2,CY3,T,  T,  T,  T],
  [CY3,CY2,CY1,CY2,CY1,CY2,CY1,CY2,CY3,T,  T,  T],
  [CY3,CY2,CY2,CY1,CY2,CY1,CY2,CY2,CY3,T,  T,  T],
  [CY3,CY2,CY1,CY2,CY3,CY3,CY2,CY1,CY3,T,  T,  T],
  [CY3,CY2,CY2,CY1,CY3,CY3,CY1,CY2,CY3,T,  T,  T],
  [CY3,CY2,CY1,CY2,CY2,CY2,CY2,CY1,CY3,T,  T,  T],
  [T,  CY3,CY2,CY2,CY2,CY2,CY2,CY3,T,  T,  T,  T],
  [T,  CY3,CY2,CY1,T,  T,  CY1,CY3,T,  T,  T,  T],
  [T,  T,  CY3,CY2,T,  T,  CY2,CY3,T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** g7 - Lâmina de Plasma (plasma blade) */
export const GRID_LAMINA: Grid = [
  [T,  T,  T,  T,  T,  P1, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  P1, P2, P1, T,  T,  T,  T,  T],
  [T,  T,  T,  P1, P2, P3, P2, P1, T,  T,  T,  T],
  [T,  T,  P1, P2, P2, P3, P2, P2, P1, T,  T,  T],
  [T,  P1, P2, P2, P3, P2, P3, P2, P2, T,  T,  T],
  [T,  T,  P1, P2, P2, P3, P2, P2, P1, T,  T,  T],
  [T,  T,  T,  P1, P2, P2, P2, P1, T,  T,  T,  T],
  [T,  T,  T,  T,  P1, P2, P1, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  GR2,GR1,GR2,T,  T,  T,  T,  T],
  [T,  T,  T,  T,  GR3,GR2,GR3,T,  T,  T,  T,  T],
  [T,  T,  T,  T,  GR3,GR2,GR3,T,  T,  T,  T,  T],
  [T,  T,  T,  W2, W3, W2, W3, W2, T,  T,  T,  T],
];

/** g8 - Drone Vigília (surveillance drone top-down) */
export const GRID_DRONE: Grid = [
  [GR1,GR2,T,  T,  T,  T,  T,  T,  GR2,GR1,T,  T],
  [GR2,GR3,T,  T,  T,  T,  T,  T,  GR3,GR2,T,  T],
  [T,  T,  GR2,GR2,GR2,GR2,GR2,GR2,T,  T,  T,  T],
  [T,  T,  GR2,B2, B3, B3, B2, GR2,T,  T,  T,  T],
  [T,  T,  GR2,B3, A2, A2, B3, GR2,T,  T,  T,  T],
  [T,  T,  GR2,B2, B3, B3, B2, GR2,T,  T,  T,  T],
  [T,  T,  GR2,GR2,GR2,GR2,GR2,GR2,T,  T,  T,  T],
  [GR2,GR3,T,  T,  T,  T,  T,  T,  GR3,GR2,T,  T],
  [GR1,GR2,T,  T,  T,  T,  T,  T,  GR2,GR1,T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** g9 - Bg: Circuito (circuit board traces) */
export const GRID_CIRCUITO: Grid = [
  [N4, N4, G3, N4, N4, N4, G3, N4, N4, N4, G3, N4],
  [N4, N4, G2, N4, N4, N4, G2, N4, N4, N4, G2, N4],
  [G3, G2, G1, G2, G3, G2, G1, G2, G3, G2, G1, N4],
  [N4, N4, G2, N4, G3, N4, G2, N4, G3, N4, G2, N4],
  [N4, N4, G3, G2, G1, G2, G3, N4, G2, G3, G2, N4],
  [N4, N4, N4, N4, G2, N4, N4, N4, G2, N4, N4, N4],
  [G3, G2, G3, N4, G2, N4, G3, G2, G1, G2, G3, N4],
  [N4, N4, G2, N4, G3, N4, N4, N4, G2, N4, G2, N4],
  [N4, G3, G2, G3, G2, G3, N4, N4, G2, N4, G3, N4],
  [N4, G2, N4, N4, N4, G2, N4, G3, G2, G3, G2, N4],
  [G3, G2, G3, N4, N4, G3, N4, G2, N4, N4, G3, N4],
  [N4, N4, G3, N4, N4, N4, N4, G3, N4, N4, N4, N4],
];

/** g10 - Bg: Cosmos (space background) */
export const GRID_COSMOS: Grid = [
  [N4, N4, N4, N1, N4, N4, N4, N4, N1, N4, N4, N4],
  [N4, N1, N4, N4, N4, N4, N4, N4, N4, N4, N1, N4],
  [N4, N4, N4, N4, P1, P2, P1, N4, N4, N4, N4, N4],
  [N4, N4, N4, P2, P3, P2, P3, P2, N4, N4, N4, N1],
  [N4, N4, P1, P2, P2, P3, P2, P1, N4, N4, N4, N4],
  [N1, N4, N4, P1, P2, P2, P1, N4, N4, N4, N4, N4],
  [N4, N4, N4, N4, N1, N4, N4, N4, N1, N4, N4, N4],
  [N4, N4, N4, N4, N4, N4, N4, N4, N4, N4, N4, N4],
  [N4, B2, B3, B2, N4, N4, N4, N4, N4, N1, N4, N4],
  [N4, B3, B1, B3, N4, N4, N4, N4, N4, N4, N4, N4],
  [N4, B2, B3, B2, N4, N1, N4, N4, N4, N4, N1, N4],
  [N4, N4, N4, N4, N4, N4, N4, N4, N4, N4, N4, N4],
];

/** g11 - Tiara Neural (neural interface headband) */
export const GRID_TIARA: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  CY2,T,  T,  CY2,T,  T,  CY2,T,  T,  T],
  [T,  CY3,CY1,CY3,CY3,CY1,CY3,CY3,CY1,CY3,T,  T],
  [T,  CY3,CY2,CY3,CY3,CY2,CY3,CY3,CY2,CY3,T,  T],
  [T,  CY3,CY1,CY3,CY3,CY1,CY3,CY3,CY1,CY3,T,  T],
  [T,  T,  CY2,T,  T,  CY2,T,  T,  CY2,T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** g12 - Cubo Quântico (quantum wireframe cube isometric) */
export const GRID_CUBO: Grid = [
  [T,  T,  T,  T,  CY2,CY2,T,  T,  T,  T,  T,  T],
  [T,  T,  T,  CY2,CY1,CY1,CY2,T,  T,  T,  T,  T],
  [T,  T,  CY2,CY1,CY1,CY1,CY1,CY2,T,  T,  T,  T],
  [T,  CY2,CY1,CY1,CY2,CY2,CY1,CY1,CY2,T,  T,  T],
  [T,  CY2,CY1,CY2,CY3,CY3,CY2,CY1,CY2,T,  T,  T],
  [T,  CY2,CY2,CY3,CY3,CY3,CY3,CY2,CY2,T,  T,  T],
  [T,  CY2,CY3,CY3,CY3,CY3,CY3,CY3,CY2,T,  T,  T],
  [T,  CY3,CY2,CY3,CY2,CY2,CY3,CY2,CY3,T,  T,  T],
  [T,  T,  CY3,CY2,CY3,CY3,CY2,CY3,T,  T,  T,  T],
  [T,  T,  T,  CY3,CY2,CY2,CY3,T,  T,  T,  T,  T],
  [T,  T,  T,  T,  CY3,CY3,T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** g13 - Escudo de Bits (bit shield) */
export const GRID_ESCUDO: Grid = [
  [T,  T,  B2, B2, B2, B2, B2, B2, T,  T,  T,  T],
  [T,  B2, B1, B1, B1, B1, B1, B1, B2, T,  T,  T],
  [B2, B1, B3, B1, B3, B3, B1, B3, B1, B2, T,  T],
  [B2, B1, B1, B3, B1, B1, B3, B1, B1, B2, T,  T],
  [B2, B1, B3, B1, B1, B1, B1, B3, B1, B2, T,  T],
  [B2, B1, B1, B1, A2, A2, B1, B1, B1, B2, T,  T],
  [B2, B1, B3, B1, A1, A2, B1, B3, B1, B2, T,  T],
  [T,  B2, B1, B1, B1, B1, B1, B1, B2, T,  T,  T],
  [T,  T,  B2, B1, B1, B1, B1, B2, T,  T,  T,  T],
  [T,  T,  T,  B2, B1, B1, B2, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  B2, B2, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** g14 - Bastão de Void (void staff) */
export const GRID_BASTAO: Grid = [
  [T,  T,  T,  T,  P1, P2, P1, T,  T,  T,  T,  T],
  [T,  T,  T,  P1, P2, P3, P2, P1, T,  T,  T,  T],
  [T,  T,  T,  P2, P3, P1, P3, P2, T,  T,  T,  T],
  [T,  T,  T,  P1, P2, P3, P2, P1, T,  T,  T,  T],
  [T,  T,  T,  T,  P1, P2, P1, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  N3, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  N3, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  N3, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  N3, N2, N3, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  N3, N2, N3, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  N3, N2, N3, T,  T,  T,  T,  T],
  [T,  T,  T,  W3, W2, W1, W2, W3, T,  T,  T,  T],
];

/** ch1 - Kit Iniciante (starter kit box) */
export const GRID_KIT: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  W3, W3, W3, W3, W3, W3, W3, W3, T,  T,  T],
  [T,  W3, A2, A2, A2, A2, A2, A2, W3, T,  T,  T],
  [T,  W3, A2, A1, A1, A1, A2, A2, W3, T,  T,  T],
  [T,  W3, A2, A1, T,  T,  A1, A2, W3, T,  T,  T],
  [T,  W3, A2, A1, T,  T,  A1, A2, W3, T,  T,  T],
  [T,  W3, A2, A1, A1, A1, A2, A2, W3, T,  T,  T],
  [T,  W3, A2, A2, A2, A2, A2, A2, W3, T,  T,  T],
  [T,  W3, W3, W3, W3, W3, W3, W3, W3, T,  T,  T],
  [T,  T,  W2, W2, W2, W2, W2, W2, T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** ch2 - Pato Depurador (debugging rubber duck) */
export const GRID_PATO: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  A1, A1, A1, A1, T,  T,  T,  T,  T,  T],
  [T,  A1, A2, A2, A2, A2, A1, T,  T,  T,  T,  T],
  [A1, A2, A2, N4, A2, A2, A2, A1, T,  T,  T,  T],
  [A1, A2, A2, A2, A2, A2, A2, A1, T,  T,  T,  T],
  [A1, A2, A2, A2, A2, A2, A2, OR2,OR2,T,  T,  T],
  [A1, A2, A2, A2, A2, A2, A2, OR2,OR2,T,  T,  T],
  [T,  A1, A2, A2, A2, A2, A1, T,  T,  T,  T,  T],
  [T,  A1, A1, A2, A2, A1, A1, T,  T,  T,  T,  T],
  [T,  T,  A1, A1, A1, A1, T,  T,  T,  T,  T,  T],
  [T,  T,  OR2,OR2,OR2,OR2,T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** ch3 - Troféu de Ouro (gold trophy) */
export const GRID_TROFEU: Grid = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  A1, A1, A1, A1, A1, T,  T,  T,  T,  T],
  [T,  A1, A2, A2, A2, A2, A2, A1, T,  T,  T,  T],
  [A1, A2, A1, A2, A1, A2, A1, A2, A1, T,  T,  T],
  [A1, A2, A2, A2, A2, A2, A2, A2, A1, T,  T,  T],
  [T,  A1, A2, A2, A2, A2, A2, A1, T,  T,  T,  T],
  [T,  T,  A1, A2, A2, A2, A1, T,  T,  T,  T,  T],
  [T,  T,  T,  A2, A2, A2, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  A3, A2, A3, T,  T,  T,  T,  T,  T],
  [T,  T,  A3, A2, A2, A2, A3, T,  T,  T,  T,  T],
  [T,  T,  A3, A3, A3, A3, A3, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** ch4 - Ampulheta Hacker */
export const GRID_AMPULHETA: Grid = [
  [T,  T,  GR3,GR3,GR3,GR3,GR3,GR3,T,  T,  T,  T],
  [T,  T,  GR3,GR2,GR2,GR2,GR2,GR3,T,  T,  T,  T],
  [T,  T,  T,  GR3,G2, G2, GR3,T,  T,  T,  T,  T],
  [T,  T,  T,  T,  GR3,G2, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  G2, GR3,T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  G2, G3, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  G3, G2, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  GR3,A2, A2, GR3,T,  T,  T,  T,  T],
  [T,  T,  T,  GR3,A1, A2, A1, GR3,T,  T,  T,  T],
  [T,  T,  GR3,A2, A1, A2, A1, A2, GR3,T,  T,  T],
  [T,  T,  GR3,GR2,GR2,GR2,GR2,GR2,GR3,T,  T,  T],
  [T,  T,  GR3,GR3,GR3,GR3,GR3,GR3,T,  T,  T,  T],
];

/** ch5 - Robô de Batalha (battle robot) */
export const GRID_ROBO_BATALHA: Grid = [
  [T,  T,  GR3,GR3,GR3,GR3,GR3,GR3,T,  T,  T,  T],
  [T,  GR3,GR2,R2, GR1,GR1,R2, GR2,GR3,T,  T,  T],
  [T,  GR3,GR1,GR2,GR1,GR1,GR2,GR1,GR3,T,  T,  T],
  [T,  GR3,GR1,GR1,GR1,GR1,GR1,GR1,GR3,T,  T,  T],
  [GR3,GR2,GR1,A2, GR2,GR2,A2, GR1,GR2,GR3,T,  T],
  [GR3,GR2,GR2,GR1,GR2,GR2,GR1,GR2,GR2,GR3,T,  T],
  [GR3,GR2,GR1,GR2,GR2,GR2,GR2,GR1,GR2,GR3,T,  T],
  [T,  GR3,GR2,GR2,GR2,GR2,GR2,GR2,GR3,T,  T,  T],
  [T,  GR3,GR2,T,  GR3,GR3,T,  GR2,GR3,T,  T,  T],
  [T,  T,  GR3,T,  GR3,GR3,T,  GR3,T,  T,  T,  T],
  [T,  T,  GR3,GR2,T,  T,  GR2,GR3,T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** ch6 - Espada Binária (binary sword) */
export const GRID_ESPADA: Grid = [
  [T,  T,  T,  T,  T,  A1, T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  A1, A2, A1, T,  T,  T,  T,  T],
  [T,  T,  T,  A1, A2, A1, T,  T,  T,  T,  T,  T],
  [T,  T,  A1, A2, A1, T,  T,  T,  T,  T,  T,  T],
  [T,  A1, A2, A1, T,  T,  T,  T,  T,  T,  T,  T],
  [A1, A2, A3, A1, A1, T,  T,  T,  T,  T,  T,  T],
  [T,  A1, A2, A3, A1, A1, T,  T,  T,  T,  T,  T],
  [T,  T,  A1, A2, A1, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  N3, N2, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  N3, N2, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  N3, N2, T,  T,  T,  T,  T,  T,  T],
  [T,  T,  W3, W2, W2, W3, T,  T,  T,  T,  T,  T],
];

// ── Map item id → grid ────────────────────────────────────────────────────────
const GRIDS: Record<string, Grid> = {
  // existing coin
  c1: GRID_BONE_DEV, c2: GRID_HOODIE, c3: GRID_GORRO, c4: GRID_OCULOS,
  c5: GRID_PLANTA,   c6: GRID_TECLADO, c7: GRID_BUCKET, c8: GRID_POLO,
  // new coin
  c9: GRID_JALECO, c10: GRID_MOCHILA, c11: GRID_CAPACETE, c12: GRID_CANECA,
  c13: GRID_CACHECOL, c14: GRID_LUVAS, c15: GRID_ROBO, c16: GRID_ANTENA,
  // existing gem
  g1: GRID_HOODIE_PURPLE, g2: GRID_COROA, g3: GRID_MATRIX, g4: GRID_HEADSET,
  // new gem
  g5: GRID_MANTO, g6: GRID_ARMADURA, g7: GRID_LAMINA, g8: GRID_DRONE,
  g9: GRID_CIRCUITO, g10: GRID_COSMOS, g11: GRID_TIARA, g12: GRID_CUBO,
  g13: GRID_ESCUDO, g14: GRID_BASTAO,
  // challenge
  ch1: GRID_KIT, ch2: GRID_PATO, ch3: GRID_TROFEU, ch4: GRID_AMPULHETA,
  ch5: GRID_ROBO_BATALHA, ch6: GRID_ESPADA,
};

// ── Export ────────────────────────────────────────────────────────────────────
export function PixelItem({ id, size = 80 }: { id: string; size?: number }) {
  const grid = GRIDS[id];
  if (!grid) return null;
  return <PixelArt grid={grid} size={size} />;
}
