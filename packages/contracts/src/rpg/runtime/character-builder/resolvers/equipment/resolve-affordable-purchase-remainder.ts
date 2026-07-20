import type { Equipment } from '../../../../content/equipment'
import type { EquipmentBudgetSummary } from './equipment-budget'
import type { EquipmentAcquisitionBlocker } from './equipment-acquisition-types'
import {
  maxAffordablePurchaseQuantity,
  shortfallCpForPurchase,
  unitCostCpForEquipment,
} from './resolve-equipment-purchase-availability'

export function resolveAffordablePurchaseRemainder(args: {
  equipment: Equipment
  budget: EquipmentBudgetSummary | undefined
  remainingQuantity: number
}): { purchaseQuantity: number; blockers: EquipmentAcquisitionBlocker[] } {
  const { equipment, budget, remainingQuantity } = args
  if (remainingQuantity <= 0) {
    return { purchaseQuantity: 0, blockers: [] }
  }

  const unitCostCp = unitCostCpForEquipment(equipment)
  if (unitCostCp === undefined) {
    return { purchaseQuantity: 0, blockers: [{ code: 'no_market_price' }] }
  }

  const maxPurchase = maxAffordablePurchaseQuantity({
    equipment,
    budget,
    currentPurchaseQuantity: 0,
  })
  const purchaseQuantity = Math.min(remainingQuantity, maxPurchase)
  const blockers: EquipmentAcquisitionBlocker[] = []

  if (purchaseQuantity < remainingQuantity) {
    const shortfall = shortfallCpForPurchase({
      equipment,
      budget,
      quantity: remainingQuantity,
    })
    if (shortfall > 0) {
      blockers.push({ code: 'cannot_afford', shortfallCp: shortfall })
    }
  }

  return { purchaseQuantity, blockers }
}
