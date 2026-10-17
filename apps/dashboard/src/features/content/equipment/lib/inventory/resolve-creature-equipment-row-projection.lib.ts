import {
  resolveEquipmentRowSummary,
  type Ability,
  type CreatureWeaponProficiencies,
  type Equipment,
  type EquipmentInstance,
  type EquipmentRowWeaponSummary,
  type MagicPropertyDefinitionProvider,
} from '@rpg/contracts'

/** Dashboard adapter — delegates creature weapon row math to `@rpg/contracts`. */
export function resolveCreatureEquipmentRowProjection(args: {
  entry: EquipmentInstance
  item: Equipment | undefined
  abilityScores: Partial<Record<Ability, number>>
  proficiencyBonus: number | undefined
  weaponProficiencies: CreatureWeaponProficiencies
  omitSharedEnhancement: boolean
  provider: MagicPropertyDefinitionProvider
}): EquipmentRowWeaponSummary | undefined {
  return resolveEquipmentRowSummary(
    args.entry,
    args.item,
    {
      abilityScores: args.abilityScores,
      proficiencyBonus: args.proficiencyBonus,
      weaponProficiencies: args.weaponProficiencies,
      omitSharedEnhancement: args.omitSharedEnhancement,
    },
    args.provider,
  )
}
