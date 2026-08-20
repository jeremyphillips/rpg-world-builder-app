import { CircleSlash } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import type { FieldSize } from './field.client'
import type { FieldGroupSummary } from './field-group-disclosure.types'
import {
  fieldGroupSummaryDisclosureLegendVariants,
  fieldGroupSummaryPrimaryVariants,
  fieldGroupSummaryStatusLineVariants,
} from './field-group-summary-disclosure.variants'
import {
  fieldGroupSummaryStatusDetailSeparatorClasses,
  fieldGroupSummaryStatusIndicatorVariants,
  fieldGroupSummaryStatusLabelVariants,
  fieldGroupSummaryStatusSecondaryClasses,
} from './field-group-summary-disclosure-collapsed.variants'
import { fieldGroupSummaryDisclosureActionButtonClasses } from './field-group-summary-disclosure.variants'
import { Text } from './text'

export type FieldGroupSummaryDisclosureCollapsedProps = {
  legend: string
  legendId: string
  panelId: string
  size: FieldSize
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

function FieldGroupSummaryStatusRow({
  summary,
  size,
}: {
  summary: FieldGroupSummary
  size: FieldSize
}) {
  const status = summary.status
  if (!status) return null

  const tone = status.tone ?? 'neutral'

  return (
    <span className={fieldGroupSummaryStatusLineVariants({ size })}>
      {status.indicator === 'dot' ? (
        <span
          aria-hidden
          className={fieldGroupSummaryStatusIndicatorVariants({ indicator: 'dot', tone })}
        />
      ) : null}
      {status.indicator === 'inactive' ? (
        <CircleSlash
          aria-hidden
          className={fieldGroupSummaryStatusIndicatorVariants({ indicator: 'inactive', tone })}
        />
      ) : null}
      <span
        className={cn(
          fieldGroupSummaryStatusLabelVariants({ tone }),
          fieldGroupSummaryDisclosureLegendVariants({ size }),
        )}
      >
        {status.label}
      </span>
      {summary.detail ? (
        <>
          <span aria-hidden className={fieldGroupSummaryStatusDetailSeparatorClasses}>
            ·
          </span>
          <Text
            as="span"
            variant="muted"
            className={fieldGroupSummaryDisclosureLegendVariants({ size })}
          >
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
  size,
  summary,
  openLabel,
  unsavedSuffix,
  showDirtySuffix,
  disabled,
  onOpen,
}: FieldGroupSummaryDisclosureCollapsedProps) {
  const accessibleName = buildSummaryAccessibleName(summary, unsavedSuffix, showDirtySuffix)
  const usesStatusRow = Boolean(summary.status)
  const legendTypography = fieldGroupSummaryDisclosureLegendVariants({ size })

  return (
    <>
      <Text id={legendId} variant="muted" className={legendTypography}>
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
            <FieldGroupSummaryStatusRow summary={summary} size={size} />
          ) : (
            <Text as="span" className={fieldGroupSummaryPrimaryVariants({ size })}>
              {summary.primary}
            </Text>
          )}
          {showDirtySuffix ? (
            <Text as="span" variant="muted" className={legendTypography}>
              {unsavedSuffix}
            </Text>
          ) : null}
          {summary.secondary ? (
            <Text
              as="span"
              variant={usesStatusRow ? undefined : 'muted'}
              className={
                usesStatusRow
                  ? fieldGroupSummaryStatusSecondaryClasses
                  : cn('mt-1', legendTypography)
              }
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
