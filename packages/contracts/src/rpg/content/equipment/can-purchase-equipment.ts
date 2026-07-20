import type { Equipment } from '../equipment'
import type { Money } from '../../primitives/units'

/** Returns true when equipment has a stored market price suitable for purchase flows. */
export function canPurchaseEquipment<T extends Pick<Equipment, 'cost'>>(
  equipment: T,
): equipment is T & { cost: Money } {
  return equipment.cost != null
}
