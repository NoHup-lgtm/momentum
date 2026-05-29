/**
 * RankEmblem — SVG badge shapes for each rank, matching the prototype's
 * app-ranks.jsx exactly (Init=octagon, Build=pentagon, Deploy=hexagon,
 * Senior=diamond, Architect=decagon, Legend=circle w/ glow rings).
 */
import React from 'react';
import Svg, {
  Polygon, Circle, Line, G, Path, Text as SvgText,
} from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { RANKS, getRank, type RankId } from '../../constants/design';

interface Props {
  rankId: RankId;
  size?: number;
  glowing?: boolean;
}

// ── Init: Octagon with corner brackets ────────────────────────────────────────
function InitEmblem({ size, col }: { size: number; col: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Polygon
        points="15,0 65,0 80,15 80,65 65,80 15,80 0,65 0,15"
        fill={`${col}18`} stroke={col} strokeWidth="2"
      />
      <Polygon
        points="20,6 60,6 74,20 74,60 60,74 20,74 6,60 6,20"
        fill="none" stroke={col} strokeWidth="0.8" opacity="0.25"
      />
      {/* Corner brackets */}
      <Line x1="0" y1="8"  x2="0"  y2="0"  stroke={col} strokeWidth="2.5" opacity="0.6"/>
      <Line x1="0" y1="0"  x2="8"  y2="0"  stroke={col} strokeWidth="2.5" opacity="0.6"/>
      <Line x1="72" y1="0" x2="80" y2="0"  stroke={col} strokeWidth="2.5" opacity="0.6"/>
      <Line x1="80" y1="0" x2="80" y2="8"  stroke={col} strokeWidth="2.5" opacity="0.6"/>
      <Line x1="0" y1="72" x2="0"  y2="80" stroke={col} strokeWidth="2.5" opacity="0.6"/>
      <Line x1="0" y1="80" x2="8"  y2="80" stroke={col} strokeWidth="2.5" opacity="0.6"/>
      <Line x1="72" y1="80" x2="80" y2="80" stroke={col} strokeWidth="2.5" opacity="0.6"/>
      <Line x1="80" y1="72" x2="80" y2="80" stroke={col} strokeWidth="2.5" opacity="0.6"/>
      {/* Terminal sigil: > _ */}
      <SvgText
        x="40" y="48" textAnchor="middle"
        fontSize="22" fill={col} fontWeight="bold"
        opacity="0.9"
      >{'> _'}</SvgText>
    </Svg>
  );
}

// ── Build: Pentagon pointing up ───────────────────────────────────────────────
function BuildEmblem({ size, col }: { size: number; col: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Polygon
        points="40,2 77,29 63,77 17,77 3,29"
        fill={`${col}18`} stroke={col} strokeWidth="2"
      />
      <Polygon
        points="40,10 69,32 57,70 23,70 11,32"
        fill="none" stroke={col} strokeWidth="0.8" opacity="0.22"
      />
      <Circle cx="40" cy="2"  r="3" fill={col} opacity="0.6"/>
      <Circle cx="17" cy="77" r="3" fill={col} opacity="0.4"/>
      <Circle cx="63" cy="77" r="3" fill={col} opacity="0.4"/>
      {/* Ascending bars sigil */}
      <Line x1="30" y1="55" x2="30" y2="45" stroke={col} strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
      <Line x1="40" y1="55" x2="40" y2="38" stroke={col} strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
      <Line x1="50" y1="55" x2="50" y2="30" stroke={col} strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
    </Svg>
  );
}

// ── Deploy: Hexagon with speed lines ─────────────────────────────────────────
function DeployEmblem({ size, col }: { size: number; col: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Polygon
        points="40,2 75,21 75,59 40,78 5,59 5,21"
        fill={`${col}18`} stroke={col} strokeWidth="2"
      />
      <Polygon
        points="40,10 67,25 67,55 40,70 13,55 13,25"
        fill="none" stroke={col} strokeWidth="0.8" opacity="0.22"
      />
      <Circle cx="40" cy="2"  r="2.5" fill={col} opacity="0.7"/>
      <Circle cx="75" cy="40" r="2.5" fill={col} opacity="0.35"/>
      <Circle cx="40" cy="78" r="2.5" fill={col} opacity="0.7"/>
      <Circle cx="5"  cy="40" r="2.5" fill={col} opacity="0.35"/>
      {/* Arrow up sigil */}
      <Path
        d="M40 28 L52 44 L44 44 L44 58 L36 58 L36 44 L28 44 Z"
        fill={col} opacity="0.9"
      />
    </Svg>
  );
}

