import { formatMoney, type EquipmentCost } from '../../primitives/units'

/** Formats a market price when present; returns `undefined` when `cost` is null. */
export function formatEquipmentCostLabel(cost: EquipmentCost): string | undefined {
  return cost !== null ? formatMoney(cost) : undefined
}
