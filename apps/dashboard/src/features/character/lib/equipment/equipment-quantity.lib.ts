import {
  clampEquipmentPurchaseQuantity,
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  isEquipmentStackable,
  maxAffordablePurchaseQuantity,
  type CharacterBuilderDraftEquipmentPurchase,
  type Equipment,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

/** Re-export contracts cap — single dashboard import for equipment-step quantity UI. */
export { EQUIPMENT_PURCHASE_QUANTITY_MAX }

/** NumberInput digit slots sized for {@link EQUIPMENT_PURCHASE_QUANTITY_MAX}. */
export const EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS = 2 as const

/** @deprecated Prefer `clampEquipmentPurchaseQuantity` from `@rpg/contracts`. */
export function clampEquipmentStepQuantity(quantity: number, maxQuantity: number): number {
  return clampEquipmentPurchaseQuantity(quantity, maxQuantity)
}

/** Resolves the effective max for equipment-step quantity inputs (budget + hard cap). */
export function resolveEquipmentStepPurchaseMaxQuantity(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  currentQuantity?: number
  sourceMode?: CharacterBuilderDraftEquipmentPurchase['sourceMode']
}): number {
  const sourceMode = args.sourceMode ?? 'startingGold'
  const currentQuantity = args.currentQuantity ?? 0

  if (sourceMode !== 'startingGold') {
    return Math.max(currentQuantity, 1)
  }

  if (!isEquipmentStackable(args.equipment)) {
    return currentQuantity > 0 ? currentQuantity : 1
  }

  return Math.min(
    EQUIPMENT_PURCHASE_QUANTITY_MAX,
    maxAffordablePurchaseQuantity({
      equipment: args.equipment,
      budget: args.budget,
      currentPurchaseQuantity: currentQuantity,
    }),
  )
}
