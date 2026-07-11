import type { Equipment } from '../../../../content/equipment'
import { moneyToCopper } from '../../../../primitives/wealth'
import { isEquipmentPickerSupportedEquipment } from '../picker/equipment-picker-supported-kinds'

/** Market purchase price status for conversion and picker affordability. */
export type EquipmentPurchasePricing =
  | { status: 'priced'; unitCostCp: number }
  | { status: 'free'; unitCostCp: 0 }
  | { status: 'unavailable' }

/** Resolves whether an equipment row can be purchased and at what unit cost (copper). */
export function resolveEquipmentPurchasePricing(equipment: Equipment): EquipmentPurchasePricing {
  if (!isEquipmentPickerSupportedEquipment(equipment)) {
    return { status: 'unavailable' }
  }

  const unitCostCp = moneyToCopper(equipment.cost)
  if (unitCostCp <= 0) {
    return { status: 'free', unitCostCp: 0 }
  }

  return { status: 'priced', unitCostCp }
}
