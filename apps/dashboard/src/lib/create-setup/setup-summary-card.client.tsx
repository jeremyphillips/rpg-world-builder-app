'use client'

import type { ReactNode } from 'react'

import { Button, Eyebrow } from '@rpg/ui'

import {
  setupSummaryCardActionLinkClasses,
  setupSummaryCardListClasses,
  setupSummaryCardRowClasses,
  setupSummaryCardRowCopyClasses,
  setupSummaryCardRowDividerClasses,
  setupSummaryCardRowHelperVariants,
  setupSummaryCardRowLabelVariants,
  setupSummaryCardRowValueVariants,
  setupSummaryCardSectionClasses,
  setupSummaryCardShellClasses,
} from './setup-summary-card.variants'

export type SetupSummaryRowProps = {
  label: string
  value: ReactNode
  helper?: ReactNode
  action?: ReactNode
  showDivider?: boolean
}

export function SetupSummaryRow({
  label,
  value,
  helper,
  action,
  showDivider,
}: SetupSummaryRowProps) {
  return (
    <div
      className={
        showDivider
          ? `${setupSummaryCardRowClasses} ${setupSummaryCardRowDividerClasses}`
          : setupSummaryCardRowClasses
      }
    >
      <div className={setupSummaryCardRowCopyClasses}>
        <dt className={setupSummaryCardRowLabelVariants()}>{label}</dt>
        <dd className={setupSummaryCardRowValueVariants()}>{value}</dd>
        {helper ? <p className={setupSummaryCardRowHelperVariants()}>{helper}</p> : null}
      </div>
      {action}
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
      className={setupSummaryCardActionLinkClasses}
      aria-label={ariaLabel}
      onClick={onChange}
    >
      {changeLabel}
    </Button>
  )
}
