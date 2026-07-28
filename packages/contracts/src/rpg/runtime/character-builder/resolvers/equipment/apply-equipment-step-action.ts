import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import type {
  EquipmentStepAction,
  EquipmentStepActionIssue,
  EquipmentStepActionResult,
} from '../../equipment-step-action'
import { resolveEquipmentPurchaseIndex } from '../../equipment-purchase'
import type { EquipmentBudgetSummary } from './equipment-budget'
import {
  clampEquipmentPurchaseQuantity,
  resolveEquipmentPurchaseQuantityLimits,
} from './resolve-equipment-purchase-quantity-limits'

function applySetPurchaseQuantityAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  purchaseId: string
  quantity: number
  budget?: EquipmentBudgetSummary
}): EquipmentStepActionResult {
  const { draft, catalogIndex, purchaseId, quantity, budget } = args
  const current = draft.equipment

  if (!current) {
    return { status: 'invalid', issues: [{ code: 'equipment_channel_missing' }] }
  }

  const purchaseIndex = resolveEquipmentPurchaseIndex(current.purchases, purchaseId)
  if (purchaseIndex === undefined) {
    return {
      status: 'invalid',
      issues: [{ code: 'purchase_not_found', reference: { purchaseId } }],
    }
  }

  const purchase = current.purchases[purchaseIndex]
  if (!purchase) {
    return {
      status: 'invalid',
      issues: [{ code: 'purchase_not_found', reference: { purchaseId } }],
    }
  }

  const equipment = catalogIndex.equipment.get(purchase.equipmentId)
  if (!equipment) {
    return {
      status: 'invalid',
      issues: [
        {
          code: 'equipment_not_in_catalog',
          reference: { equipmentId: purchase.equipmentId },
        },
      ],
    }
  }

  if (quantity < 1) {
    return {
      status: 'invalid',
      issues: [{ code: 'quantity_out_of_range', reference: { purchaseId, quantity } }],
    }
  }

  const limits = resolveEquipmentPurchaseQuantityLimits({
    equipment,
    sourceMode: purchase.sourceMode,
    origin: purchase.origin,
    budget,
    currentQuantity: purchase.quantity,
    isPurchaseRow: true,
  })

  if (!limits.editable) {
    return {
      status: 'invalid',
      issues: [{ code: 'quantity_not_editable', reference: { purchaseId } }],
    }
  }

  const nextQuantity = clampEquipmentPurchaseQuantity(quantity, limits.max)
  const purchases = current.purchases.map((entry, index) =>
    index === purchaseIndex ? { ...entry, quantity: nextQuantity } : entry,
  )

  return {
    status: 'applied',
    patch: {
      equipment: {
        ...current,
        purchases,
      },
    },
  }
}

function dispatchEquipmentStepAction(
  action: EquipmentStepAction,
  args: {
    draft: CharacterBuilderDraft
    catalogIndex: CharacterBuildCatalogIndex
    budget?: EquipmentBudgetSummary
  },
): EquipmentStepActionResult {
  switch (action.kind) {
    case 'set_purchase_quantity':
      return applySetPurchaseQuantityAction({
        ...args,
        purchaseId: action.purchaseId,
        quantity: action.quantity,
      })
  }
}

export function applyEquipmentStepAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  action: EquipmentStepAction
  budget?: EquipmentBudgetSummary
}): EquipmentStepActionResult {
  return dispatchEquipmentStepAction(args.action, args)
}

export type { EquipmentStepActionIssue }
