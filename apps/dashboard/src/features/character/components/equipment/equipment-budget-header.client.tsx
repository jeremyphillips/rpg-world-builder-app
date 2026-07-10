'use client'

import { formatWealthAsGold, type EquipmentBudgetSummary } from '@rpg/contracts'
import { EmphasisDetailLine } from '@rpg/ui'

export type EquipmentBudgetHeaderProps = {
  budget: EquipmentBudgetSummary
}

export function EquipmentBudgetHeader({ budget }: EquipmentBudgetHeaderProps) {
  return (
    <EmphasisDetailLine
      as="p"
      className="text-sm text-foreground"
      prefix={<span className="font-medium">Budget:</span>}
      primary={`${formatWealthAsGold(budget.remaining)} remaining`}
      secondary={`${formatWealthAsGold(budget.starting)} starting · ${formatWealthAsGold(budget.spent)} spent`}
    />
  )
}
