import { CircleSlash } from 'lucide-react'

import { Button } from './button.client'
import type { FieldGroupSummary } from './field-group-disclosure.types'
import {
  fieldGroupSummaryStatusDetailSeparatorClasses,
  fieldGroupSummaryStatusIndicatorVariants,
  fieldGroupSummaryStatusLabelClasses,
  fieldGroupSummaryStatusLineClasses,
  fieldGroupSummaryStatusSecondaryClasses,
} from './field-group-summary-disclosure-collapsed.variants'
import { fieldGroupSummaryDisclosureActionButtonClasses } from './field-group-summary-disclosure.variants'
import { Text } from './text'

export type FieldGroupSummaryDisclosureCollapsedProps = {
  legend: string
  legendId: string
  panelId: string
  summary: FieldGroupSummary
  openLabel: string
  unsavedSuffix: string
  showDirtySuffix: boolean
  disabled: boolean
  onOpen: () => void
}

function buildSummaryAccessibleName(
  summary: FieldGroupSummary,
  unsavedSuffix: string,
  showDirtySuffix: boolean,
): string {
  const parts: string[] = []

  if (summary.status) {
    parts.push(summary.status.label)
    if (summary.detail) parts.push(summary.detail)
  } else if (summary.primary) {
    parts.push(summary.primary)
  }

  if (summary.secondary) parts.push(summary.secondary)

  if (showDirtySuffix) {
    parts.push(unsavedSuffix.trim().replace(/^·\s*/, ''))
  }

  return parts.join('. ')
}

function FieldGroupSummaryStatusRow({ summary }: { summary: FieldGroupSummary }) {
  const status = summary.status
  if (!status) return null

  return (
    <span className={fieldGroupSummaryStatusLineClasses}>
      {status.indicator === 'dot' ? (
        <span
          aria-hidden
          className={fieldGroupSummaryStatusIndicatorVariants({ indicator: 'dot' })}
        />
      ) : null}
      {status.indicator === 'inactive' ? (
        <CircleSlash
          aria-hidden
          className={fieldGroupSummaryStatusIndicatorVariants({ indicator: 'inactive' })}
        />
      ) : null}
      <span className={fieldGroupSummaryStatusLabelClasses}>{status.label}</span>
      {summary.detail ? (
        <>
          <span aria-hidden className={fieldGroupSummaryStatusDetailSeparatorClasses}>
            ·
          </span>
          <Text as="span" variant="muted">
            {summary.detail}
          </Text>
        </>
      ) : null}
    </span>
  )
}

export function FieldGroupSummaryDisclosureCollapsed({
  legend,
  legendId,
  panelId,
  summary,
  openLabel,
  unsavedSuffix,
  showDirtySuffix,
  disabled,
  onOpen,
}: FieldGroupSummaryDisclosureCollapsedProps) {
  const accessibleName = buildSummaryAccessibleName(summary, unsavedSuffix, showDirtySuffix)
  const usesStatusRow = Boolean(summary.status)

  return (
    <>
      <Text id={legendId} variant="muted" className="text-sm">
        {legend}
      </Text>
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          aria-expanded={false}
          aria-controls={panelId}
          aria-label={accessibleName}
          disabled={disabled}
          onClick={onOpen}
        >
          {usesStatusRow ? (
            <FieldGroupSummaryStatusRow summary={summary} />
          ) : (
            <Text as="span" className="text-sm">
              {summary.primary}
            </Text>
          )}
          {showDirtySuffix ? (
            <Text as="span" variant="muted" className="text-sm">
              {unsavedSuffix}
            </Text>
          ) : null}
          {summary.secondary ? (
            <Text
              variant="muted"
              className={usesStatusRow ? fieldGroupSummaryStatusSecondaryClasses : 'mt-1 text-sm'}
            >
              {summary.secondary}
            </Text>
          ) : null}
        </button>
        <Button
          type="button"
          variant="text"
          size="sm"
          className={fieldGroupSummaryDisclosureActionButtonClasses}
          aria-expanded={false}
          aria-controls={panelId}
          disabled={disabled}
          onClick={onOpen}
        >
          {openLabel}
        </Button>
      </div>
    </>
  )
}
