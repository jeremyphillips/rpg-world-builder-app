'use client'

import type { ReactNode } from 'react'

import { Button, Eyebrow, cn } from '@rpg/ui'

import {
  setupSummaryCardChangeActionClasses,
  setupSummaryCardListClasses,
  setupSummaryCardRowActionColumnClasses,
  setupSummaryCardRowCopyColumnClasses,
  setupSummaryCardRowClasses,
  setupSummaryCardRowDividerClasses,
  setupSummaryCardRowHelperVariants,
  setupSummaryCardRowLabelVariants,
  setupSummaryCardRowPrimaryLineClasses,
  setupSummaryCardRowValueButtonClasses,
  setupSummaryCardRowValueVariants,
  setupSummaryCardSectionClasses,
  setupSummaryCardShellClasses,
} from './setup-summary-card.variants'

export type SetupSummaryRowProps = {
  label: string
  value: ReactNode
  helper?: ReactNode
  action?: ReactNode
  onValueClick?: () => void
  valueActionAriaLabel?: string
  showDivider?: boolean
}

function buildSetupSummaryValueAriaLabel(value: ReactNode, actionAriaLabel: string): string {
  const valueText = typeof value === 'string' || typeof value === 'number' ? String(value) : ''
  return valueText ? `${valueText}, ${actionAriaLabel}` : actionAriaLabel
}

export function SetupSummaryRow({
  label,
  value,
  helper,
  action,
  onValueClick,
  valueActionAriaLabel,
  showDivider,
}: SetupSummaryRowProps) {
  const valueContent =
    onValueClick != null && valueActionAriaLabel != null ? (
      <button
        type="button"
        className={cn(setupSummaryCardRowValueVariants(), setupSummaryCardRowValueButtonClasses)}
        aria-label={buildSetupSummaryValueAriaLabel(value, valueActionAriaLabel)}
        onClick={onValueClick}
      >
        {value}
      </button>
    ) : (
      <span className={setupSummaryCardRowValueVariants()}>{value}</span>
    )

  return (
    <div
      className={
        showDivider
          ? `${setupSummaryCardRowClasses} ${setupSummaryCardRowDividerClasses}`
          : setupSummaryCardRowClasses
      }
    >
      <div className={setupSummaryCardRowCopyColumnClasses}>
        <div className={setupSummaryCardRowPrimaryLineClasses}>
          <dt className={setupSummaryCardRowLabelVariants()}>{label}:</dt>
          <dd className="min-w-0">{valueContent}</dd>
        </div>
        {helper ? <p className={setupSummaryCardRowHelperVariants()}>{helper}</p> : null}
      </div>
      {action ? <div className={setupSummaryCardRowActionColumnClasses}>{action}</div> : null}
    </div>
  )
}

export type SetupSummaryCardProps = {
  eyebrow: string
  rows: readonly SetupSummaryRowProps[]
  cardAction?: ReactNode
  className?: string
}

/** Quiet key/value setup readout — parallel to ChooserSummaryCard, not a replacement. */
export function SetupSummaryCard({ eyebrow, rows, cardAction, className }: SetupSummaryCardProps) {
  if (rows.length === 0) return null

  return (
    <section className={className ?? setupSummaryCardSectionClasses}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow size="md">{eyebrow}</Eyebrow>
        {cardAction}
      </div>
      <article className={setupSummaryCardShellClasses}>
        <dl className={setupSummaryCardListClasses}>
          {rows.map((row, index) => (
            <SetupSummaryRow key={row.label} {...row} showDivider={index > 0} />
          ))}
        </dl>
      </article>
    </section>
  )
}

export type SetupSummaryCardChangeActionProps = {
  changeLabel: string
  ariaLabel: string
  onChange: () => void
}

export function SetupSummaryCardChangeAction({
  changeLabel,
  ariaLabel,
  onChange,
}: SetupSummaryCardChangeActionProps) {
  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      density="compact"
      className={setupSummaryCardChangeActionClasses}
      aria-label={ariaLabel}
      onClick={onChange}
    >
      {changeLabel}
    </Button>
  )
}
