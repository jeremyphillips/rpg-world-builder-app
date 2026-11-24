import { cva } from 'class-variance-authority'

export {
  fieldGroupSummaryDisclosureLegendVariants,
  fieldGroupSummaryPrimaryVariants,
  fieldGroupSummaryStatusLineVariants,
} from './field-group-summary-disclosure.variants'

/** Middle-dot separator before detail text. */
export const fieldGroupSummaryStatusDetailSeparatorClasses = 'text-muted-foreground'

/** Explanatory line below the status row. */
export const fieldGroupSummaryStatusSecondaryClasses = 'mt-1 text-style-caption'

export const fieldGroupSummaryStatusLabelVariants = cva('font-medium', {
  variants: {
    tone: {
      neutral: 'text-foreground',
      success: 'text-foreground',
      warning: 'text-semantic-warning',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

export const fieldGroupSummaryStatusIndicatorVariants = cva('shrink-0', {
  variants: {
    indicator: {
      inactive: '',
    },
    tone: {
      neutral: '',
      success: '',
      warning: '',
    },
  },
  compoundVariants: [
    { indicator: 'inactive', tone: 'neutral', class: 'text-muted-foreground' },
    { indicator: 'inactive', tone: 'warning', class: 'text-semantic-warning' },
  ],
  defaultVariants: {
    indicator: 'inactive',
    tone: 'neutral',
  },
})
