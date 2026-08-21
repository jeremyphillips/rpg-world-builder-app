'use client'

import type { EquipmentPackageSwitchEvaluation } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  formatPackageSwitchWealth,
  packageSwitchDraftHasEdits,
  resolvePackageSwitchBudgetStatusLabel,
} from '../../../../../lib/equipment/equipment-package-switch-resolution.lib'
import {
  equipmentPackageSwitchResolutionBudgetLabelClasses,
  equipmentPackageSwitchResolutionBudgetRowClasses,
  equipmentPackageSwitchResolutionBudgetStatusVariants,
  equipmentPackageSwitchResolutionBudgetSummaryClasses,
  equipmentPackageSwitchResolutionBudgetSummaryTitleClasses,
  equipmentPackageSwitchResolutionBudgetValueClasses,
} from './equipment-package-switch-resolution-modal.variants'

function BudgetSummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className={equipmentPackageSwitchResolutionBudgetRowClasses}>
      <Text as="span" className={equipmentPackageSwitchResolutionBudgetLabelClasses}>
        {label}
      </Text>
      <Text
        as="span"
        className={valueClassName ?? equipmentPackageSwitchResolutionBudgetValueClasses}
      >
        {value}
      </Text>
    </div>
  )
}

export function PackageSwitchBudgetSummary({
  evaluation,
  draftQuantitiesByPurchaseId,
}: {
  evaluation: EquipmentPackageSwitchEvaluation
  draftQuantitiesByPurchaseId: Record<string, number>
}) {
  const { budget } = evaluation
  const hasDraftEdits = packageSwitchDraftHasEdits(evaluation, draftQuantitiesByPurchaseId)
  const status = resolvePackageSwitchBudgetStatusLabel(evaluation, hasDraftEdits)
  const statusValue = hasDraftEdits
    ? formatPackageSwitchWealth(
        status.tone === 'warning' ? budget.amountOverBudgetCp : budget.remainingAllowanceCp,
      )
    : formatPackageSwitchWealth(budget.initialAmountOverBudgetCp)

  return (
    <section
      aria-live="polite"
      aria-label="Budget summary"
      className={equipmentPackageSwitchResolutionBudgetSummaryClasses}
    >
      <Text as="p" className={equipmentPackageSwitchResolutionBudgetSummaryTitleClasses}>
        Budget summary
      </Text>
      <div className="space-y-2">
        <BudgetSummaryRow
          label={hasDraftEdits ? 'Draft purchased total' : 'Current purchased total'}
          value={formatPackageSwitchWealth(
            hasDraftEdits ? budget.draftTotalCostCp : budget.totalRetainedCostCp,
          )}
        />
        <BudgetSummaryRow
          label="Allowed after switch"
          value={formatPackageSwitchWealth(budget.targetAllowanceCp)}
        />
        {budget.nonEditableRetainedCostCp > 0 ? (
          <BudgetSummaryRow
            label="Non-editable purchases"
            value={formatPackageSwitchWealth(budget.nonEditableRetainedCostCp)}
          />
        ) : null}
        <BudgetSummaryRow
          label={status.label}
          value={statusValue}
          valueClassName={equipmentPackageSwitchResolutionBudgetStatusVariants({
            tone: status.tone,
          })}
        />
      </div>
    </section>
  )
}
