import {
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  resolveEquipmentPurchaseQuantityLimits,
  type CharacterBuilderDraftEquipmentPurchase,
  type Equipment,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

/** Re-export contracts cap — single dashboard import for equipment-step quantity UI. */
export { EQUIPMENT_PURCHASE_QUANTITY_MAX }

/** NumberInput digit slots sized for {@link EQUIPMENT_PURCHASE_QUANTITY_MAX}. */
export const EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS = 2 as const

export function clampEquipmentStepQuantity(quantity: number, maxQuantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1
  }

  const cappedMax = Math.min(Math.max(maxQuantity, 1), EQUIPMENT_PURCHASE_QUANTITY_MAX)
  return Math.min(Math.max(quantity, 1), cappedMax)
}

/** Resolves the effective max for equipment-step quantity inputs (budget + hard cap). */
export function resolveEquipmentStepPurchaseMaxQuantity(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  currentQuantity?: number
  sourceMode?: CharacterBuilderDraftEquipmentPurchase['sourceMode']
}): number {
  const currentQuantity = args.currentQuantity ?? 0
  const limits = resolveEquipmentPurchaseQuantityLimits({
    equipment: args.equipment,
    sourceMode: args.sourceMode ?? 'startingGold',
    budget: args.budget,
    currentQuantity,
    isPurchaseRow: true,
  })

  return limits.max
}
