import type { Equipment } from '../../../../content/equipment'
import { wealthToCopper } from '../../../../primitives/wealth'
import type { EquipmentBudgetSummary } from './equipment-budget'
import {
  resolveEquipmentPurchasePricing,
  type EquipmentPurchaseUnavailableReason,
} from './resolve-equipment-purchase-pricing'

export type EquipmentPurchaseAvailability =
  | { status: 'available' }
  | { status: 'unaffordable'; shortfallCp: number }
  | { status: 'unavailable'; reason: EquipmentPurchaseUnavailableReason }

/** Wealth-aware purchase gate — null cost is unavailable, never unaffordable. */
export function resolveEquipmentPurchaseAvailability(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  requestedQuantity?: number
}): EquipmentPurchaseAvailability {
  const { equipment, budget, requestedQuantity = 1 } = args
  const pricing = resolveEquipmentPurchasePricing(equipment)

  if (pricing.status === 'unavailable') {
    return { status: 'unavailable', reason: pricing.reason }
  }

  if (!budget) {
    return { status: 'available' }
  }

  const totalCostCp = pricing.unitCostCp * requestedQuantity
  const remainingCp = wealthToCopper(budget.remaining)

  if (totalCostCp > remainingCp) {
    return { status: 'unaffordable', shortfallCp: totalCostCp - remainingCp }
  }

  return { status: 'available' }
}

export function maxAffordablePurchaseQuantity(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  currentPurchaseQuantity?: number
}): number {
  const { equipment, budget, currentPurchaseQuantity = 0 } = args
  const pricing = resolveEquipmentPurchasePricing(equipment)

  if (pricing.status === 'unavailable' || !budget) {
    return currentPurchaseQuantity
  }

  const unitCost = pricing.unitCostCp
  if (unitCost <= 0) return Number.MAX_SAFE_INTEGER

  const additional = Math.floor(wealthToCopper(budget.remaining) / unitCost)
  return currentPurchaseQuantity + additional
}

export function unitCostCpForEquipment(equipment: Equipment): number | undefined {
  const pricing = resolveEquipmentPurchasePricing(equipment)
  return pricing.status === 'priced' ? pricing.unitCostCp : undefined
}

export function totalPurchaseCostCp(equipment: Equipment, quantity: number): number {
  const unitCost = unitCostCpForEquipment(equipment)
  if (unitCost === undefined) return 0
  return unitCost * quantity
}

export function remainingBudgetCp(budget: EquipmentBudgetSummary | undefined): number {
  if (!budget) return Number.MAX_SAFE_INTEGER
  return wealthToCopper(budget.remaining)
}

export function canAffordPurchaseQuantity(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  quantity: number
}): boolean {
  const availability = resolveEquipmentPurchaseAvailability({
    equipment: args.equipment,
    budget: args.budget,
    requestedQuantity: args.quantity,
  })
  return availability.status === 'available'
}

export function shortfallCpForPurchase(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  quantity: number
}): number {
  const availability = resolveEquipmentPurchaseAvailability({
    equipment: args.equipment,
    budget: args.budget,
    requestedQuantity: args.quantity,
  })
  return availability.status === 'unaffordable' ? availability.shortfallCp : 0
}

export function isPricedEquipment(equipment: Equipment): boolean {
  return resolveEquipmentPurchasePricing(equipment).status === 'priced'
}
