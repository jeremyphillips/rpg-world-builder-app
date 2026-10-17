import {
  creatureWeaponProficiencyGrantSetFromTargets,
  proficiencyBonus,
  type Ability,
  type CreatureWeaponProficiencyTarget,
  type Equipment,
  type EquipmentInstance,
  type EquipmentRowWeaponSummary,
  type MagicPropertyDefinitionProvider,
} from '@rpg/contracts'

import { resolveCreatureEquipmentRowProjection } from '@/features/content'

export function resolveCharacterEquipmentRowProjection(args: {
  entry: EquipmentInstance
  item: Equipment | undefined
  abilityScores: Partial<Record<Ability, number>>
  level: number
  weaponProficiencyTargets: readonly CreatureWeaponProficiencyTarget[]
  omitSharedEnhancement: boolean
  provider: MagicPropertyDefinitionProvider
}): EquipmentRowWeaponSummary | undefined {
  return resolveCreatureEquipmentRowProjection({
    entry: args.entry,
    item: args.item,
    abilityScores: args.abilityScores,
    proficiencyBonus: proficiencyBonus(args.level),
    weaponProficiencies: creatureWeaponProficiencyGrantSetFromTargets(
      args.weaponProficiencyTargets,
    ),
    omitSharedEnhancement: args.omitSharedEnhancement,
    provider: args.provider,
  })
}
