import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSizeTypographyClasses } from './field-sizing.variants'

/**
 * Form layout spacing — single source of truth.
 *
 * - `fieldAnatomyStackClasses` — label / control / hint inside one field
 * - `fieldLabelHintStackClasses` — label + hint cluster when hint sits below the label
 * - `fieldGroupStackClasses` — sibling fields within a group or form column (gap-based; avoids margin collapse with fieldsets)
 * - `fieldGroupBottomMarginClasses` — space below a field group or array section fieldset
 * - `fieldGroupFlexStackClasses` — wider 32px gap stack for collapse-prone fieldset siblings (embedded editors, …)
 * - `fieldSetResetClasses` — strip UA fieldset chrome from leaf field wrappers
 * - `formSectionStackClasses` — top-level accordion sections
 * - `fieldRowGapClasses` — horizontal + wrap gap between fields in a row
 * - `fieldRowLayoutVariants` — display mode for schema-driven rows
 * - `fieldChipWrapGapClasses` — chip pill row spacing inside `ChipsField`
 * - `fieldGroupDescriptionClasses` — space below a group/section description
 * - `fieldGroupLegendSpacingClasses` — space below a group legend
 * - `fieldArrayItemClasses` — chrome around one repeatable array item
 * - `fieldArrayItemActionsClasses` — space above array item action buttons
 * - `fieldArrayItemActionRowClasses` — action button row inside one array item
 * - `fieldInlineSentenceClasses` — prose + compact control sentence rows
 * - `fieldInlineControlRowClasses` — inline label + control rows
 * - `fieldSettingsRowClasses` — dense settings rows (label + hint | control)
 * - `fieldToggleDependentStackClasses` — outer toggle-dependent stack rhythm
 * - `fieldToggleDependentIndentClasses` — indent for dependents region under inline switch
 * - `fieldSeparatorVariants` — trailing divider after a leaf field or row
 */
export const fieldAnatomyStackClasses = 'space-y-2'
/** Tighter gap between a field label and its hint when `hintPosition="below-label"`. */
export const fieldLabelHintStackClasses = 'flex flex-col gap-1'
export const fieldGroupStackClasses = 'flex flex-col gap-6'
export const fieldGroupBottomMarginClasses = 'mb-8'
export const fieldGroupFlexStackClasses = 'flex flex-col gap-8'
export const formSectionStackClasses = 'flex flex-col gap-7'
export const fieldRowGapClasses = 'gap-6'
export const fieldChipWrapGapClasses = 'gap-2 pt-1'
export const fieldGroupDescriptionClasses = 'mb-3'
export const fieldGroupLegendSpacingClasses = 'mb-5'
export const fieldSubgroupLegendSpacingClasses = 'mb-4'
/** Shared legend typography — field groups, array sections, and collapsible accordion triggers. */
export const fieldGroupLegendTypographyClasses =
  'text-field-group-legend font-heading leading-none text-foreground'
/** Nested subgroup legend typography — smaller scale for groups inside another group. */
export const fieldSubgroupLegendTypographyClasses =
  'text-field-subgroup-legend font-heading leading-none text-foreground'
export const fieldArrayItemClasses = 'rounded-md border border-border p-4'
export const fieldArrayItemActionsClasses = 'mt-3'
export const fieldArrayItemActionRowClasses = cn(
  'flex items-center gap-2',
  fieldArrayItemActionsClasses,
)
export const fieldSetResetClasses = 'min-w-0 border-0 p-0 m-0'
export const fieldInlineSentenceClasses = 'flex flex-wrap items-center gap-x-2 gap-y-2'
export const fieldInlineControlRowClasses = 'flex flex-wrap items-center gap-3'
/** Dense settings row — label + hint column left, compact control right. */
export const fieldSettingsRowClasses =
  'grid grid-cols-1 items-start gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]'
/** Outer stack rhythm for toggle-dependent field groups. */
export const fieldToggleDependentStackClasses = 'flex flex-col gap-2'
/** Aligns dependents region with inline switch label column (`w-9` + `gap-2`). */
export const fieldToggleDependentIndentClasses = 'pl-11'
export const chooseFromChipsSentenceClasses = fieldInlineSentenceClasses

/** Trailing divider tone for leaf fields and rows within a group/stack rhythm. */
export type FieldSeparator = 'subtle'

export const fieldSeparatorVariants = cva('border-b border-border pb-4', {
  variants: {
    tone: {
      subtle: '',
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
})

export type FieldSeparatorVariantProps = VariantProps<typeof fieldSeparatorVariants>

export const fieldRowLayoutVariants = cva('', {
  variants: {
    layout: {
      flex: cn('flex flex-wrap items-start', fieldRowGapClasses),
      'responsive-2': cn('grid w-full grid-cols-1 md:grid-cols-2', fieldRowGapClasses),
      'responsive-3': cn('grid w-full grid-cols-2 md:grid-cols-3', fieldRowGapClasses),
      'responsive-4': cn('grid w-full grid-cols-2 md:grid-cols-4', fieldRowGapClasses),
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

/** Label and control arrangement for standard field wrappers. */
export type FieldLabelPosition = 'above' | 'settings'

export const fieldLabelVariants = cva(
  [
    'flex items-center gap-1.5 font-field-label leading-none',
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

/** Layout preset for toggle-dependent stacks. */
export type FieldStackLayout = 'default' | 'toggleDependent'

export type FieldGroupLegendSize = 'section' | 'subsection'

export const fieldGroupLegendVariants = cva('', {
  variants: {
    size: {
      section: cn(fieldGroupLegendSpacingClasses, fieldGroupLegendTypographyClasses),
      subsection: cn(fieldSubgroupLegendSpacingClasses, fieldSubgroupLegendTypographyClasses),
    },
  },
  defaultVariants: {
    size: 'section',
  },
})
