import { cva } from 'class-variance-authority'

export const equipmentResourceSummaryRowVariants = cva('flex gap-4', {
  variants: {
    alignment: {
      center: 'items-center',
      start: 'items-start',
    },
  },
})

export const equipmentResourceSummaryStackClasses = 'flex min-w-0 flex-1 flex-col'

export const equipmentResourceSummarySectionDividerClasses = 'border-t border-border pt-3'

export const equipmentResourceSummaryBadgeListClasses = 'flex flex-wrap gap-2 whitespace-normal'

export const equipmentResourceSummarySlotCheckClasses = 'size-3 shrink-0 text-current'
