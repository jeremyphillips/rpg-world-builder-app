import type { Equipment } from '../../content/equipment'
import { isWeaponEquipment } from '../../content/equipment'
import {
  resolveEquipmentEntryEffects,
  type EquipmentEffectTotals,
} from '../../content/equipment/instance/equipment-effect-totals'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import type { ResolvedEquipmentMagicProperties } from '../../content/equipment/instance/resolve-equipment-magic-properties'
import { formatRollValue, type RollValue } from '../../primitives/mechanics/roll'
import type { WeaponDamage } from '../../content/equipment/weapon-variant'

import { averageStatBlockDamage } from './stat-block-average'
import { weaponAttackBonus } from './weapon-attack'

export type InventoryWeaponAttackTotals = {
  /** Absent when the ability modifier or proficiency bonus is missing. */
  attackBonus?: number
  /** Absent when the ability modifier is missing. Uses catalog damage, or 1d4 when a weapon has none. */
  damageAverage?: number
  /**
   * `formatRollValue` expression. Catalog dice only when the governing ability is missing.
   * Absent when the weapon has no catalog damage.
   */
  damageExpression?: string
  /** Ability modifier plus damage-roll effects. Absent when the governing ability is missing. */
  damageModifier?: number
  effectTotals: EquipmentEffectTotals
  magic: ResolvedEquipmentMagicProperties
}

function damageRoll(damage: WeaponDamage, damageModifier: number | undefined): RollValue {
  const flat = damageModifier === undefined ? damage.flat : (damage.flat ?? 0) + damageModifier
  if (!damage.dice) return { flat }
  if (flat === undefined || flat === 0) return { dice: damage.dice }
  return { dice: damage.dice, flat }
}

function damageExpressionFor(
  damage: WeaponDamage | undefined,
  damageModifier: number | undefined,
): string | undefined {
  if (!damage) return undefined
  return formatRollValue(damageRoll(damage, damageModifier))
}

/**
 * Effective weapon attack and damage for inventory rows, monster weapon actions,
 * and character previews. Magic presets and instance adjustments are applied once.
 */
export function resolveInventoryWeaponAttackTotals(args: {
  entry: EquipmentInstance
  item: Equipment
  abilityModifier: number | undefined
  proficient: boolean
  proficiencyBonus: number | undefined
  provider: MagicPropertyDefinitionProvider
}): InventoryWeaponAttackTotals | undefined {
  if (!isWeaponEquipment(args.item)) return undefined

  const { totals: effectTotals, magic } = resolveEquipmentEntryEffects(
    args.entry,
    args.item,
    args.provider,
  )
  const abilityModifier = args.abilityModifier
  const damageModifier =
    abilityModifier === undefined ? undefined : abilityModifier + effectTotals.damage_roll
  const attackBonus =
    abilityModifier === undefined || args.proficiencyBonus === undefined
      ? undefined
      : weaponAttackBonus(abilityModifier, args.proficient, args.proficiencyBonus) +
        effectTotals.attack_roll
  const damageAverage =
    abilityModifier === undefined
      ? undefined
      : averageStatBlockDamage(
          args.item.damage ?? { dice: { count: 1, faces: 4 as const } },
          abilityModifier,
        ) + effectTotals.damage_roll
  const damageExpression = damageExpressionFor(args.item.damage, damageModifier)

  return {
    ...(attackBonus !== undefined ? { attackBonus } : {}),
    ...(damageAverage !== undefined ? { damageAverage } : {}),
    ...(damageExpression !== undefined ? { damageExpression } : {}),
    ...(damageModifier !== undefined ? { damageModifier } : {}),
    effectTotals,
    magic,
  }
}
