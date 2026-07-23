import { cva } from 'class-variance-authority'

/** Status line row — indicator, label, and detail separator. */
export const fieldGroupSummaryStatusLineClasses = 'flex min-w-0 items-center gap-1.5 text-sm'

/** Status label — strong foreground for both positive and neutral tones. */
export const fieldGroupSummaryStatusLabelClasses = 'font-medium text-foreground'

/** Middle-dot separator before detail text. */
export const fieldGroupSummaryStatusDetailSeparatorClasses = 'text-muted-foreground'

/** Explanatory line below the status row. */
export const fieldGroupSummaryStatusSecondaryClasses = 'mt-1 text-xs'

export const fieldGroupSummaryStatusIndicatorVariants = cva('shrink-0', {
  variants: {
    indicator: {
      dot: 'size-1.5 rounded-full bg-semantic-success',
      inactive: 'size-3.5 text-muted-foreground',
    },
  },
})
