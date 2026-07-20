import type { Equipment } from '../../../../content/equipment'
import { canPurchaseEquipment } from '../../../../content/equipment/can-purchase-equipment'

/** Duplicate policy for magic-item acquisition — separate from stackable metadata. */
export function resolveMagicItemDuplicatePolicy(equipment: Equipment): 'single' | 'multiple' {
  if (
    equipment.kind === 'magic_item' &&
    equipment.rarity === 'common' &&
    canPurchaseEquipment(equipment)
  ) {
    return 'multiple'
  }

  return 'single'
}
