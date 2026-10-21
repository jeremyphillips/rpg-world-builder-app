import { cva } from 'class-variance-authority'

export const equipmentResourceSummaryStackClasses = 'flex min-w-0 w-full flex-col'

export const equipmentResourceSummarySectionDividerVariants = cva('border-t border-border', {
  variants: {
    density: {
      compact: 'mt-2 pt-2',
      comfortable: 'mt-4 pt-4',
      spacious: 'mt-4 pt-4',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})
