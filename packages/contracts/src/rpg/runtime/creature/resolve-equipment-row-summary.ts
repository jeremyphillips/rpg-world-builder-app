import type { Equipment } from '../../content/equipment'
import { isWeaponEquipment } from '../../content/equipment'
import type { CreatureWeaponProficiencies } from '../../content/creature'
import { formatEquipmentEffectSourceSegments } from '../../content/equipment/instance/equipment-mechanical-metadata'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import type { Ability } from '../../vocab/ability'
import { getPhysicalDamageTypeCompactLabel } from '../../vocab/damage/physical'

import { isWeaponProficientFromGrantSet } from './proficiencies'
import { resolveInventoryWeaponAttackTotals } from './resolve-inventory-weapon-attack'
import { formatSignedModifier, resolveWeaponAttackAbilityModifier } from './weapon-attack'

/**
 * Card projection of `resolveInventoryWeaponAttackTotals`.
 *
 * Armor and shields return no summary. Versatile and thrown attacks stay on the
 * catalog mode and one-handed die that the attack resolver uses.
 * Character detail still calls the attack resolver without a magic-property provider,
 * so preset enhancements are omitted there until a provider is passed.
 */
export type EquipmentRowCreatureContext = {
  abilityScores: Partial<Record<Ability, number>>
  proficiencyBonus: number | undefined
  weaponProficiencies: CreatureWeaponProficiencies
  /** From `EquipmentInstanceSummary.enhancementInDisplayName`. */
  omitSharedEnhancement: boolean
}

export type EquipmentRowSummaryAvailability = {
  damageDice: boolean
  damageModifier: boolean
  attackBonus: boolean
}

export type EquipmentRowWeaponDamage = {
  expression: string
  damageTypeLabel?: string
  modifier?: number
}

export type EquipmentRowWeaponSummary = {
  kind: 'weapon'
  availability: EquipmentRowSummaryAvailability
  proficient: boolean
  damage?: EquipmentRowWeaponDamage
  attackBonus?: number
  adjustmentSegments: readonly string[]
  supportingMetadata: readonly string[]
}

function supportingMetadataFor(args: {
  expression: string | undefined
  damageTypeLabel: string | undefined
  attackBonus: number | undefined
}): string[] {
  const supportingMetadata: string[] = []
  if (args.expression) {
    supportingMetadata.push(
      args.damageTypeLabel ? `${args.expression} ${args.damageTypeLabel}` : args.expression,
    )
  }
  if (args.attackBonus !== undefined) {
    supportingMetadata.push(`${formatSignedModifier(args.attackBonus)} to hit`)
  }
  return supportingMetadata
}

export function resolveEquipmentRowSummary(
  entry: EquipmentInstance,
  item: Equipment | undefined,
  context: EquipmentRowCreatureContext,
  provider: MagicPropertyDefinitionProvider,
): EquipmentRowWeaponSummary | undefined {
  if (!item || !isWeaponEquipment(item)) return undefined

  const proficient = isWeaponProficientFromGrantSet(item, context.weaponProficiencies)
  const totals = resolveInventoryWeaponAttackTotals({
    entry,
    item,
    abilityModifier: resolveWeaponAttackAbilityModifier(item, context.abilityScores),
    proficient,
    proficiencyBonus: context.proficiencyBonus,
    provider,
  })
  if (!totals) return undefined

  const damage = totals.damageExpression
    ? {
        expression: totals.damageExpression,
        ...(item.damageType
          ? { damageTypeLabel: getPhysicalDamageTypeCompactLabel(item.damageType) }
          : {}),
        ...(totals.damageModifier !== undefined ? { modifier: totals.damageModifier } : {}),
      }
    : undefined
  return {
    kind: 'weapon',
    availability: {
      damageDice: damage !== undefined,
      damageModifier: totals.damageModifier !== undefined,
      attackBonus: totals.attackBonus !== undefined,
    },
    proficient,
    ...(damage ? { damage } : {}),
    ...(totals.attackBonus !== undefined ? { attackBonus: totals.attackBonus } : {}),
    adjustmentSegments: formatEquipmentEffectSourceSegments({
      entry,
      magic: totals.magic,
      omitSharedEnhancement: context.omitSharedEnhancement,
    }),
    supportingMetadata: supportingMetadataFor({
      expression: damage?.expression,
      damageTypeLabel: damage?.damageTypeLabel,
      attackBonus: totals.attackBonus,
    }),
  }
}
