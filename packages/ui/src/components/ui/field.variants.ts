import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldGroupDividerBottomPaddingClasses } from './field-group-chrome.variants'
import { fieldSizeTypographyClasses, type FieldSizeToken } from './field-sizing.variants'

/**
 * Form layout spacing — single source of truth.
 *
 * - `fieldAnatomyStackClasses` — label / control / hint inside one field
 * - `fieldLabelHintStackClasses` — label + hint cluster when hint sits below the label
 * - `fieldGroupStackClasses` — sibling fields within a group or form column (gap-based; avoids margin collapse with fieldsets)
 * - `fieldGroupBottomMarginClasses` — space below standalone group/array fieldsets (omitted when a parent rhythm stack owns sibling gap)
 *   (nested array sections omit this; parent stack/group rhythm owns spacing)
 * - `fieldGroupFlexStackClasses` — wider 32px gap stack for collapse-prone fieldset siblings (embedded editors, …)
 * - `fieldSetResetClasses` — strip UA fieldset chrome from leaf field wrappers
 * - `formSectionStackClasses` — vertical gap between top-level form sections
 * - `fieldRowGapClasses` — horizontal + wrap gap between fields in a row
 * - `fieldRowLayoutClasses` — flex wrap row for schema-driven `FieldRow` / `RowConfig`
 * - `fieldChipWrapGapClasses` — chip pill row spacing inside `ChipsField`
 * - `fieldGroupDescriptionClasses` — group/section hint typography (spacing lives on the legend header)
 * - `fieldGroupLegendHeaderStackClasses` — vertical gap between a group legend and its hint
 * - `fieldGroupLegendHeaderMarginVariants` — space below a legend header (legend alone or legend + hint)
 * - `fieldGroupLegendSpacingClasses` — section legend header bottom margin (`mb-5` / 20px)
 * - `fieldArrayItemVariants` — chrome around one repeatable array item
 * - `fieldInlineSentenceClasses` — prose + compact control sentence rows
 * - `fieldInlineControlRowClasses` — inline label + control rows
 * - `fieldInlineToggleRowClasses` — checkbox/switch beside label (+ hint below label)
 * - `fieldInlineSwitchControlColumnClasses` / `fieldInlineCheckboxControlColumnClasses` — control alignment
 * - `fieldLabelVariants` `placement` — inline switch/checkbox label first-line height (typography unchanged)
 * - `fieldSettingsRowClasses` — dense settings rows (label + hint | control)
 * - `fieldStackRhythmVariants` — vertical gap between stack siblings (`compact` | `comfortable`)
 * - `fieldArrayItemListClasses` — gap between sibling array items (rhythm + section size)
 * - `fieldToggleDependentStackClasses` — compact stack rhythm alias (backward compatible)
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
export const fieldGroupDescriptionTypographyClasses =
  'font-normal leading-normal text-muted-foreground'
/** Group/subgroup hint copy — spacing is applied on the legend header wrapper. */
export const fieldGroupDescriptionClasses = fieldGroupDescriptionTypographyClasses
/** Vertical gap between a group legend and its optional hint. */
export const fieldGroupLegendHeaderStackClasses = 'flex flex-col gap-2'
/** Section-level legend header bottom margin (20px). */
export const fieldGroupLegendSpacingClasses = 'mb-5'
/** Subgroup legend header bottom margin (16px). */
export const fieldSubgroupLegendSpacingClasses = 'mb-4'
/** Shared legend typography — field groups and array section legends. */
export const fieldGroupLegendTypographyClasses =
  'text-field-group-legend font-heading leading-none text-foreground'
/** Nested subgroup legend typography — smaller scale for groups inside another group. */
export const fieldSubgroupLegendTypographyClasses =
  'text-field-subgroup-legend font-heading leading-none text-foreground'
export const fieldArrayLegendSpacingClasses = 'mb-4'
/** Repeatable array section legend — between subgroup and field labels. */
export const fieldArrayLegendTypographyClasses =
  'text-field-array-legend font-heading leading-none text-foreground'
/** Compact array section legend — follows section `size: 'sm'` (14px). */
export const fieldArrayLegendSmTypographyClasses =
  'text-sm font-heading leading-none text-foreground'
/** Legend row when the add action sits inline with the array heading. */
export const arrayFieldLegendInlineLayoutClasses = 'flex w-full items-center justify-between gap-4'
export const arrayFieldLegendInlineLabelClasses = 'flex min-w-0 items-center gap-2'

export type FieldArrayItemLayoutVariant = 'compact' | 'detailed'

/**
 * Legacy array item chrome — used by hand-built array UIs outside the schema `<Form>` renderer.
 * Schema-driven arrays use `arrayItemShellClasses` in `array-item-toolbar.variants.ts`.
 */
