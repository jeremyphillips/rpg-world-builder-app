import type { Equipment } from '../../../../content/equipment'
import { canPurchaseEquipment } from '../../../../content/equipment/can-purchase-equipment'
import { isEquipmentStackable } from '../../../../content/equipment/stackable'
import { formatMoney } from '../../../../primitives/money'
import { copperToDisplayWealth, formatWealth } from '../../../../primitives/wealth'
import type { CharacterBuilderDraftEquipmentPurchase } from '../../draft/draft'
import { moneyToCopper, wealthToCopper, type EquipmentBudgetSummary } from './equipment-budget'
import { maxAffordablePurchaseQuantity } from './resolve-equipment-purchase-availability'

/** Hard cap per purchase row (bundle units). */
export const EQUIPMENT_PURCHASE_QUANTITY_MAX = 99

/** Clamps a purchase quantity to [1, min(maxQuantity, EQUIPMENT_PURCHASE_QUANTITY_MAX)]. */
export function clampEquipmentPurchaseQuantity(quantity: number, maxQuantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1
  }

  const cappedMax = Math.min(Math.max(maxQuantity, 1), EQUIPMENT_PURCHASE_QUANTITY_MAX)
  return Math.min(Math.max(quantity, 1), cappedMax)
}

export type EquipmentPurchaseQuantityLimits = {
  editable: boolean
  min: 1
  max: number
  showCost: boolean
}

/** Budget- and cap-limited max for starting-gold acquisition (picker / new purchase qty). */
export function resolveEquipmentAcquisitionMaxQuantity(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  currentQuantity: number
}): number {
  const { equipment, budget, currentQuantity } = args
  if (!canPurchaseEquipment(equipment)) return currentQuantity

  const hasSpendableBudget = budget !== undefined && wealthToCopper(budget.starting) > 0

  let budgetMax: number
  if (hasSpendableBudget) {
    budgetMax = maxAffordablePurchaseQuantity({
      equipment,
      budget,
      currentPurchaseQuantity: currentQuantity,
    })
  } else {
    budgetMax = EQUIPMENT_PURCHASE_QUANTITY_MAX
  }

  return Math.min(EQUIPMENT_PURCHASE_QUANTITY_MAX, Math.max(budgetMax, 1))
}

export function resolveEquipmentPurchaseQuantityLimits(args: {
  equipment: Equipment
  sourceMode?: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  origin?: CharacterBuilderDraftEquipmentPurchase['origin']
  budget?: EquipmentBudgetSummary
  currentQuantity: number
  isPurchaseRow: boolean
}): EquipmentPurchaseQuantityLimits {
  const { equipment, sourceMode, origin, budget, currentQuantity, isPurchaseRow } = args
  const showCost = sourceMode === 'startingGold'

  if (!isPurchaseRow) {
    return { editable: false, min: 1, max: Math.max(currentQuantity, 1), showCost: false }
  }

  if (origin === 'packageConversion' && !isEquipmentStackable(equipment)) {
    return {
      editable: false,
      min: 1,
      max: Math.max(currentQuantity, 1),
      showCost,
    }
  }

  const editable = isEquipmentStackable(equipment) && sourceMode === 'startingGold'
  const acquisitionMax = resolveEquipmentAcquisitionMaxQuantity({
    equipment,
    budget,
    currentQuantity,
  })

  const max = editable ? acquisitionMax : Math.max(currentQuantity, 1)

  return {
    editable,
    min: 1,
    max,
    showCost,
  }
}

function isBundledEquipment(equipment: Equipment): boolean {
  return equipment.kind === 'adventuring_gear' && equipment.bundleSize !== undefined
}

/** Normalizes a purchase total across denominations (e.g. 10 SP → 1 GP). */
export function formatEquipmentPurchaseTotalPriceLabel(
  equipment: Equipment,
  quantity: number,
): string {
  if (!canPurchaseEquipment(equipment)) return ''
  const totalCopper = moneyToCopper(equipment.cost) * quantity
  return formatWealth(copperToDisplayWealth(totalCopper))
}

export function formatEquipmentPurchaseUnitPriceLabel(equipment: Equipment): string {
  if (!canPurchaseEquipment(equipment)) return ''
  if (isBundledEquipment(equipment)) {
    return `${formatMoney(equipment.cost)} per bundle`
  }

  return `${formatMoney(equipment.cost)} each`
}

function formatBundledInventoryPriceLine(
  equipment: Equipment,
  quantity: number,
  unitPrice: string,
): string {
  const bundleLabel = formatEquipmentBundleLabel(equipment)
  const unitCopy = `${unitPrice} per bundle`

  if (quantity <= 1) {
    return bundleLabel ? `${unitCopy} · ${bundleLabel}` : unitCopy
  }

  const parts = [unitCopy, `${formatEquipmentPurchaseTotalPriceLabel(equipment, quantity)} total`]
  if (bundleLabel) parts.push(bundleLabel)
  return parts.join(' · ')
}

function formatNonBundledInventoryPriceLine(args: {
  equipment: Equipment
  quantity: number
  unitPrice: string
  stackable: boolean
  useValueSuffix: boolean
}): string {
  const { equipment, quantity, unitPrice, stackable, useValueSuffix } = args

  if (stackable && !useValueSuffix) {
    if (quantity <= 1) return unitPrice
    return `${unitPrice} each · ${formatEquipmentPurchaseTotalPriceLabel(equipment, quantity)} total`
  }

  if (quantity <= 1) {
    return useValueSuffix ? `${unitPrice} value` : unitPrice
  }

  const total = formatEquipmentPurchaseTotalPriceLabel(equipment, quantity)
  return useValueSuffix
    ? `${unitPrice} value · ${total} total value`
    : `${unitPrice} · ${total} total`
}

/** Single-line price copy for inventory rows. */
export function formatEquipmentInventoryPriceLine(args: {
  equipment: Equipment
  quantity: number
  /** Package grants use a "value" suffix; starting-gold purchases do not. */
  priceContext: 'package' | 'startingGold'
}): string {
  const { equipment, quantity, priceContext } = args
  if (!canPurchaseEquipment(equipment)) return ''

  const unitPrice = formatMoney(equipment.cost)
  if (isBundledEquipment(equipment)) {
    return formatBundledInventoryPriceLine(equipment, quantity, unitPrice)
  }

  return formatNonBundledInventoryPriceLine({
    equipment,
    quantity,
    unitPrice,
    stackable: isEquipmentStackable(equipment),
    useValueSuffix: priceContext === 'package',
  })
}

/** Muted bundle copy for inventory/picker surfaces (purchase units, not item units). */
export function formatEquipmentBundleLabel(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'adventuring_gear' || equipment.bundleSize === undefined) {
    return undefined
  }

  return `${equipment.bundleSize} ${equipment.name.toLowerCase()} per bundle`
}
