import type { Equipment } from '../../content/equipment'
import { isWeaponEquipment } from '../../content/equipment'
import { resolveEquipmentEntryEffectTotals } from '../../content/equipment/instance/equipment-effect-totals'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'

import { averageStatBlockDamage } from './stat-block-average'
import { weaponAttackBonus } from './weapon-attack'

/** Shared weapon attack/damage totals for character inventory and monster actions. */
export function resolveInventoryWeaponAttackTotals(args: {
  entry: EquipmentInstance
  item: Equipment
  abilityModifier: number
  proficient: boolean
  proficiencyBonus: number
  provider: MagicPropertyDefinitionProvider
}): { attackBonus: number; damageAverage: number } | undefined {
  if (!isWeaponEquipment(args.item)) return undefined
  const effectTotals = resolveEquipmentEntryEffectTotals(args.entry, args.item, args.provider)
  const attackBonus =
    weaponAttackBonus(args.abilityModifier, args.proficient, args.proficiencyBonus) +
    effectTotals.attack_roll
  const damageAverage =
    averageStatBlockDamage(
      args.item.damage ?? { dice: { count: 1, faces: 4 as const } },
      args.abilityModifier,
    ) + effectTotals.damage_roll
  return { attackBonus, damageAverage }
}
