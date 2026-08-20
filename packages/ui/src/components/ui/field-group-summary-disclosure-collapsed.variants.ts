import { cva } from 'class-variance-authority'

import { iconGlyphRootClasses } from './icon-glyph.variants'

export {
  fieldGroupSummaryDisclosureLegendVariants,
  fieldGroupSummaryPrimaryVariants,
  fieldGroupSummaryStatusLineVariants,
} from './field-group-summary-disclosure.variants'

/** @deprecated Prefer {@link fieldGroupSummaryStatusLineVariants}. */
export const fieldGroupSummaryStatusLineClasses = 'flex min-w-0 items-center gap-1.5 text-sm'

/** Middle-dot separator before detail text. */
export const fieldGroupSummaryStatusDetailSeparatorClasses = 'text-muted-foreground'

/** Explanatory line below the status row. */
export const fieldGroupSummaryStatusSecondaryClasses = 'mt-1 text-xs text-muted-foreground'

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
      dot: 'size-1.5 rounded-full bg-semantic-success',
      inactive: iconGlyphRootClasses.md,
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
    tone: 'neutral',
  },
})
