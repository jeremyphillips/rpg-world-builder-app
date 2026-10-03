import { formatWealthAsGold, type EquipmentBudgetSummary } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

export function formatEquipmentBudgetGuidanceCopy(budget: EquipmentBudgetSummary): {
  heading: string
  description: string
} {
  return {
    heading: `${formatWealthAsGold(budget.remaining)} remaining`,
    description: joinInlineMetadata([
      `${formatWealthAsGold(budget.starting)} starting`,
      `${formatWealthAsGold(budget.spent)} spent`,
    ]),
  }
}
