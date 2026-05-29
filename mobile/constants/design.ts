// momentum design tokens — espelha o objeto C do protótipo

export const C = {
  bg:       '#140e08',
  surface:  '#1c1410',
  surface2: '#2a1f17',
  accent:   '#d4673a',
  text:     '#f2e4cf',
  text2:    '#b8a898',
  text3:    '#7a6a5a',
  success:  '#5a7a50',
  danger:   '#c0392b',
  gold:     '#f0a500',
  purple:   '#8b5cf6',
  silver:   '#9aa0a8',
  bronze:   '#cd7f32',
} as const;

export const FONTS = {
  serif:  'Lora_400Regular',
  mono:   'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
  sans:   'System',
} as const;

export type RankId = 'init' | 'build' | 'deploy' | 'senior' | 'architect' | 'legend';

export const RANKS: Array<{ id: RankId; label: string; color: string; glow: string }> = [
  { id: 'init',      label: 'Init',      color: '#3a82f7', glow: 'rgba(58,130,247,0.4)'   },
  { id: 'build',     label: 'Build',     color: '#5a9a50', glow: 'rgba(90,154,80,0.4)'    },
  { id: 'deploy',    label: 'Deploy',    color: '#f0a500', glow: 'rgba(240,165,0,0.4)'    },
  { id: 'senior',    label: 'Senior',    color: '#d4673a', glow: 'rgba(212,103,58,0.4)'   },
  { id: 'architect', label: 'Architect', color: '#c0392b', glow: 'rgba(192,57,43,0.4)'    },
  { id: 'legend',    label: 'Legend',    color: '#8b5cf6', glow: 'rgba(139,92,246,0.45)'  },
];

export const getRank = (id: RankId) => RANKS.find(r => r.id === id) ?? RANKS[0];
