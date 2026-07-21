import type { ClassHitDie } from '../../../primitives/dice'

export type HitPointDerivationMethod = 'average' | 'max'

/** PHB average hit die gain per level after the first: floor(die / 2) + 1. */
export function averageHitDieGain(hitDie: ClassHitDie): number {
  return Math.floor(hitDie / 2) + 1
}

export type ResolveMaxHpAtLevelInput = {
  hitDie: ClassHitDie
  constitutionModifier: number
  level: number
  method: HitPointDerivationMethod
}

/**
 * Maximum hit points at a class level using average or max per-level gains.
 * Level 1 always uses max hit die + CON modifier (minimum 1 total).
 * Additional levels add at least 1 HP per level even with negative CON.
 */
export function resolveMaxHpAtLevel({
  hitDie,
  constitutionModifier,
  level,
  method,
}: ResolveMaxHpAtLevelInput): number {
  if (level <= 0) return 0

  const levelOneTotal = Math.max(1, hitDie + constitutionModifier)
  if (level === 1) return levelOneTotal

  const perLevelBase = method === 'average' ? averageHitDieGain(hitDie) : hitDie
  const additionalPerLevel = Math.max(1, perLevelBase + constitutionModifier)

  return levelOneTotal + additionalPerLevel * (level - 1)
}