export const fieldArrayItemVariants = cva('relative rounded-md border border-border pl-2', {
  variants: {
    variant: {
      compact: 'py-[calc(var(--spacing)*2)] pr-2',
      detailed: 'py-[calc(var(--spacing)*2)] pr-2',
    },
    nested: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'detailed',
    nested: false,
  },
})

export type FieldArrayItemVariantProps = VariantProps<typeof fieldArrayItemVariants>

/** @deprecated Use `fieldArrayItemVariants` — retained for legacy class assertions. */
export const fieldArrayItemClasses = fieldArrayItemVariants({ variant: 'detailed' })
export const fieldSetResetClasses = 'min-w-0 border-0 p-0 m-0'
export const fieldInlineSentenceClasses = 'flex flex-wrap items-center gap-x-2 gap-y-2'
export const fieldInlineControlRowClasses = 'flex flex-wrap items-center gap-3'
/**
 * Inline checkbox/switch row — control beside label, hint stacked under the label.
 *
 * A bare `flex items-start` row misaligns label cap-height with the control because
 * label type scale (~15px) and control height (`h-5` switch / `size-4` checkbox)
 * differ. Outer `items-center` would vertically centre the control against label +
 * hint when a hint is present. Instead, the control column and label share a
 * fixed first-line height (`h-5` / `h-4`) with internal centring; hint stays in
 * `fieldLabelHintStackClasses` below the label, unchanged.
 */
export const fieldInlineToggleRowClasses = 'flex gap-2'
/** Switch track is `h-5` — centre it on the first label line. */
export const fieldInlineSwitchControlColumnClasses = 'flex h-5 shrink-0 items-center'
/** Checkbox root is `size-4` — centre it on the first label line. */
export const fieldInlineCheckboxControlColumnClasses = 'flex h-4 shrink-0 items-center'
/** Dense settings row — label + hint column left, compact control right. */
export const fieldSettingsRowClasses =
  'grid grid-cols-1 items-start gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]'

/** Vertical gap between siblings in a stack or dependents region. */
export type FieldStackRhythm = 'compact' | 'comfortable'

/** Default vertical gap for form columns and groups (`gap-6`). */
export const DEFAULT_FORM_RHYTHM: FieldStackRhythm = 'comfortable'
/** Default vertical gap for repeatable array sections (`gap-2`). */
export const DEFAULT_ARRAY_SECTION_RHYTHM: FieldStackRhythm = 'compact'
/** Default control scale inside repeatable array sections (`sm`). */
export const DEFAULT_ARRAY_SECTION_SIZE: FieldSizeToken = 'sm'

/** Resolves stack rhythm: explicit config → section default → inherited context. */
export function resolveFieldStackRhythm(options: {
  explicit?: FieldStackRhythm | undefined
  inherited: FieldStackRhythm
  sectionDefault?: FieldStackRhythm | undefined
}): FieldStackRhythm {
  return options.explicit ?? options.sectionDefault ?? options.inherited
}

/** Resolves field size inside array sections: explicit config → section default → inherited. */
export function resolveArraySectionSize(options: {
  explicit?: FieldSizeToken | undefined
  inherited: FieldSizeToken
  sectionDefault?: FieldSizeToken | undefined
}): FieldSizeToken {
  return options.explicit ?? options.sectionDefault ?? options.inherited
}

/** Default control scale for form fields (`md`). */
export const DEFAULT_FORM_FIELD_SIZE: FieldSizeToken = 'md'

/** Resolves form-level field size: explicit prop → rhythm-derived (`compact` → `sm`). */
export function resolveFormFieldSize(options: {
  explicit?: FieldSizeToken | undefined
  rhythm: FieldStackRhythm
}): FieldSizeToken {
  return options.explicit ?? (options.rhythm === 'compact' ? 'sm' : 'md')
}

/** Resolves leaf field size: per-field config overrides inherited form context. */
export function resolveInheritedFieldSize(options: {
  explicit?: FieldSizeToken | undefined
  inherited: FieldSizeToken
}): FieldSizeToken {
  return options.explicit ?? options.inherited
}

export const fieldStackRhythmVariants = cva('flex flex-col', {
  variants: {
    rhythm: {
      compact: 'gap-2',
      comfortable: 'gap-6',
    },
  },
  defaultVariants: {
    rhythm: 'compact',
  },
})

export type FieldStackRhythmVariantProps = VariantProps<typeof fieldStackRhythmVariants>

/**
 * Vertical gap between sibling array items (list + Add button).
 * Item body field stacks use {@link fieldStackRhythmVariants} instead.
 */
