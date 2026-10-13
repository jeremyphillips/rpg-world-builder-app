'use client'

import type { ReactNode } from 'react'

import {
  SelectionSummaryCard,
  SelectionSummaryChangeAction,
  SelectionSummaryRow,
  type SelectionSummaryRowProps,
} from './selection-summary-card'
import { selectionSummaryCardListClasses } from './selection-summary-card.variants'

export const SELECTION_SUMMARY_DEFAULT_CHANGE_LABEL = 'Change' as const
export const SELECTION_SUMMARY_DEFAULT_EYEBROW = 'Selections' as const

export type SummaryDecisionRow = {
  id: string
  label: string
  value: ReactNode
  description?: ReactNode
  /** When it matches `activeDecisionId`, Change navigation is suppressed. */
  decisionId?: string
  /** Omit for read-only rows. Suppressed while the row is the active decision. */
  onNavigate?: () => void
  changeLabel?: string
  valueActionAriaLabel?: string
}

export type SummaryDecisionCard = {
  id: string
  eyebrow?: string
  rows: readonly SummaryDecisionRow[]
}

export function mapSummaryDecisionRowsToSelectionProps(args: {
  rows: readonly SummaryDecisionRow[]
  activeDecisionId?: string | null
  defaultChangeLabel?: string
}): SelectionSummaryRowProps[] {
  const defaultChangeLabel = args.defaultChangeLabel ?? SELECTION_SUMMARY_DEFAULT_CHANGE_LABEL

  return args.rows.map((row) => {
    const isActive =
      args.activeDecisionId != null &&
      row.decisionId != null &&
      row.decisionId === args.activeDecisionId

    if (isActive || row.onNavigate == null) {
      return {
        label: row.label,
        value: row.value,
        helper: row.description,
      }
    }

    const valueActionAriaLabel = row.valueActionAriaLabel ?? `Change ${row.label.toLowerCase()}`
    const changeLabel = row.changeLabel ?? defaultChangeLabel
    const onNavigate = row.onNavigate

    return {
      label: row.label,
      value: row.value,
      helper: row.description,
      onValueClick: onNavigate,
      valueActionAriaLabel,
      action: (
        <SelectionSummaryChangeAction
          changeLabel={changeLabel}
          ariaLabel={valueActionAriaLabel}
          onChange={onNavigate}
        />
      ),
    }
  })
}

export type DecisionSummaryChrome = 'card' | 'embedded'

export type DecisionSummaryPanelProps = {
  rows: readonly SummaryDecisionRow[]
  /** Default `card` — bordered summary shell + eyebrow. Use `embedded` inside composition stacks. */
  chrome?: DecisionSummaryChrome
  /** Default `Selections` for card chrome. Pass `false` to omit (embedded layouts only). */
  eyebrow?: string | false
  activeDecisionId?: string | null
  defaultChangeLabel?: string
  className?: string
}

/** Completed decisions with explicit card vs embedded chrome. */
export function DecisionSummaryPanel({
  rows,
  chrome = 'card',
  eyebrow,
  activeDecisionId = null,
  defaultChangeLabel,
  className,
}: DecisionSummaryPanelProps) {
  if (rows.length === 0) return null

  const selectionRows = mapSummaryDecisionRowsToSelectionProps({
    rows,
    activeDecisionId,
    defaultChangeLabel,
  })
  if (selectionRows.length === 0) return null

  if (chrome === 'embedded') {
    return (
      <dl className={selectionSummaryCardListClasses}>
        {selectionRows.map((row, index) => (
          <SelectionSummaryRow key={rows[index]!.id} {...row} showDivider={index > 0} />
        ))}
      </dl>
    )
  }

  const resolvedEyebrow = typeof eyebrow === 'string' ? eyebrow : SELECTION_SUMMARY_DEFAULT_EYEBROW

  return (
    <SelectionSummaryCard
      eyebrow={resolvedEyebrow}
      rows={selectionRows}
      {...(className ? { className } : {})}
    />
  )
}

export type SelectionSummaryCardsProps = {
  cards: readonly SummaryDecisionCard[]
  activeDecisionId?: string | null
  defaultChangeLabel?: string
  defaultEyebrow?: string
  className?: string
}

function resolveSummaryDecisionCardEyebrow(
  card: SummaryDecisionCard,
  defaultEyebrow: string,
): string {
  return card.eyebrow ?? defaultEyebrow
}

/** Renders one or more completed-decision summary cards from neutral row models. */
export function SelectionSummaryCards({
  cards,
  activeDecisionId = null,
  defaultChangeLabel,
  defaultEyebrow = SELECTION_SUMMARY_DEFAULT_EYEBROW,
  className,
}: SelectionSummaryCardsProps) {
  const rendered = cards.flatMap((card) => {
    const rows = mapSummaryDecisionRowsToSelectionProps({
      rows: card.rows,
      activeDecisionId,
      defaultChangeLabel,
    })
    if (rows.length === 0) return []

    return [
      <SelectionSummaryCard
        key={card.id}
        eyebrow={resolveSummaryDecisionCardEyebrow(card, defaultEyebrow)}
        rows={rows}
        {...(className ? { className } : {})}
      />,
    ]
  })

  if (rendered.length === 0) return null

  return <>{rendered}</>
}
