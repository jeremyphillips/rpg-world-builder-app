import { formatWealthAsGold, type EquipmentBudgetSummary } from '@rpg/contracts'

export function formatEquipmentBudgetGuidanceCopy(budget: EquipmentBudgetSummary): {
  heading: string
  description: string
} {
  return {
    heading: `${formatWealthAsGold(budget.remaining)} remaining`,
    description: `${formatWealthAsGold(budget.starting)} starting · ${formatWealthAsGold(budget.spent)} spent`,
  }
}
