import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type {
  EquipmentAcquisitionBuilderContext,
  EquipmentAcquisitionQuantityBounds,
} from './equipment-acquisition-types'
import { resolveMagicItemDuplicatePolicy } from './resolve-magic-item-duplicate-policy'
import { countOwnedQuantity, readMagicItemSelections } from './resolve-magic-item-grant-progress'
import { EQUIPMENT_PURCHASE_QUANTITY_MAX } from './resolve-equipment-purchase-quantity-limits'

/** Structural ceiling for "quantity to add" — ownership derived from draft, not caller input. */
export function resolveEquipmentAcquisitionQuantityBounds(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
}): EquipmentAcquisitionQuantityBounds {
  void args.context

  const equipmentId = args.equipment.id
  const selections = readMagicItemSelections(args.draft)
  const purchases = args.draft.equipment?.purchases ?? []
  const purchaseQuantity = purchases
    .filter((row) => row.equipmentId === equipmentId)
    .reduce((sum, row) => sum + row.quantity, 0)

  const owned = countOwnedQuantity({
    equipmentId,
    selections,
    purchaseQuantity,
  })

  if (resolveMagicItemDuplicatePolicy(args.equipment) === 'single') {
    return { maxAdditionalQuantity: owned > 0 ? 0 : 1 }
  }

  return {
    maxAdditionalQuantity: Math.max(0, EQUIPMENT_PURCHASE_QUANTITY_MAX - owned),
  }
}
