import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSizeTypographyClasses } from './field-sizing.variants'

/**
 * Form layout spacing — single source of truth.
 *
 * - `fieldAnatomyStackClasses` — label / control / hint inside one field
 * - `fieldLabelHintStackClasses` — label + hint cluster when hint sits below the label
 * - `fieldGroupStackClasses` — sibling fields within a group or form column
 * - `fieldGroupFlexStackClasses` — same 24px rhythm as `fieldGroupStackClasses`, gap-based (avoids margin collapse with fieldsets)
 * - `formSectionStackClasses` — top-level accordion sections
 * - `fieldRowGapClasses` — horizontal + wrap gap between fields in a row
 * - `fieldRowLayoutVariants` — display mode for schema-driven rows
 * - `fieldChipWrapGapClasses` — gap between chip pills inside `ChipsField`
 * - `fieldGroupDescriptionClasses` — space below a group/section description
 * - `fieldGroupLegendSpacingClasses` — space below a group legend
 * - `fieldArrayItemClasses` — chrome around one repeatable array item
 * - `fieldArrayItemActionsClasses` — space above array item action buttons
 * - `fieldArrayItemActionRowClasses` — action button row inside one array item
 * - `fieldInlineSentenceClasses` — prose + compact control sentence rows
 * - `fieldInlineControlRowClasses` — inline label + control rows
 */
export const fieldAnatomyStackClasses = 'space-y-2'
/** Tighter gap between a field label and its hint when `hintPosition="below-label"`. */
export const fieldLabelHintStackClasses = 'flex flex-col gap-1'
export const fieldGroupStackClasses = 'space-y-6'
export const fieldGroupFlexStackClasses = 'flex flex-col gap-6'
export const formSectionStackClasses = 'flex flex-col gap-7'
export const fieldRowGapClasses = 'gap-6'
export const fieldChipWrapGapClasses = 'gap-2'
export const fieldGroupDescriptionClasses = 'mb-3'
export const fieldGroupLegendSpacingClasses = 'mb-4'
export const fieldArrayItemClasses = 'rounded-md border border-border p-4'
export const fieldArrayItemActionsClasses = 'mt-3'
export const fieldArrayItemActionRowClasses = cn(
  'flex items-center gap-2',
  fieldArrayItemActionsClasses,
)
export const fieldSetResetClasses = 'min-w-0 border-0 p-0 m-0'
export const fieldInlineSentenceClasses = 'flex flex-wrap items-center gap-x-2 gap-y-2'
export const fieldInlineControlRowClasses = 'flex flex-wrap items-center gap-3'
export const chooseFromChipsSentenceClasses = fieldInlineSentenceClasses

export const fieldRowLayoutVariants = cva('', {
  variants: {
    layout: {
      flex: cn('flex flex-wrap items-start', fieldRowGapClasses),
      'responsive-2': cn('grid w-full grid-cols-1 md:grid-cols-2', fieldRowGapClasses),
      'responsive-3': cn('grid w-full grid-cols-2 md:grid-cols-3', fieldRowGapClasses),
    },
  },
  defaultVariants: {
    layout: 'flex',
  },
})

export type FieldRowLayoutVariantProps = VariantProps<typeof fieldRowLayoutVariants>
export type FieldRowLayout = NonNullable<FieldRowLayoutVariantProps['layout']>

/** Where helper text renders relative to the label and control. */
export type FieldHintPosition = 'below-label' | 'below-control'

export const fieldLabelVariants = cva(
  [
    'flex items-center gap-1.5 font-body-emphasis leading-none',
    "data-[required]:after:content-['*'] data-[required]:after:text-destructive",
  ],
  {
    variants: {
      size: fieldSizeTypographyClasses,
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const fieldGroupLegendVariants = cva(
  cn(fieldGroupLegendSpacingClasses, 'text-lg font-heading leading-none text-foreground'),
)
