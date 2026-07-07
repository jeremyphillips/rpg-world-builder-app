import type { Equipment } from '../equipment'
import type { GearKind } from '../../vocab/equipment/gear-kind'

const STACKABLE_GEAR_KINDS: ReadonlySet<GearKind> = new Set(['ammunition', 'consumable'])

/**
 * Returns true when multiple units of the same equipment record may share one
 * inventory stack. Driven by catalog fields — not hardcoded slugs.
 */
export function isEquipmentStackable(equipment: Equipment): boolean {
  if (equipment.kind !== 'adventuring_gear') return false

  if (equipment.bundleSize !== undefined) return true
  return STACKABLE_GEAR_KINDS.has(equipment.gearKind)
}
