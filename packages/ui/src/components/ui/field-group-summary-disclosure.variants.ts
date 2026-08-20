import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSizeTypographyClasses, type FieldSizeToken } from './field-sizing.variants'
import { optionalFieldDisclosureActionButtonClasses } from './optional-field-disclosure.variants'

/** Summary disclosure legend + status copy — follows resolved section control scale. */
export const fieldGroupSummaryDisclosureLegendVariants = cva('', {
  variants: {
    size: fieldSizeTypographyClasses,
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Status row container — indicator, label, and detail at field label scale. */
export const fieldGroupSummaryStatusLineVariants = cva('flex min-w-0 items-center gap-1.5', {
  variants: {
    size: fieldSizeTypographyClasses,
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Primary summary line when no structured status row is present. */
export const fieldGroupSummaryPrimaryVariants = cva('', {
  variants: {
    size: fieldSizeTypographyClasses,
  },
  defaultVariants: {
    size: 'md',
  },
})

export function resolveFieldGroupSummaryDisclosureExpandedLegendClassName(
  size: FieldSizeToken = 'md',
): string {
  return cn(fieldGroupSummaryDisclosureLegendVariants({ size }), 'font-medium')
}

/** Compact text action buttons (Change / Done) — matches optional field disclosure. */
export const fieldGroupSummaryDisclosureActionButtonClasses =
  optionalFieldDisclosureActionButtonClasses

/** Expanded header row with legend + Done action. */
export const fieldGroupSummaryDisclosureHeaderClasses = 'flex items-center justify-between gap-2'

/** Expanded field stack top divider when `panelDivider` is enabled (default). */
export const fieldGroupSummaryDisclosurePanelDividerClasses = 'border-t border-border'

/** Spacing between expanded header and field stack. */
export const fieldGroupSummaryDisclosurePanelPaddingClasses = 'pt-3'

/** Expanded field stack below the disclosure header divider (divider + padding). */
export const fieldGroupSummaryDisclosurePanelClasses = cn(
  fieldGroupSummaryDisclosurePanelDividerClasses,
  fieldGroupSummaryDisclosurePanelPaddingClasses,
)

export function resolveFieldGroupSummaryDisclosurePanelClasses(panelDivider = true): string {
  return cn(
    panelDivider && fieldGroupSummaryDisclosurePanelDividerClasses,
    fieldGroupSummaryDisclosurePanelPaddingClasses,
  )
}
