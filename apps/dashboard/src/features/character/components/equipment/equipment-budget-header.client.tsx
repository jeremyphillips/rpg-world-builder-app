'use client'

import { formatWealthAsGold, type EquipmentBudgetSummary } from '@rpg/contracts'

import {
  equipmentBudgetHeaderClasses,
  equipmentBudgetHeaderDividerClasses,
  equipmentBudgetHeaderLabelClasses,
  equipmentBudgetHeaderMutedClasses,
  equipmentBudgetHeaderRemainingClasses,
  EQUIPMENT_BUDGET_HEADER_DIVIDER,
} from './equipment-budget-header.variants'

export type EquipmentBudgetHeaderProps = {
  budget: EquipmentBudgetSummary
}

export function EquipmentBudgetHeader({ budget }: EquipmentBudgetHeaderProps) {
  return (
    <p className={equipmentBudgetHeaderClasses}>
      <span className={equipmentBudgetHeaderLabelClasses}>Budget:</span>{' '}
      <span className={equipmentBudgetHeaderRemainingClasses}>
        {formatWealthAsGold(budget.remaining)} remaining
      </span>
      <span className={equipmentBudgetHeaderDividerClasses} aria-hidden>
        {EQUIPMENT_BUDGET_HEADER_DIVIDER}
      </span>
      <span className={equipmentBudgetHeaderMutedClasses}>
        {formatWealthAsGold(budget.starting)} starting
        <span className={equipmentBudgetHeaderDividerClasses} aria-hidden>
          {EQUIPMENT_BUDGET_HEADER_DIVIDER}
        </span>
        {formatWealthAsGold(budget.spent)} spent
      </span>
    </p>
  )
}
