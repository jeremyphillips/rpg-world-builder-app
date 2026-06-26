import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

/**
 * Form layout spacing — single source of truth.
 *
 * - `fieldAnatomyStackClasses` — label / control / hint inside one field
 * - `fieldGroupStackClasses` — sibling fields within a group or form column
 * - `fieldGroupFlexStackClasses` — same 24px rhythm as `fieldGroupStackClasses`, gap-based (avoids margin collapse with fieldsets)
 * - `formSectionStackClasses` — top-level accordion sections
 * - `fieldRowGapClasses` — horizontal + wrap gap between fields in a row
 * - `fieldChipWrapGapClasses` — gap between chip pills inside `ChipsField`
 * - `fieldGroupDescriptionClasses` — space below a group/section description
 * - `fieldGroupLegendSpacingClasses` — space below a group legend
 * - `fieldArrayItemActionsClasses` — space above array item action buttons
 */
export const fieldAnatomyStackClasses = 'space-y-3'
export const fieldGroupStackClasses = 'space-y-6'
export const fieldGroupFlexStackClasses = 'flex flex-col gap-6'
export const formSectionStackClasses = 'flex flex-col gap-7'
export const fieldRowGapClasses = 'gap-6'
export const fieldChipWrapGapClasses = 'gap-2'
export const fieldGroupDescriptionClasses = 'mb-3'
export const fieldGroupLegendSpacingClasses = 'mb-4'
export const fieldArrayItemActionsClasses = 'mt-3'
export const fieldSetResetClasses = 'min-w-0 border-0 p-0 m-0'
export const chooseFromChipsSentenceClasses = 'flex flex-wrap items-center gap-x-2 gap-y-2'

export const fieldLabelVariants = cva(
  [
    'flex items-center gap-1.5 font-medium leading-none',
    "data-[required]:after:content-['*'] data-[required]:after:text-destructive",
  ],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const fieldGroupLegendVariants = cva(
  cn(fieldGroupLegendSpacingClasses, 'text-lg font-semibold leading-none text-foreground'),
)
