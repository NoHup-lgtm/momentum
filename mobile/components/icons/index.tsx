import React, { useMemo } from 'react';
import Svg, { Path, Circle, Line, Polygon, Rect, G, Text as SvgText } from 'react-native-svg';
import { C } from '../../constants/design';

// ── Flame ─────────────────────────────────────────────────────────────────────
export function FlameIcon({ size = 24, glowing = false }: { size?: number; glowing?: boolean }) {
  const color = glowing ? C.accent : C.text3;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C12 2 7 7 7 13C7 16.31 9.69 19 13 19C16.31 19 19 16.31 19 13C19 10 17 8 17 8C17 8 16 11 14 11C14 11 15 9 13 7C13 7 13 10 11 11C9 12 8 10 8 8C8 8 7 10 7 13"
        fill={color}
        opacity={glowing ? 1 : 0.5}
      />
    </Svg>
  );
}

// ── XP ────────────────────────────────────────────────────────────────────────
export function XPIcon({ size = 14, color = C.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Polygon points="7,1 8.8,5.4 13.5,5.4 9.9,8.3 11.2,13 7,10.2 2.8,13 4.1,8.3 0.5,5.4 5.2,5.4" fill={color}/>
    </Svg>
  );
}

// ── Coin ──────────────────────────────────────────────────────────────────────
export function CoinIcon({ size = 16, color = C.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" fill={color} opacity={0.9}/>
      <Circle cx="8" cy="8" r="5" fill="none" stroke="#140e08" strokeWidth="1.2"/>
      <Path d="M7 6h2c.55 0 1 .45 1 1s-.45 1-1 1H7v2" stroke="#140e08" strokeWidth="1.2" strokeLinecap="round"/>
      <Path d="M7 6v4" stroke="#140e08" strokeWidth="1.2" strokeLinecap="round"/>
    </Svg>
  );
}

// ── Gem ───────────────────────────────────────────────────────────────────────
export function GemIcon({ size = 16, color = C.purple }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 2L13 6L8 14L3 6Z" fill={color} opacity={0.9}/>
      <Path d="M3 6L8 2L13 6" stroke={color} strokeWidth="0.8" opacity={0.5}/>
      <Path d="M5.5 6L8 3L10.5 6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
    </Svg>
  );
}

