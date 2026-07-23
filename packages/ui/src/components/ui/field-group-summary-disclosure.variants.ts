import { cn } from '../../lib/utils'
import { optionalFieldDisclosureActionButtonClasses } from './optional-field-disclosure.variants'

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
