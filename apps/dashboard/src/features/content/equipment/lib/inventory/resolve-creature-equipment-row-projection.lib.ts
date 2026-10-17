import {
  resolveEquipmentRowSummary,
  type Ability,
  type CreatureWeaponProficiencies,
  type Equipment,
  type EquipmentInstance,
  type EquipmentRowWeaponSummary,
  type MagicPropertyDefinitionProvider,
} from '@rpg/contracts'

export const EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT = 'Unmodified' as const

export function buildCreatureEquipmentRowSupportingMetadata(args: {
  rowSummary: EquipmentRowWeaponSummary | undefined
  leadingSegments?: readonly string[]
}): readonly string[] {
  const calculated = args.rowSummary?.supportingMetadata ?? []
  const leading = args.leadingSegments ?? []
  if (leading.length === 0) return calculated
  if (calculated.length === 0) return leading
  return [...leading, ...calculated]
}

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
