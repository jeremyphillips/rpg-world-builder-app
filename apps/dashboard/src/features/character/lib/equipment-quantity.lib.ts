import {
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  isEquipmentStackable,
  resolveEquipmentAcquisitionMaxQuantity,
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
  const sourceMode = args.sourceMode ?? 'startingGold'
  const currentQuantity = args.currentQuantity ?? 0

  if (sourceMode !== 'startingGold') {
    return Math.max(currentQuantity, 1)
  }

  if (!isEquipmentStackable(args.equipment)) {
    return currentQuantity > 0 ? currentQuantity : 1
  }

  return resolveEquipmentAcquisitionMaxQuantity({
    equipment: args.equipment,
    budget: args.budget,
    currentQuantity,
  })
}
