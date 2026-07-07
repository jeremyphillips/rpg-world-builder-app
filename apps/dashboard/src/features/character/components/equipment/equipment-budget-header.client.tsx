'use client'

import type { EquipmentBudgetSummary } from '@rpg/contracts'

import { formatEquipmentBudgetWealth } from './equipment-picker-drawer.lib'
import {
  equipmentBudgetHeaderClasses,
  equipmentBudgetHeaderLabelClasses,
  equipmentBudgetHeaderValueClasses,
} from './equipment-budget-header.variants'

export type EquipmentBudgetHeaderProps = {
  budget: EquipmentBudgetSummary
}

export function EquipmentBudgetHeader({ budget }: EquipmentBudgetHeaderProps) {
  return (
    <dl className={equipmentBudgetHeaderClasses}>
      <div>
        <dt className={equipmentBudgetHeaderLabelClasses}>Starting</dt>
        <dd className={equipmentBudgetHeaderValueClasses}>
          {formatEquipmentBudgetWealth(budget.starting)}
        </dd>
      </div>
      <div>
        <dt className={equipmentBudgetHeaderLabelClasses}>Spent</dt>
        <dd className={equipmentBudgetHeaderValueClasses}>
          {formatEquipmentBudgetWealth(budget.spent)}
        </dd>
      </div>
      <div>
        <dt className={equipmentBudgetHeaderLabelClasses}>Remaining</dt>
        <dd className={equipmentBudgetHeaderValueClasses}>
          {formatEquipmentBudgetWealth(budget.remaining)}
        </dd>
      </div>
    </dl>
  )
}
