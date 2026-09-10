import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSizeTypographyClasses } from './field-sizing.variants'

/** Summary disclosure legend + status copy — follows resolved section control scale. */
export const fieldGroupSummaryDisclosureLegendVariants = cva('', {
  variants: {
    size: fieldSizeTypographyClasses,
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Collapsed legend + summary trigger stack inside inline disclosure groups. */
export const fieldGroupSummaryDisclosureShellClasses = 'flex min-w-0 flex-col gap-1'

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

/** Right-aligned outline Done control at the bottom of the expanded panel. */
export const fieldGroupSummaryDisclosureFooterClasses = 'flex justify-end pt-3'
