import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

// ── Palettes (6 skin tones) ───────────────────────────────────────────────────
const PALS: Array<Array<string | null>> = [
  [null,'#180c04','#c48a5a','#0d0806','#d4673a','#2a3040','#4a9a80','#241408'],
  [null,'#0e0a06','#a87040','#0d0806','#2e3a5a','#2a3040','#5a8aaa','#241408'],
  [null,'#0a0604','#7a4a28','#050304','#8b5cf6','#2a3040','#7a5aaa','#241408'],
  [null,'#1a1008','#e8b888','#0d0806','#3a6a40','#2a3040','#5aaa70','#281808'],
  [null,'#0e0a04','#b87848','#0d0806','#8a2a2a','#2a3040','#aa5a5a','#241408'],
  [null,'#180e08','#f0c898','#100808','#2a6878','#2a3040','#3ab0a0','#1a1a28'],
];

const SHIRT_COLORS: Record<string, string> = {
  'shirt-bash':        '#2a3a5a',
  'shirt-hoodie-hack': '#3a2a4a',
  'shirt-flame':       '#f0a500',
  'shirt-ghost':       '#1a1a2a',
  'shirt-corp':        '#e8e0d0',
  'shirt-sunset':      '#c84040',
};

// 16x16 pixel grid — 0=transparent, 1-7=palette index
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
];

interface Props {
  size?: number;
  variant?: number;
  equippedShirt?: string | null;
}

export default function PixelAvatar({ size = 64, variant = 0, equippedShirt = null }: Props) {
  const ps = size / 16;
  const pal = [...PALS[variant % PALS.length]];
  if (equippedShirt && SHIRT_COLORS[equippedShirt]) pal[4] = SHIRT_COLORS[equippedShirt];

  const pixels: React.ReactElement[] = [];
  PX.forEach((row, ry) => {
    row.forEach((v, rx) => {
      if (!v) return;
      const color = pal[v];
      if (!color) return;
      pixels.push(
        <Rect
          key={`${ry}-${rx}`}
          x={rx * ps}
          y={ry * ps}
          width={ps}
          height={ps}
          fill={color}
        />
      );
    });
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {pixels}
      </Svg>
    </View>
  );
}
