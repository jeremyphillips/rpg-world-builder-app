import type { Currency, EquipmentCost, EquipmentKind } from '@rpg/contracts'

export type EquipmentCostFormValue = {
  amount?: number
  currency: Currency
} | null

export function hasMarketPriceDefaultForKind(kind: EquipmentKind): boolean {
  return kind !== 'magic_item'
}

/** Create-form defaults for economy fields — source of truth for initial hasMarketPrice/cost. */
export function equipmentEconomyFormDefaults(kind: EquipmentKind = 'adventuring_gear'): {
  hasMarketPrice: boolean
  cost: EquipmentCostFormValue
} {
  const hasMarketPrice = hasMarketPriceDefaultForKind(kind)
  return {
    hasMarketPrice,
    cost: hasMarketPrice ? { currency: 'gp' } : null,
  }
}

/** Maps economy form values to stored equipment cost. */
export function costFromForm(
  hasMarketPrice: boolean,
  cost: EquipmentCostFormValue | undefined,
): EquipmentCost {
  if (!hasMarketPrice) return null
  return {
    amount: cost?.amount as number,
    currency: cost?.currency ?? 'gp',
  }
}

/** Hydrates economy form fields from a stored equipment cost. */
export function costToForm(cost: EquipmentCost): {
  hasMarketPrice: boolean
  cost: EquipmentCostFormValue
} {
  if (cost === null) {
    return { hasMarketPrice: false, cost: null }
  }

  return {
    hasMarketPrice: true,
    cost: { amount: cost.amount, currency: cost.currency },
  }
}
