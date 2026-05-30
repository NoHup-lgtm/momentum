// Fórmula de leveling — fonte única da verdade (back). O mobile só consome os
// valores que o /me devolve, sem recalcular.
//
// Curva triangular: o custo pra ir do nível L→L+1 é 100·L, então o XP
// acumulado pra ALCANÇAR o nível L é 50·L·(L-1).
//   Lv1=0 · Lv2=100 · Lv3=300 · Lv4=600 · Lv5=1000 · Lv6=1500 · Lv10=4500

export function xpToReach(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (xpToReach(level + 1) <= totalXp) level++;
  return level;
}

// Progresso dentro do nível atual: quanto já tem e quanto falta pro próximo.
export function levelProgress(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
} {
  const level = levelFromXp(totalXp);
  const base = xpToReach(level);
  const next = xpToReach(level + 1);
  return {
    level,
    xpIntoLevel: totalXp - base,
    xpToNextLevel: next - base,
  };
}
