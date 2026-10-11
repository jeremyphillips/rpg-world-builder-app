import type { ProficiencyRank } from '../../vocab/proficiency'

import { abilityModifier } from './ability-modifier'

/** Skill modifier from ability score, optional rank, and proficiency bonus. */
export function skillModifier(
  abilityScore: number,
  rank: ProficiencyRank | undefined,
  profBonus: number,
): number {
  const base = abilityModifier(abilityScore)
  if (rank === 'expertise') return base + profBonus * 2
  if (rank === 'proficient') return base + profBonus
  return base
}

/** Saving throw bonus for one ability score and optional proficiency. */
export function savingThrowBonus(
  abilityScore: number,
  isProficient: boolean,
  profBonus: number,
): number {
  return abilityModifier(abilityScore) + (isProficient ? profBonus : 0)
}

/** Passive Perception: 10 + Perception skill modifier (WIS-based). */
export function resolvePassivePerception(perceptionModifier: number): number {
  return 10 + perceptionModifier
}
