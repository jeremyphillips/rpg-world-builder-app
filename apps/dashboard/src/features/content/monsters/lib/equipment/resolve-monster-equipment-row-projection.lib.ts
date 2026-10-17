import {
  CHALLENGE_RATING_MECHANICS,
  type Ability,
  type ChallengeRating,
  type CreatureWeaponProficiencies,
  type Equipment,
  type EquipmentInstance,
  type EquipmentRowWeaponSummary,
  type MagicPropertyDefinitionProvider,
} from '@rpg/contracts'

import { resolveCreatureEquipmentRowProjection } from '../../../equipment/lib/inventory/resolve-creature-equipment-row-projection.lib'

function proficiencyBonusForChallengeRating(
  challengeRating: string | undefined,
): number | undefined {
  if (!challengeRating) return undefined
  return CHALLENGE_RATING_MECHANICS[challengeRating as ChallengeRating]?.proficiencyBonus
}

export function resolveMonsterEquipmentRowProjection(args: {
  entry: EquipmentInstance
  item: Equipment | undefined
  abilityScores: Partial<Record<Ability, number>>
  challengeRating: string | undefined
  weaponProficiencies: CreatureWeaponProficiencies
  omitSharedEnhancement: boolean
  provider: MagicPropertyDefinitionProvider
}): EquipmentRowWeaponSummary | undefined {
  return resolveCreatureEquipmentRowProjection({
    entry: args.entry,
    item: args.item,
    abilityScores: args.abilityScores,
    proficiencyBonus: proficiencyBonusForChallengeRating(args.challengeRating),
    weaponProficiencies: args.weaponProficiencies,
    omitSharedEnhancement: args.omitSharedEnhancement,
    provider: args.provider,
  })
}
