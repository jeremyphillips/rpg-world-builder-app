import type { SkillProficiency } from '../skill-proficiency'
import { getAbilityLabel } from '../../vocab/ability'

export type SkillProficiencyCompactSummary = {
  abilityLabel: string
  /** All catalog examples — not capped in contracts. */
  exampleUses: readonly string[]
}

export function buildSkillProficiencyCompactSummary(
  skill: SkillProficiency,
): SkillProficiencyCompactSummary {
  return {
    abilityLabel: getAbilityLabel(skill.ability),
    exampleUses: skill.examples,
  }
}
