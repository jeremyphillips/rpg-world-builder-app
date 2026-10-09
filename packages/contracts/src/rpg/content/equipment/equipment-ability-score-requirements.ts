import type { Equipment } from '../equipment'
import type { AbilityScoreRequirements } from '../lib/ability-score-requirements'

const NO_ABILITY_SCORE_REQUIREMENTS: AbilityScoreRequirements = {}

/** Authored minimum scores for an item. `{}` for kinds that carry no requirements. */
export function getEquipmentAbilityScoreRequirements(
  equipment: Equipment,
): AbilityScoreRequirements {
  if (equipment.kind !== 'armor') return NO_ABILITY_SCORE_REQUIREMENTS
  return equipment.abilityScoreRequirements ?? NO_ABILITY_SCORE_REQUIREMENTS
}
