import type { EquipmentPackageSwitchEvaluation } from '@rpg/contracts'
import { Panel, Text, cn } from '@rpg/ui'
import { cva } from 'class-variance-authority'

import {
  PACKAGE_SWITCH_BUDGET_AVAILABLE_LABEL,
  PACKAGE_SWITCH_BUDGET_CURRENT_PURCHASES_LABEL,
  formatPackageSwitchWealth,
  packageSwitchDraftHasEdits,
  resolvePackageSwitchBudgetStatusLabel,
} from '../../../../../lib/equipment/equipment-package-switch-resolution.lib'

const packageSwitchBudgetStatusValueVariants = cva('shrink-0 tabular-nums font-medium', {
  variants: {
    tone: {
      warning: 'text-destructive',
      success: 'text-semantic-success',
      neutral: 'text-foreground',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

function BudgetSummaryRow({
  label,
  value,
  valueClassName,
  className,
}: {
  label: string
  value: string
  valueClassName?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 text-sm', className)}>
      <Text as="span" variant="muted">
        {label}
      </Text>
      <Text as="span" className={valueClassName ?? 'shrink-0 tabular-nums text-foreground'}>
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
    <Panel
      as="section"
      tone="subtle"
      density="compact"
      aria-live="polite"
      aria-label="Budget summary"
    >
      <Text as="p" variant="label" className="mb-3 text-foreground">
        Budget summary
      </Text>
      <div className="space-y-2">
        <BudgetSummaryRow
          label={PACKAGE_SWITCH_BUDGET_CURRENT_PURCHASES_LABEL}
          value={formatPackageSwitchWealth(
            hasDraftEdits ? budget.draftTotalCostCp : budget.totalRetainedCostCp,
          )}
        />
        <BudgetSummaryRow
          label={PACKAGE_SWITCH_BUDGET_AVAILABLE_LABEL}
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
          valueClassName={packageSwitchBudgetStatusValueVariants({ tone: status.tone })}
          className="border-t border-border pt-2"
        />
      </div>
    </Panel>
  )
}
