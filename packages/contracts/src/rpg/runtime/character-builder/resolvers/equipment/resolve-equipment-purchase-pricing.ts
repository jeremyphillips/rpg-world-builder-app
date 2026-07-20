import { canPurchaseEquipment } from '../../../../content/equipment/can-purchase-equipment'
import type { Equipment } from '../../../../content/equipment'
import { moneyToCopper } from '../../../../primitives/wealth'
import { isEquipmentPickerSupportedEquipment } from '../picker/equipment-picker-supported-kinds'

export type EquipmentPurchaseUnavailableReason = 'unsupported_kind' | 'no_market_price'

/** Market purchase price status for conversion and picker affordability. */
export type EquipmentPurchasePricing =
  | { status: 'priced'; unitCostCp: number }
  | { status: 'unavailable'; reason: EquipmentPurchaseUnavailableReason }

/** Resolves whether an equipment row can be purchased and at what unit cost (copper). */
export function resolveEquipmentPurchasePricing(equipment: Equipment): EquipmentPurchasePricing {
  if (!isEquipmentPickerSupportedEquipment(equipment)) {
    return { status: 'unavailable', reason: 'unsupported_kind' }
  }

  if (!canPurchaseEquipment(equipment)) {
    return { status: 'unavailable', reason: 'no_market_price' }
  }

  return { status: 'priced', unitCostCp: moneyToCopper(equipment.cost) }
}
