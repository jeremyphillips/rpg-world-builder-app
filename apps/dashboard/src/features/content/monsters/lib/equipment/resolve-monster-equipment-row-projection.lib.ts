import {
  CHALLENGE_RATING_MECHANICS,
  resolveEquipmentRowSummary,
  type Ability,
  type ChallengeRating,
  type CreatureWeaponProficiencies,
  type Equipment,
  type EquipmentInstance,
  type EquipmentRowWeaponSummary,
  type MagicPropertyDefinitionProvider,
} from '@rpg/contracts'

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
  return resolveEquipmentRowSummary(
    args.entry,
    args.item,
    {
      abilityScores: args.abilityScores,
      proficiencyBonus: proficiencyBonusForChallengeRating(args.challengeRating),
      weaponProficiencies: args.weaponProficiencies,
      omitSharedEnhancement: args.omitSharedEnhancement,
    },
    args.provider,
  )
}
