import type { Equipment } from '../equipment'

/**
 * Returns true when multiple units of the same equipment record may share one
 * purchase/inventory row.
 *
 * Quantity support is permissive by default. Add explicit exceptions when
 * equipment requires distinct inventory instances.
 */
export function isEquipmentStackable(_equipment: Equipment): boolean {
  return true
}
