import { Icon } from './icon/icon'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { resolveChromeClasses } from './chrome.variants'
import type { FieldSize } from './field.client'
import type { FieldGroupSummary, FieldGroupSummaryStatusTone } from './field-group-disclosure.types'
import type { StatusDotVariantProps } from './status-dot.variants'
import {
  fieldGroupSummaryPrimaryVariants,
  fieldGroupSummaryStatusLineVariants,
} from './field-group-summary-disclosure.variants'
import {
  fieldGroupSummaryStatusIndicatorVariants,
  fieldGroupSummaryStatusLabelVariants,
  fieldGroupSummaryStatusSecondaryClasses,
} from './field-group-summary-disclosure-collapsed.variants'
import {
  fieldGroupSummaryTriggerAffordanceClasses,
  fieldGroupSummaryTriggerBodyClasses,
  fieldGroupSummaryTriggerLayoutClasses,
  fieldGroupSummaryTriggerSecondaryClasses,
  fieldGroupSummaryTriggerShellClasses,
  fieldGroupSummaryTriggerSizeVariants,
  fieldGroupSummaryTriggerTypographyClasses,
} from './field-group-summary-trigger.variants'
import { InlineMetadata } from './inline-metadata'
import { StatusDot } from './status-dot'
import { Text } from './text'

export type FieldGroupSummaryTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick' | 'children'
> & {
  size: FieldSize
  summary: FieldGroupSummary
  openLabel: ReactNode
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

function resolveSummaryStatusDotTone(
  tone: FieldGroupSummaryStatusTone,
): NonNullable<StatusDotVariantProps['tone']> {
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  return 'neutral'
}

const fieldGroupSummaryStatusLabelItemClasses = (tone: FieldGroupSummaryStatusTone) =>
  cn(fieldGroupSummaryStatusLabelVariants({ tone }), fieldGroupSummaryTriggerTypographyClasses)

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
  const density = size === 'sm' ? 'compact' : 'comfortable'

  return (
    <InlineMetadata
      role="supporting"
      density={density}
      wrap={false}
      className={cn(
        fieldGroupSummaryStatusLineVariants({ size }),
        fieldGroupSummaryTriggerTypographyClasses,
        'min-w-0 flex-1 truncate',
      )}
    >
      {status.indicator === 'dot' ? (
        <InlineMetadata.Item className={fieldGroupSummaryStatusLabelItemClasses(tone)}>
          <StatusDot tone={resolveSummaryStatusDotTone(tone)} size="sm" label={status.label} />
        </InlineMetadata.Item>
      ) : null}
      {status.indicator === 'inactive' ? (
        <InlineMetadata.Item className={fieldGroupSummaryStatusLabelItemClasses(tone)}>
          <span className="inline-flex items-center gap-1.5">
            <Icon
              name="circle-slash"
              size="md"
              className={fieldGroupSummaryStatusIndicatorVariants({ indicator: 'inactive', tone })}
            />
            <span>{status.label}</span>
          </span>
        </InlineMetadata.Item>
      ) : null}
      {status.indicator == null ? (
        <InlineMetadata.Item className={fieldGroupSummaryStatusLabelItemClasses(tone)}>
          {status.label}
        </InlineMetadata.Item>
      ) : null}
      {summary.detail ? (
        <InlineMetadata.Item truncate>
          <Text
            as="span"
            variant="muted"
            className={cn(fieldGroupSummaryTriggerTypographyClasses, 'truncate')}
          >
            {summary.detail}
          </Text>
        </InlineMetadata.Item>
      ) : null}
    </InlineMetadata>
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
          ? cn(fieldGroupSummaryTriggerLayoutClasses, chromeClasses)
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
