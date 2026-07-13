'use client'

import { formatWealthAsGold, type EquipmentBudgetSummary } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  equipmentBudgetHeaderMetaClasses,
  equipmentBudgetHeaderPanelClasses,
  equipmentBudgetHeaderRemainingClasses,
} from './equipment-budget-header.variants'

export type EquipmentBudgetHeaderProps = {
  budget: EquipmentBudgetSummary
}

export function EquipmentBudgetHeader({ budget }: EquipmentBudgetHeaderProps) {
  return (
    <div className={equipmentBudgetHeaderPanelClasses}>
      <Text as="p" className={equipmentBudgetHeaderRemainingClasses}>
        {formatWealthAsGold(budget.remaining)} remaining
      </Text>
      <Text as="p" className={equipmentBudgetHeaderMetaClasses}>
        {formatWealthAsGold(budget.starting)} starting · {formatWealthAsGold(budget.spent)} spent
      </Text>
    </div>
  )
}