// ── Senior: Diamond ───────────────────────────────────────────────────────────
function SeniorEmblem({ size, col }: { size: number; col: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Polygon
        points="40,2 78,40 40,78 2,40"
        fill={`${col}18`} stroke={col} strokeWidth="2"
      />
      <Polygon
        points="40,12 68,40 40,68 12,40"
        fill="none" stroke={col} strokeWidth="0.8" opacity="0.25"
      />
      <Circle cx="40" cy="2"  r="2.5" fill={col} opacity="0.75"/>
      <Circle cx="78" cy="40" r="2.5" fill={col} opacity="0.75"/>
      <Circle cx="40" cy="78" r="2.5" fill={col} opacity="0.75"/>
      <Circle cx="2"  cy="40" r="2.5" fill={col} opacity="0.75"/>
      {/* Nested diamond sigil */}
      <Polygon
        points="40,26 54,40 40,54 26,40"
        fill="none" stroke={col} strokeWidth="2" opacity="0.9"
      />
      <Circle cx="40" cy="40" r="4" fill={col} opacity="0.9"/>
    </Svg>
  );
}

// ── Architect: Decagon with circuit ──────────────────────────────────────────
function ArchitectEmblem({ size, col }: { size: number; col: string }) {
  const pts10 = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 - 90) * Math.PI / 180;
    return `${40 + 38 * Math.cos(a)},${40 + 38 * Math.sin(a)}`;
  }).join(' ');
  const pts10i = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 - 90) * Math.PI / 180;
    return `${40 + 30 * Math.cos(a)},${40 + 30 * Math.sin(a)}`;
  }).join(' ');

  // 3 circuit nodes in a triangle
  const nodes = [
    { cx: 40, cy: 26 },
    { cx: 30, cy: 54 },
    { cx: 50, cy: 54 },
  ];

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Polygon points={pts10} fill={`${col}18`} stroke={col} strokeWidth="2"/>
      <Polygon points={pts10i} fill="none" stroke={col} strokeWidth="0.8" opacity="0.22"/>
      {/* Circuit lines */}
      <Line x1="40" y1="26" x2="30" y2="54" stroke={col} strokeWidth="1.5" opacity="0.7"/>
      <Line x1="40" y1="26" x2="50" y2="54" stroke={col} strokeWidth="1.5" opacity="0.7"/>
      <Line x1="30" y1="54" x2="50" y2="54" stroke={col} strokeWidth="1.5" opacity="0.7"/>
      {nodes.map((n, i) => (
        <Circle key={i} cx={n.cx} cy={n.cy} r="5" fill={col} opacity="0.85"/>
      ))}
    </Svg>
  );
}

// ── Legend: Circle with glow rings + spiral ───────────────────────────────────
function LegendEmblem({ size, col }: { size: number; col: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx="40" cy="40" r="36" fill={`${col}18`} stroke={col} strokeWidth="2"/>
      <Circle cx="40" cy="40" r="28" fill="none" stroke={col} strokeWidth="1" opacity="0.5"/>
      <Circle cx="40" cy="40" r="20" fill="none" stroke={col} strokeWidth="0.8" opacity="0.3"/>
      {/* Spiral-like arcs as the sigil */}
      <Path
        d="M40 22 C52 22, 58 32, 58 40 C58 54, 46 62, 40 62 C28 62, 22 52, 22 40 C22 30, 30 24, 40 24"
        fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" opacity="0.9"
      />
      <Circle cx="40" cy="40" r="5" fill={col} opacity="0.9"/>
    </Svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RankEmblem({ rankId, size = 64, glowing = false }: Props) {
  const rank = getRank(rankId);
  const col = rank.color;

  const emblem = () => {
    switch (rankId) {
      case 'init':      return <InitEmblem      size={size} col={col}/>;
      case 'build':     return <BuildEmblem     size={size} col={col}/>;
      case 'deploy':    return <DeployEmblem    size={size} col={col}/>;
      case 'senior':    return <SeniorEmblem    size={size} col={col}/>;
      case 'architect': return <ArchitectEmblem size={size} col={col}/>;
      case 'legend':    return <LegendEmblem    size={size} col={col}/>;
      default:          return <InitEmblem      size={size} col={col}/>;
    }
  };

  return (
    <View style={[
      glowing && {
        shadowColor: col,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
        elevation: 10,
      },
    ]}>
      {emblem()}
    </View>
  );
}