export function fieldArrayItemListClasses(options: {
  rhythm: FieldStackRhythm
  size: FieldSizeToken
}): string {
  if (options.rhythm === 'comfortable') {
    return cn('flex flex-col', options.size === 'md' ? 'gap-6' : 'gap-3')
  }

  return cn('flex flex-col', options.size === 'md' ? 'gap-3' : 'gap-2')
}

/** Compact toggle-dependent stack rhythm — prefer `fieldStackRhythmVariants` for configurable stacks. */
export const fieldToggleDependentStackClasses = fieldStackRhythmVariants({ rhythm: 'compact' })
/** Aligns dependents region with inline switch label column (`w-9` + `gap-2`). */
export const fieldToggleDependentIndentClasses = 'pl-11'
export const chooseFromChipsSentenceClasses = fieldInlineSentenceClasses

/** Trailing divider tone for leaf fields and rows within a group/stack rhythm. */
export type FieldSeparator = 'subtle'

export const fieldSeparatorVariants = cva(
  cn('border-b border-border', fieldGroupDividerBottomPaddingClasses),
  {
    variants: {
      tone: {
        subtle: '',
      },
    },
    defaultVariants: {
      tone: 'subtle',
    },
  },
)

export type FieldSeparatorVariantProps = VariantProps<typeof fieldSeparatorVariants>

/** Side-by-side fields in a wrapping flex row — compose widths via leaf `width` tokens. */
export const fieldRowLayoutClasses = cn('flex flex-wrap items-start', fieldRowGapClasses)

/** Where helper text renders relative to the label and control. */
export type FieldHintPosition = 'below-label' | 'below-control'

/** Label and control arrangement for standard field wrappers. */
export type FieldLabelPosition = 'above' | 'settings'

export const fieldLabelVariants = cva(
  [
    'flex w-fit self-start items-center gap-1.5 font-field-label leading-none',
    "data-[required]:after:content-['*'] data-[required]:after:text-destructive",
  ],
  {
    variants: {
      size: fieldSizeTypographyClasses,
      /** First-line min-height for inline toggles — keeps `font-field-label` typography. */
      placement: {
        default: '',
        inlineSwitch: 'min-h-5',
        inlineCheckbox: 'min-h-4',
      },
    },
    defaultVariants: {
      size: 'md',
      placement: 'default',
    },
  },
)

export type FieldLabelPlacement = NonNullable<VariantProps<typeof fieldLabelVariants>['placement']>

export const fieldErrorTextVariants = cva('', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-md',
      lg: 'text-md',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Layout preset for controller + dependent field stacks. */
export type FieldStackLayout = 'default' | 'dependent'

export type FieldGroupLegendSize = 'section' | 'subsection' | 'array'

/** Legend type scale for array sections — `sm` when section field size is compact. */
export type FieldGroupLegendScale = 'default' | 'sm'

/** Maps array section field size to legend typography scale. */
export function resolveArrayLegendScale(size: FieldSizeToken): FieldGroupLegendScale {
  return size === 'sm' ? 'sm' : 'default'
}

export const fieldGroupLegendVariants = cva('', {
  variants: {
    size: {
      section: fieldGroupLegendTypographyClasses,
      subsection: fieldSubgroupLegendTypographyClasses,
      array: '',
    },
    scale: {
      default: '',
      sm: '',
    },
  },
  compoundVariants: [
    {
      size: 'array',
      scale: 'default',
      class: fieldArrayLegendTypographyClasses,
    },
    {
      size: 'array',
      scale: 'sm',
      class: fieldArrayLegendSmTypographyClasses,
    },
  ],
  defaultVariants: {
    size: 'section',
    scale: 'default',
  },
})

/** Bottom margin for a field-group legend header — legend alone or legend + hint block. */
export const fieldGroupLegendHeaderMarginVariants = cva('', {
  variants: {
    size: {
      section: fieldGroupLegendSpacingClasses,
      subsection: fieldSubgroupLegendSpacingClasses,
      array: fieldArrayLegendSpacingClasses,
    },
  },
  defaultVariants: {
    size: 'section',
  },
})

export type FieldGroupLegendVariantProps = VariantProps<typeof fieldGroupLegendVariants>

/** Typography + header margin for `<legend>` on groups, subgroups, and array sections. */
export function resolveFieldGroupLegendClassName(
  options: FieldGroupLegendVariantProps = {},
): string {
  const size = options.size ?? 'section'
  return cn(fieldGroupLegendVariants(options), fieldGroupLegendHeaderMarginVariants({ size }))
}

/** Stack + bottom margin for a legend/hint header block nested inside `<legend>`. */
export function resolveFieldGroupLegendHeaderStackClassName(
  size: NonNullable<FieldGroupLegendVariantProps['size']> = 'section',
): string {
  return cn(fieldGroupLegendHeaderStackClasses, fieldGroupLegendHeaderMarginVariants({ size }))
}
