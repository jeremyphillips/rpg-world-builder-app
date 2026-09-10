import { CircleSlash } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/utils'
import { resolveChromeClasses } from './chrome.variants'
import type { FieldSize } from './field.client'
import type { FieldGroupSummary } from './field-group-disclosure.types'
import {
  fieldGroupSummaryPrimaryVariants,
  fieldGroupSummaryStatusLineVariants,
} from './field-group-summary-disclosure.variants'
import {
  fieldGroupSummaryStatusDetailSeparatorClasses,
  fieldGroupSummaryStatusIndicatorVariants,
  fieldGroupSummaryStatusLabelVariants,
  fieldGroupSummaryStatusSecondaryClasses,
} from './field-group-summary-disclosure-collapsed.variants'
import { fieldInputDisabledClasses, fieldInputFocusClasses } from './field-input-chrome.variants'
import {
  fieldGroupSummaryTriggerAffordanceClasses,
  fieldGroupSummaryTriggerBodyClasses,
  fieldGroupSummaryTriggerLayoutClasses,
  fieldGroupSummaryTriggerSecondaryClasses,
  fieldGroupSummaryTriggerShellClasses,
  fieldGroupSummaryTriggerSizeVariants,
  fieldGroupSummaryTriggerTypographyClasses,
} from './field-group-summary-trigger.variants'
import { Text } from './text'

export type FieldGroupSummaryTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick' | 'children'
> & {
  size: FieldSize
  summary: FieldGroupSummary
  openLabel: string
  unsavedSuffix: string
  showDirtySuffix: boolean
  onOpen: () => void
  panelId?: string
  expanded?: boolean
  hasPopup?: 'dialog'
  /** When set, names the trigger from a visual heading instead of the summary `aria-label`. */
  labelledBy?: string
}

export function buildSummaryAccessibleName(
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
    <span
      className={cn(
        fieldGroupSummaryStatusLineVariants({ size }),
        fieldGroupSummaryTriggerTypographyClasses,
      )}
    >
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
          fieldGroupSummaryTriggerTypographyClasses,
        )}
      >
        {status.label}
      </span>
      {summary.detail ? (
        <>
          <span aria-hidden className={fieldGroupSummaryStatusDetailSeparatorClasses}>
            ·
          </span>
          <Text as="span" variant="muted" className={fieldGroupSummaryTriggerTypographyClasses}>
            {summary.detail}
          </Text>
        </>
      ) : null}
    </span>
  )
}

/** Single-tab-stop faux input that opens a summary disclosure or dialog. */
export function FieldGroupSummaryTrigger({
  size,
  summary,
  openLabel,
  unsavedSuffix,
  showDirtySuffix,
  disabled,
  onOpen,
  panelId,
  expanded = false,
  hasPopup,
  labelledBy,
  className,
  ...props
}: FieldGroupSummaryTriggerProps) {
  const accessibleName = buildSummaryAccessibleName(summary, unsavedSuffix, showDirtySuffix)
  const usesStatusRow = Boolean(summary.status)
  const chromeClasses = resolveChromeClasses(summary.chrome, { layout: 'summary-trigger' })

  return (
    <button
      type="button"
      className={cn(
        chromeClasses
          ? cn(
              fieldGroupSummaryTriggerLayoutClasses,
              fieldInputFocusClasses,
              fieldInputDisabledClasses,
              chromeClasses,
            )
          : fieldGroupSummaryTriggerShellClasses,
        fieldGroupSummaryTriggerSizeVariants({ size }),
        className,
      )}
      data-summary-chrome={chromeClasses ? '' : undefined}
      aria-expanded={expanded}
      aria-haspopup={hasPopup}
      aria-controls={panelId}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : accessibleName}
      disabled={disabled}
      onClick={onOpen}
      {...props}
    >
      <span className={fieldGroupSummaryTriggerBodyClasses}>
        {usesStatusRow ? (
          <FieldGroupSummaryStatusRow summary={summary} size={size} />
        ) : (
          <Text
            as="span"
            className={cn(
              fieldGroupSummaryPrimaryVariants({ size }),
              fieldGroupSummaryTriggerTypographyClasses,
            )}
          >
            {summary.primary}
          </Text>
        )}
        {showDirtySuffix ? (
          <Text as="span" variant="muted" className={fieldGroupSummaryTriggerTypographyClasses}>
            {unsavedSuffix}
          </Text>
        ) : null}
        {summary.secondary ? (
          <Text
            as="span"
            variant={usesStatusRow ? undefined : 'muted'}
            className={cn(
              fieldGroupSummaryTriggerSecondaryClasses,
              usesStatusRow
                ? fieldGroupSummaryStatusSecondaryClasses
                : cn('mt-1', fieldGroupSummaryTriggerTypographyClasses),
            )}
          >
            {summary.secondary}
          </Text>
        ) : null}
      </span>
      <span aria-hidden className={fieldGroupSummaryTriggerAffordanceClasses}>
        {openLabel}
      </span>
    </button>
  )
}
