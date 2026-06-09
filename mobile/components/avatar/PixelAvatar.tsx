import React from 'react';
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

// Cor-assinatura de cada cosmético da loja (key → hex). Usada pra tingir os
// overlays do avatar (chapéu/óculos/acessório) e recolorir a camisa.
const COSMETIC_COLOR: Record<string, string> = {
  c1:'#9b7a42', c2:'#3a82f7', c3:'#5a9e40', c4:'#3a82f7', c5:'#5a9e40', c6:'#888888',
  c7:'#d4a017', c8:'#c4b49a', c9:'#f2e4cf', c10:'#9b7a42', c11:'#7ab4e8', c12:'#7a6a52',
  c13:'#b8a090', c14:'#7a6a52', c15:'#888888', c16:'#a08060',
  g1:'#9b59f7', g2:'#d4a017', g3:'#5a9e40', g4:'#888888', g5:'#8b5cf6', g6:'#30d0d0',
  g7:'#9b59f7', g8:'#3a82f7', g9:'#16a34a', g10:'#7ab4e8', g11:'#30d0d0', g12:'#30d0d0',
  g13:'#3a82f7', g14:'#8b5cf6',
  t1:'#d03030', t2:'#2c2c34', t3:'#d03030', t4:'#16a34a', t5:'#d03030', t6:'#16a34a',
  t7:'#16a34a', t8:'#ff2d95',
  // Desbloqueáveis (conquistas/desafios) — todos ACCESSORY.
  ch1:'#9a876c', ch2:'#3a82f7', ch3:'#c08a00', ch4:'#8b5cf6', ch5:'#30d0d0', ch6:'#ff2d95',
};

// Legado: chaves antigas de camisa (mantidas por compat).
const SHIRT_COLORS: Record<string, string> = {
  'shirt-bash':'#2a3a5a', 'shirt-hoodie-hack':'#3a2a4a', 'shirt-flame':'#f0a500',
  'shirt-ghost':'#1a1a2a', 'shirt-corp':'#e8e0d0', 'shirt-sunset':'#c84040',
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

// Escurece um hex por um fator (0..1).
function darken(hex: string, f = 0.6): string {
  const m = hex.replace('#', '');
  const r = Math.round(parseInt(m.slice(0, 2), 16) * f);
  const g = Math.round(parseInt(m.slice(2, 4), 16) * f);
  const b = Math.round(parseInt(m.slice(4, 6), 16) * f);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// Overlays por categoria como listas de pixels [row, col, tone] (1=base, 2=dark).
// HAT: boné cobrindo o topo da cabeça. GLASSES: armação sobre os olhos.
// ACCESSORY: pequeno item ao lado do corpo.
type Px = [number, number, 1 | 2];
const HAT_OVERLAY: Px[] = [
  [0,5,1],[0,6,1],[0,7,1],[0,8,1],[0,9,1],[0,10,1],
  [1,4,1],[1,5,1],[1,6,1],[1,7,1],[1,8,1],[1,9,1],[1,10,1],[1,11,1],
  [2,2,2],[2,3,2],[2,4,2],[2,5,2],[2,6,2],[2,7,2],[2,8,2],[2,9,2],[2,10,2],[2,11,2],
];
// GLASSES: faixa larga sobre os olhos (cols 4–10) — visível como óculos.
const GLASSES_OVERLAY: Px[] = [
  [4,4,2],[4,5,1],[4,6,2],[4,7,1],[4,8,2],[4,9,1],[4,10,2],
];
// ACCESSORY: emblema/medalha no centro do peito — claramente visível
// (antes eram 4 pixels na lateral, quase imperceptíveis).
const ACCESSORY_OVERLAY: Px[] = [
  [8,6,2],[8,9,2],          // alças sobre os ombros
  [9,7,1],[9,8,1],          // medalha (cor viva)
  [10,7,2],[10,8,2],        // base da medalha (escura)
];

const OVERLAYS: Record<string, Px[]> = {
  HAT: HAT_OVERLAY,
  GLASSES: GLASSES_OVERLAY,
  ACCESSORY: ACCESSORY_OVERLAY,
};

export interface EquippedMap {
  HAT?: string;
  SHIRT?: string;
  GLASSES?: string;
  ACCESSORY?: string;
  BACKGROUND?: string;
}

interface Props {
  size?: number;
  variant?: number;
  equippedShirt?: string | null; // legado
  equipped?: EquippedMap | null;
}

function PixelAvatar({
  size = 64,
  variant = 0,
  equippedShirt = null,
  equipped = null,
}: Props) {
  const ps = size / 16;
  const pal = [...PALS[variant % PALS.length]];

  // Camisa: legado (equippedShirt) ou cosmético equipado.
  if (equippedShirt && SHIRT_COLORS[equippedShirt]) pal[4] = SHIRT_COLORS[equippedShirt];
  if (equipped?.SHIRT && COSMETIC_COLOR[equipped.SHIRT]) pal[4] = COSMETIC_COLOR[equipped.SHIRT];

  const pixels: React.ReactElement[] = [];
  const push = (rx: number, ry: number, color: string, key: string) =>
    pixels.push(<Rect key={key} x={rx * ps} y={ry * ps} width={ps + 0.4} height={ps + 0.4} fill={color} />);

  // Base (corpo).
  PX.forEach((row, ry) => {
    row.forEach((v, rx) => {
      if (!v) return;
      const color = pal[v];
      if (color) push(rx, ry, color, `b-${ry}-${rx}`);
    });
  });

  // Overlays equipados (chapéu, óculos, acessório).
  if (equipped) {
    (['HAT', 'GLASSES', 'ACCESSORY'] as const).forEach((cat) => {
      const key = equipped[cat];
      if (!key) return;
      const base = COSMETIC_COLOR[key];
      if (!base) return;
      const dark = darken(base, 0.62);
      OVERLAYS[cat].forEach(([ry, rx, tone], i) =>
        push(rx, ry, tone === 2 ? dark : base, `o-${cat}-${i}`),
      );
    });
  }

  // Fundo equipado: preenche atrás do personagem (sutil).
  const bgKey = equipped?.BACKGROUND;
  const bgColor = bgKey ? COSMETIC_COLOR[bgKey] : null;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {bgColor && <Rect x={0} y={0} width={size} height={size} fill={bgColor} opacity={0.32} />}
        {pixels}
      </Svg>
    </View>
  );
}

// Compara o equipped por conteúdo (não por referência) — assim `?? {}` ou um
// objeto novo com os mesmos itens não dispara re-render desnecessário.
function sameEquipped(a?: EquippedMap | null, b?: EquippedMap | null): boolean {
  if (a === b) return true;
  const x = a ?? {};
  const y = b ?? {};
  return (
    x.HAT === y.HAT &&
    x.SHIRT === y.SHIRT &&
    x.GLASSES === y.GLASSES &&
    x.ACCESSORY === y.ACCESSORY &&
    x.BACKGROUND === y.BACKGROUND
  );
}

// memo: o avatar só re-renderiza se size/variant/camisa/equipados mudarem de fato.
export default React.memo(PixelAvatar, (prev, next) =>
  prev.size === next.size &&
  prev.variant === next.variant &&
  prev.equippedShirt === next.equippedShirt &&
  sameEquipped(prev.equipped, next.equipped),
);
