'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Eyebrow } from './eyebrow'
import {
  selectionSummaryCardChangeActionClasses,
  selectionSummaryCardListClasses,
  selectionSummaryCardRowActionColumnClasses,
  selectionSummaryCardRowGroupClasses,
  selectionSummaryCardRowGroupDividerClasses,
  selectionSummaryCardRowHelperVariants,
  selectionSummaryCardRowLabelVariants,
  selectionSummaryCardRowValueButtonClasses,
  selectionSummaryCardRowValueCellClasses,
  selectionSummaryCardRowValueVariants,
  selectionSummaryCardSectionClasses,
  selectionSummaryCardShellClasses,
} from './selection-summary-card.variants'

export type SelectionSummaryRowProps = {
  label: string
  value: ReactNode
  helper?: ReactNode
  action?: ReactNode
  onValueClick?: () => void
  valueActionAriaLabel?: string
  showDivider?: boolean
}

function buildSelectionSummaryValueAriaLabel(value: ReactNode, actionAriaLabel: string): string {
  const valueText = typeof value === 'string' || typeof value === 'number' ? String(value) : ''
  return valueText ? `${valueText}, ${actionAriaLabel}` : actionAriaLabel
}

export function SelectionSummaryRow({
  label,
  value,
  helper,
  action,
  onValueClick,
  valueActionAriaLabel,
  showDivider,
}: SelectionSummaryRowProps) {
  const valueContent =
    onValueClick != null && valueActionAriaLabel != null ? (
      <button
        type="button"
        className={cn(
          selectionSummaryCardRowValueVariants(),
          selectionSummaryCardRowValueButtonClasses,
        )}
        aria-label={buildSelectionSummaryValueAriaLabel(value, valueActionAriaLabel)}
        onClick={onValueClick}
      >
        {value}
      </button>
    ) : (
      <span className={selectionSummaryCardRowValueVariants()}>{value}</span>
    )

  return (
    <div
      className={cn(
        selectionSummaryCardRowGroupClasses,
        showDivider ? selectionSummaryCardRowGroupDividerClasses : undefined,
      )}
    >
      <dt className={selectionSummaryCardRowLabelVariants()}>{label}</dt>
      <dd className={selectionSummaryCardRowValueCellClasses}>{valueContent}</dd>
      <dd className={selectionSummaryCardRowActionColumnClasses}>{action ?? null}</dd>
      {helper ? <dd className={selectionSummaryCardRowHelperVariants()}>{helper}</dd> : null}
    </div>
  )
}

export type SelectionSummaryCardProps = {
  eyebrow: string
  rows: readonly SelectionSummaryRowProps[]
  cardAction?: ReactNode
  className?: string
}

/** Quiet key/value readout for completed decisions within a sequence. */
export function SelectionSummaryCard({
  eyebrow,
  rows,
  cardAction,
  className,
}: SelectionSummaryCardProps) {
  if (rows.length === 0) return null

  return (
    <section className={className ?? selectionSummaryCardSectionClasses}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow size="md">{eyebrow}</Eyebrow>
        {cardAction}
      </div>
      <article className={selectionSummaryCardShellClasses}>
        <dl className={selectionSummaryCardListClasses}>
          {rows.map((row, index) => (
            <SelectionSummaryRow key={row.label} {...row} showDivider={index > 0} />
          ))}
        </dl>
      </article>
    </section>
  )
}

export type SelectionSummaryChangeActionProps = {
  changeLabel: string
  ariaLabel: string
  onChange: () => void
}

export function SelectionSummaryChangeAction({
  changeLabel,
  ariaLabel,
  onChange,
}: SelectionSummaryChangeActionProps) {
  return (
    <Button
      type="button"
      variant="text"
      size="sm"
      density="compact"
      className={selectionSummaryCardChangeActionClasses}
      aria-label={ariaLabel}
      onClick={onChange}
    >
      {changeLabel}
    </Button>
  )
}
