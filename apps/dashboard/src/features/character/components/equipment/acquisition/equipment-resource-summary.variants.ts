import { cva } from 'class-variance-authority'

export const equipmentResourceSummaryStackClasses = 'flex min-w-0 w-full flex-col'

/** Lets the group heading wrap inside the resource-summary heading slot. */
export const equipmentResourceSummaryHeadingClasses = 'whitespace-normal'

export const equipmentResourceSummarySectionDividerVariants = cva('border-t border-border', {
  variants: {
    density: {
      compact: 'mt-2 pt-2',
      comfortable: 'mt-4 pt-4',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const equipmentResourceSummaryBadgeListClasses =
  'flex w-full min-w-0 flex-wrap gap-2 whitespace-normal'

/**
 * Currency line stays 14px and wraps. Resets the truncated muted subheading slot
 * so the copy keeps the resource-summary color.
 */
export const equipmentResourceSummaryDescriptionClasses =
  'whitespace-normal text-sm text-foreground'

/** Ready check on the idle disc — same muted pairing as neutral StatusIcon variants. */
export const equipmentResourceSummarySlotStatusClasses =
  'bg-status-icon-idle text-status-icon-neutral-foreground'
