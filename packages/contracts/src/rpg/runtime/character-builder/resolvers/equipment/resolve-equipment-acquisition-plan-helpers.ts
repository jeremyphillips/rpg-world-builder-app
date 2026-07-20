import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuilderDraft } from '../../draft'
import type {
  EquipmentAcquisitionBlocker,
  EquipmentAcquisitionGrantAllocation,
  EquipmentAcquisitionPlan,
} from './equipment-acquisition-types'
import {
  maxAffordablePurchaseQuantity,
  shortfallCpForPurchase,
  totalPurchaseCostCp,
  unitCostCpForEquipment,
} from './resolve-equipment-purchase-availability'
import {
  readMagicItemSelections,
  wouldViolateDuplicatePolicy,
} from './resolve-magic-item-grant-progress'
import type { EquipmentBudgetSummary } from './equipment-budget'

export function emptyAcquisitionPlan(requestedQuantity: number): EquipmentAcquisitionPlan {
  return {
    requestedQuantity,
    fulfilledQuantity: 0,
    unfulfilledQuantity: requestedQuantity,
    grantAllocations: [],
    purchaseQuantity: 0,
    totalCostCp: 0,
    canApplyRequestedQuantity: false,
    blockers: [],
  }
}

export function fulfilledAcquisitionPlan(requestedQuantity: number): EquipmentAcquisitionPlan {
  return {
    ...emptyAcquisitionPlan(requestedQuantity),
    canApplyRequestedQuantity: true,
    unfulfilledQuantity: 0,
  }
}

export function finalizeAcquisitionPlan(args: {
  requestedQuantity: number
  grantAllocations: EquipmentAcquisitionGrantAllocation[]
  purchaseQuantity: number
  equipment: Equipment
  blockers: EquipmentAcquisitionBlocker[]
}): EquipmentAcquisitionPlan {
  const grantQuantity = args.grantAllocations.reduce((sum, row) => sum + row.quantity, 0)
  const fulfilledQuantity = grantQuantity + args.purchaseQuantity
  const unfulfilledQuantity = Math.max(0, args.requestedQuantity - fulfilledQuantity)
  const unitCostCp = unitCostCpForEquipment(args.equipment)
  const totalCostCp = totalPurchaseCostCp(args.equipment, args.purchaseQuantity)
  const purchaseCoversRemainder = args.purchaseQuantity >= args.requestedQuantity - grantQuantity

  const blockers =
    unfulfilledQuantity > 0
      ? args.blockers.filter((blocker) => {
          if (blocker.code === 'no_matching_grant' && grantQuantity > 0) return false
          if (blocker.code === 'no_market_price' && purchaseCoversRemainder) return false
          return true
        })
      : []

  return {
    requestedQuantity: args.requestedQuantity,
    fulfilledQuantity,
    unfulfilledQuantity,
    grantAllocations: args.grantAllocations,
    purchaseQuantity: args.purchaseQuantity,
    totalCostCp,
    unitCostCp,
    canApplyRequestedQuantity: unfulfilledQuantity === 0,
    blockers,
  }
}

export function resolvePurchaseOnlyPlan(args: {
  equipment: Equipment
  requestedQuantity: number
  budget: EquipmentBudgetSummary | undefined
  selections: ReturnType<typeof readMagicItemSelections>
  purchases: NonNullable<CharacterBuilderDraft['equipment']>['purchases']
}): EquipmentAcquisitionPlan {
  const { equipment, requestedQuantity, budget, selections, purchases } = args

  if (requestedQuantity < 1) {
    return fulfilledAcquisitionPlan(requestedQuantity)
  }

  if (
    wouldViolateDuplicatePolicy({
      equipment,
      equipmentId: equipment.id,
      selections,
      purchases: purchases ?? [],
      additionalQuantity: requestedQuantity,
    })
  ) {
    return finalizeAcquisitionPlan({
      requestedQuantity,
      grantAllocations: [],
      purchaseQuantity: 0,
      equipment,
      blockers: [{ code: 'duplicate_not_allowed' }],
    })
  }

  const unitCostCp = unitCostCpForEquipment(equipment)
  if (unitCostCp === undefined) {
    return finalizeAcquisitionPlan({
      requestedQuantity,
      grantAllocations: [],
      purchaseQuantity: 0,
      equipment,
      blockers: [{ code: 'no_market_price' }],
    })
  }

  const maxPurchase = maxAffordablePurchaseQuantity({
    equipment,
    budget,
    currentPurchaseQuantity: 0,
  })
  const purchaseQuantity = Math.min(requestedQuantity, maxPurchase)
  const blockers: EquipmentAcquisitionBlocker[] = []

  if (purchaseQuantity < requestedQuantity) {
    const shortfall = shortfallCpForPurchase({
      equipment,
      budget,
      quantity: requestedQuantity,
    })
    if (shortfall > 0) {
      blockers.push({ code: 'cannot_afford', shortfallCp: shortfall })
    }
  }

  return finalizeAcquisitionPlan({
    requestedQuantity,
    grantAllocations: [],
    purchaseQuantity,
    equipment,
    blockers,
  })
}
