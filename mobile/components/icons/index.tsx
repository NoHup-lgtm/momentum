import React from 'react';
import Svg, { Path, Circle, Line, Polygon, Rect, G } from 'react-native-svg';
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

// ── Spiral logo ───────────────────────────────────────────────────────────────
export function SpiralIcon({ size = 48, color = C.accent }: { size?: number; color?: string }) {
  const SEGS = 80;
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.43, minR = size * 0.04;

  const lines: React.ReactElement[] = [];
  const pts: [number, number][] = [];

  for (let i = 0; i <= SEGS; i++) {
    const t = i / SEGS;
    const a = -Math.PI / 2 + t * 1.75 * 2 * Math.PI;
    const r = minR + (maxR - minR) * t;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }

  for (let i = 0; i < pts.length - 1; i++) {
    const sw = (0.009 + (0.082 - 0.009) * (i / (SEGS - 1))) * size;
    lines.push(
      <Line
        key={i}
        x1={pts[i][0]} y1={pts[i][1]}
        x2={pts[i + 1][0]} y2={pts[i + 1][1]}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    );
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {lines}
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