// ── Spiral logo — 1.75 turns, 120 segments, growing stroke (matches brand SVG) ─
export function SpiralIcon({ size = 48, color = C.accent }: { size?: number; color?: string }) {
  const lines = useMemo(() => {
    const SEGS = 120;
    const cx = size / 2, cy = size / 2;
    const maxR = size * 0.43, minR = size * 0.04;
    const minSW = 0.008 * size, maxSW = 0.083 * size;
    const pts: [number, number][] = [];
    for (let i = 0; i <= SEGS; i++) {
      const t = i / SEGS;
      const a = -Math.PI / 2 + t * 1.75 * 2 * Math.PI;
      const r = minR + (maxR - minR) * t;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts.slice(0, -1).map((p, i) => ({
      x1: p[0], y1: p[1], x2: pts[i + 1][0], y2: pts[i + 1][1],
      sw: minSW + (maxSW - minSW) * (i / (SEGS - 1)),
    }));
  }, [size]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {lines.map((l, i) => (
        <Line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={color} strokeWidth={l.sw} strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}

// ── Momentum Wordmark (spiral + "momentum" in Lora) ───────────────────────────
// Matches momentum-logo-dark.svg layout: icon left, wordmark text right
export function MomentumWordmark({
  height = 44,
  color = C.accent,
  textColor = C.text,
}: {
  height?: number;
  color?: string;
  textColor?: string;
}) {
  const iconSize = height;
  const gap = height * 0.35;
  const fontSize = height * 0.75;
  // Approximate text width for "momentum" at this font size (8 chars × ~0.52em)
  const textW = fontSize * 5.8;
  const totalW = iconSize + gap + textW;

  return (
    <Svg width={totalW} height={height} viewBox={`0 0 ${totalW} ${height}`}>
      {/* Spiral on the left */}
      <G>
        <SpiralIconPaths size={iconSize} color={color} />
      </G>
      {/* "momentum" wordmark */}
      <SvgText
        x={iconSize + gap}
        y={height * 0.68}
        fontSize={fontSize}
        fontFamily="Georgia, serif"
        fill={textColor}
        letterSpacing={1.5}
      >
        momentum
      </SvgText>
    </Svg>
  );
}

// Internal helper — renders spiral paths into an existing SVG context
function SpiralIconPaths({ size, color }: { size: number; color: string }) {
  const SEGS = 120;
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.43, minR = size * 0.04;
  const minSW = 0.008 * size, maxSW = 0.083 * size;
  const pts: [number, number][] = [];
  for (let i = 0; i <= SEGS; i++) {
    const t = i / SEGS;
    const a = -Math.PI / 2 + t * 1.75 * 2 * Math.PI;
    const r = minR + (maxR - minR) * t;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return (
    <>
      {pts.slice(0, -1).map((p, i) => (
        <Line
          key={i}
          x1={p[0]} y1={p[1]} x2={pts[i + 1][0]} y2={pts[i + 1][1]}
          stroke={color}
          strokeWidth={minSW + (maxSW - minSW) * (i / (SEGS - 1))}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

// ── Ice Crystal (replaces 🧊) ─────────────────────────────────────────────────
export function IceIcon({ size = 20, color = '#7ab4e8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Polygon points="10,1 19,10 10,19 1,10" fill={color} opacity={0.85} />
      <Polygon points="10,5 15,10 10,15 5,10" fill="rgba(255,255,255,0.25)" />
      <Line x1="10" y1="1" x2="10" y2="19" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <Line x1="1"  y1="10" x2="19" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <Line x1="4"  y1="4"  x2="16" y2="16" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      <Line x1="16" y1="4"  x2="4"  y2="16" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
    </Svg>
  );
}

// ── Lightning (replaces ⚡) ────────────────────────────────────────────────────
export function LightningIcon({ size = 20, color = '#ffd97a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M12 2L4 11h6l-2 7 8-9h-6l2-7z" fill={color} />
    </Svg>
  );
}

// ── Trophy (replaces 🏆) ──────────────────────────────────────────────────────
export function TrophyIcon({ size = 20, color = '#d4a017' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Cup */}
      <Path d="M5 3h10v7a5 5 0 01-10 0V3z" fill={color} opacity={0.9} />
      {/* Handles */}
      <Path d="M5 5H3a2 2 0 000 4h2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M15 5h2a2 2 0 010 4h-2" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Stem */}
      <Rect x="9" y="13" width="2" height="3" fill={color} opacity={0.8} />
      {/* Base */}
      <Rect x="6" y="16" width="8" height="1.5" rx="0.5" fill={color} />
      {/* Shine */}
      <Line x1="7.5" y1="5" x2="7.5" y2="11" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Lock Pixel (replaces 🔒) ──────────────────────────────────────────────────
export function LockIcon({ size = 20, color = '#7a6a52' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M7 9V7a3 3 0 016 0v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Rect x="4" y="9" width="12" height="9" rx="2" fill={color} opacity={0.85} />
      <Circle cx="10" cy="13.5" r="1.5" fill="rgba(0,0,0,0.4)" />
      <Rect x="9.2" y="14.5" width="1.6" height="2" rx="0.5" fill="rgba(0,0,0,0.4)" />
    </Svg>
  );
}

// ── Gift Pixel (replaces 🎁) ──────────────────────────────────────────────────
export function GiftIcon({ size = 20, color = '#d4a017' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Box */}
      <Rect x="2" y="9" width="16" height="9" rx="1" fill={color} opacity={0.8} />
      {/* Lid */}
      <Rect x="2" y="7" width="16" height="3" rx="1" fill={color} />
      {/* Ribbon vertical */}
      <Rect x="9" y="7" width="2" height="11" fill="rgba(255,255,255,0.35)" />
      {/* Ribbon horizontal */}
      <Rect x="2" y="8" width="16" height="1.5" fill="rgba(255,255,255,0.35)" />
      {/* Bow left */}
      <Path d="M10 7 C8 5 5 5 6 7 C7 9 10 8 10 7z" fill="rgba(255,255,255,0.5)" />
      {/* Bow right */}
      <Path d="M10 7 C12 5 15 5 14 7 C13 9 10 8 10 7z" fill="rgba(255,255,255,0.5)" />
    </Svg>
  );
}

// ── Crown Pixel (replaces 👑) ─────────────────────────────────────────────────
export function CrownIcon({ size = 20, color = '#d4a017' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M2 15 L2 7 L6 11 L10 4 L14 11 L18 7 L18 15 Z" fill={color} opacity={0.9} />
      <Rect x="2" y="15" width="16" height="2" rx="0.5" fill={color} />
      <Circle cx="10" cy="5" r="1.2" fill="rgba(255,255,255,0.7)" />
      <Circle cx="2.5" cy="8" r="1" fill="rgba(255,255,255,0.5)" />
      <Circle cx="17.5" cy="8" r="1" fill="rgba(255,255,255,0.5)" />
    </Svg>
  );
}

// ── Moon (replaces 🌙) ────────────────────────────────────────────────────────
export function MoonIcon({ size = 20, color = '#c8b8f0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M15 10a7 7 0 11-7-7 5 5 0 007 7z" fill={color} opacity={0.9} />
    </Svg>
  );
}

// ── Sunrise (replaces 🌄/🌅) ──────────────────────────────────────────────────
export function SunriseIcon({ size = 20, color = '#d4a017' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Sun arc */}
      <Path d="M4 13a6 6 0 0112 0" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Rays */}
      <Line x1="10" y1="2"   x2="10" y2="4.5"  stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="3.5" y1="5.5" x2="5.2" y2="7.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="16.5" y1="5.5" x2="14.8" y2="7.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="1.5" y1="11" x2="4" y2="11"  stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="18.5" y1="11" x2="16" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Horizon */}
      <Line x1="1" y1="14" x2="19" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

// ── Shield (replaces 🏕 for "fundador") ───────────────────────────────────────
export function ShieldIcon({ size = 20, color = '#9b59f7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 2L3 5v6c0 4 3.5 6.5 7 7.5 3.5-1 7-3.5 7-7.5V5z" fill={color} opacity={0.85} />
      <Path d="M10 4L5 6.5v4.5c0 2.8 2.3 4.5 5 5.3 2.7-.8 5-2.5 5-5.3V6.5z" fill="rgba(255,255,255,0.15)" />
      {/* Check mark inside */}
      <Path d="M7 10l2 2 4-4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// ── Processor (replaces 🏗 for "arquiteto") ───────────────────────────────────
export function ProcessorIcon({ size = 20, color = '#3a82f7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Chip body */}
      <Rect x="5" y="5" width="10" height="10" rx="1" fill={color} opacity={0.9} />
      {/* Inner grid */}
      <Rect x="7" y="7" width="6" height="6" rx="0.5" fill="rgba(0,0,0,0.35)" />
      <Line x1="10" y1="7" x2="10" y2="13" stroke={color} strokeWidth="0.8" opacity={0.6} />
      <Line x1="7" y1="10" x2="13" y2="10" stroke={color} strokeWidth="0.8" opacity={0.6} />
      {/* Pins top/bottom */}
      <Line x1="7"  y1="5" x2="7"  y2="2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="10" y1="5" x2="10" y2="2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="13" y1="5" x2="13" y2="2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="7"  y1="15" x2="7"  y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="10" y1="15" x2="10" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="13" y1="15" x2="13" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Pins left/right */}
      <Line x1="5" y1="7"  x2="2" y2="7"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="5" y1="13" x2="2" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="15" y1="7"  x2="18" y2="7"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="15" y1="13" x2="18" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

// ── Infinity Pixel ─────────────────────────────────────────────────────────────
export function InfinityPixelIcon({ size = 20, color = '#c8a96e' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7 10 C7 8 5 6.5 3.5 6.5 C1.5 6.5 1.5 13.5 3.5 13.5 C5 13.5 7 12 10 10 C13 8 15 6.5 16.5 6.5 C18.5 6.5 18.5 13.5 16.5 13.5 C15 13.5 13 12 10 10z"
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Terminal cursor icon ───────────────────────────────────────────────────────
export function TerminalIcon({ size = 20, color = '#5a9e40' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x="1" y="2" width="18" height="16" rx="2" fill="rgba(0,0,0,0.5)" stroke={color} strokeWidth="1" />
      <Path d="M4 7l3 3-3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Line x1="9" y1="13" x2="14" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Star / Centurion (replaces 💯) ────────────────────────────────────────────
export function StarburstIcon({ size = 20, color = '#d4a017' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Polygon
        points="10,1 12.2,7.2 18.8,7.2 13.6,11.3 15.6,17.5 10,13.4 4.4,17.5 6.4,11.3 1.2,7.2 7.8,7.2"
        fill={color} opacity={0.9}
      />
      <Polygon
        points="10,4 11.4,8.4 16,8.4 12.2,11.1 13.6,15.5 10,12.8 6.4,15.5 7.8,11.1 4,8.4 8.6,8.4"
        fill="rgba(255,255,255,0.2)"
      />
    </Svg>
  );
}

// ── GitHub ────────────────────────────────────────────────────────────────────
export function GitHubIcon({ size = 20, color = '#f2e4cf' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </Svg>
  );
}
