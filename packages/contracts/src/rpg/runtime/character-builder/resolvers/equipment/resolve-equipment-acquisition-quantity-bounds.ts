import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type {
  EquipmentAcquisitionBuilderContext,
  EquipmentAcquisitionQuantityBounds,
} from './equipment-acquisition-types'
import {
  resolveMagicItemAcquiredCopyCap,
  resolveMagicItemDuplicatePolicy,
  type MagicItemAcquiredCopyCap,
} from './resolve-magic-item-duplicate-policy'
import { countOwnedQuantity, readMagicItemSelections } from './resolve-magic-item-grant-progress'
import { EQUIPMENT_PURCHASE_QUANTITY_MAX } from './resolve-equipment-purchase-quantity-limits'

/** Copies on the duplicate-policy axis: magic choices plus purchases. */
export function countMagicItemAcquiredCopies(args: {
  equipmentId: string
  draft: CharacterBuilderDraft
}): number {
  const purchaseQuantity = (args.draft.equipment?.purchases ?? [])
    .filter((row) => row.equipmentId === args.equipmentId)
    .reduce((sum, row) => sum + row.quantity, 0)

  return countOwnedQuantity({
    equipmentId: args.equipmentId,
    selections: readMagicItemSelections(args.draft),
    purchaseQuantity,
  })
}

/** Draft-scoped copy cap — the named fact picker presentation reads. */
export function resolveMagicItemAcquiredCopyCapForDraft(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
}): MagicItemAcquiredCopyCap | undefined {
  return resolveMagicItemAcquiredCopyCap({
    equipment: args.equipment,
    acquiredQuantity: countMagicItemAcquiredCopies({
      equipmentId: args.equipment.id,
      draft: args.draft,
    }),
  })
}

/** Structural ceiling for "quantity to add" — ownership derived from draft, not caller input. */
export function resolveEquipmentAcquisitionQuantityBounds(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
}): EquipmentAcquisitionQuantityBounds {
  void args.context

  const owned = countMagicItemAcquiredCopies({
    equipmentId: args.equipment.id,
    draft: args.draft,
  })

  if (resolveMagicItemDuplicatePolicy(args.equipment) === 'single') {
    return { maxAdditionalQuantity: owned > 0 ? 0 : 1 }
  }

  return {
    maxAdditionalQuantity: Math.max(0, EQUIPMENT_PURCHASE_QUANTITY_MAX - owned),
  }
}
