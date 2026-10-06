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

export const MAGIC_ITEM_ACQUIRED_COPY_CAP_MAX = 1

/**
 * Cap on **manually acquired** copies of a magic item. The counted axis is magic
 * choices plus purchases — the same one `wouldViolateDuplicatePolicy` uses. Package
 * and generic-grant copies are not counted and never trigger the cap.
 */
export type MagicItemAcquiredCopyCap = {
  max: typeof MAGIC_ITEM_ACQUIRED_COPY_CAP_MAX
  used: number
}

/** The copy cap for this item, or `undefined` when duplicates are allowed. */
export function resolveMagicItemAcquiredCopyCap(args: {
  equipment: Equipment
  /** Choices plus purchases already held for this item. */
  acquiredQuantity: number
}): MagicItemAcquiredCopyCap | undefined {
  if (args.equipment.kind !== 'magic_item') return undefined
  if (resolveMagicItemDuplicatePolicy(args.equipment) === 'multiple') return undefined

  return { max: MAGIC_ITEM_ACQUIRED_COPY_CAP_MAX, used: args.acquiredQuantity }
}
