/** Kinds that resolve an attack roll in stat-block facing and multiattack executable-attack pickers. */
export const MONSTER_ACTION_ATTACK_KINDS = ['weapon', 'natural-weapon', 'attack'] as const

export type MonsterActionAttackKind = (typeof MONSTER_ACTION_ATTACK_KINDS)[number]

export const MONSTER_ACTION_ATTACK_KIND_SET: ReadonlySet<MonsterActionAttackKind> = new Set(
  MONSTER_ACTION_ATTACK_KINDS,
)

export function isMonsterActionAttackKind(kind: string): kind is MonsterActionAttackKind {
  return MONSTER_ACTION_ATTACK_KIND_SET.has(kind as MonsterActionAttackKind)
}
