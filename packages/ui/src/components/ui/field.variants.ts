import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { borderStrength, type BorderStrength } from './border-strength'
import { type FieldSizeToken } from './field-sizing.variants'

/**
 * Form layout spacing — single source of truth.
 *
 * Row alignment / control band SSOT:
 * - `field-control-band.variants.ts` — `fieldControlBandVariants`, `fieldRowVariants`
 * - `field-row-presentation.lib.ts` — `resolveFieldPresentation`, `resolveFieldRowClasses`
 *
 * Spacing tokens below:
 * - `fieldAnatomyStackVariants` — legacy Root stack gap (non-anatomy compositions)
 * - `fieldLabelRegionVariants` / `fieldMessageRegionVariants` — region-owned padding for flat three-region anatomy
 * - `fieldControlRegionClasses` — control region shell (no intrinsic spacing)
 * - `fieldLabelContentClusterClasses` — label + required marker + info on one line
 * - `fieldLabelHintStackClasses` — label cluster + hint when hint sits below the label (2px)
 * - `fieldGroupStackClasses` — sibling fields within a group or form column (gap-based; avoids margin collapse with fieldsets)
 * - `fieldGroupBottomMarginClasses` — space below standalone group/array fieldsets (omitted when a parent rhythm stack owns sibling gap)
 *   (nested array sections omit this; parent stack/group rhythm owns spacing)
 * - `fieldGroupFlexStackClasses` — wider 32px gap stack for collapse-prone fieldset siblings (embedded editors, …)
 * - `fieldSetResetClasses` — strip UA fieldset chrome from leaf field wrappers
 * - `fieldSetChromeContainClasses` — column stack for borderless leaf fieldset anatomy
 * - `fieldSetInFlowLegendClasses` — reset UA legend padding on chip / choose-count captions
 * - `formSectionStackClasses` — vertical gap between top-level form sections
 * - `fieldRowLayoutClasses` — deprecated alias (`gap-6`); prefer `resolveFieldRowClasses`
 * - `fieldChipWrapGapClasses` — chip pill row gap only (no vertical pad) inside `ChipsField`
 * - group/section hint typography is `text-style-field-group-description` (spacing lives on the legend header)
 * - `fieldGroupLegendHeaderStackClasses` — vertical gap between a group legend and its hint
 * - `fieldGroupLegendHeaderMarginVariants` — legacy legend bottom margin (HeadingPresentation, editable-grid — not FieldGroup body spacing)
 * - `fieldGroupBodyGapVariants` / `resolveFieldGroupBodyGap` — legend→body spacing scale for FieldGroup (applied on the body relationship)
 * - `fieldArrayItemVariants` — chrome around one repeatable array item
 * - `fieldInlineSentenceClasses` — prose + compact control sentence rows
 * - `fieldInlineControlRowClasses` — inline label + control rows
 * - `fieldInlineToggleRowClasses` — checkbox/switch beside label (+ hint below label)
 * - `fieldInlineSwitchControlColumnClasses` / `fieldInlineCheckboxControlColumnClasses` — control alignment
 * - `fieldLabelVariants` `placement` — inline switch/checkbox label first-line height (typography unchanged)
 * - `fieldSettingsRowClasses` — dense settings rows (label + hint | control)
 * - `fieldStackRhythmVariants` — vertical gap between stack siblings (`compact` | `comfortable`)
 * - `formDependentInsetSpacing` — total content inset by rhythm (compact 8 / comfortable 9)
 * - `ui-field-rail` — rail position within gutter (inline-start offset in `field-rail.css`)
 * - `resolveDependentInsetClasses` — rhythm-derived content indentation (`pl-8` / `pl-9`)
 * - `resolveFieldRailClasses` — pseudo-element rail decoration (see `field-rail.variants.ts`)
 * - `fieldArrayItemListClasses` — gap between sibling array items (rhythm + section size)
 * - `fieldToggleDependentStackClasses` — compact stack rhythm alias (backward compatible)
 * - `fieldSeparatorVariants` — trailing divider after a leaf field or row
 */
/**
 * Label/heading cluster → control and control → validation / bottom hint.
 * Compact `sm` is 4px; comfortable `md`/`lg` is 6px. Keep
 * {@link fieldAnatomyAlignVariants} in lockstep. Both use `gap-y` so fieldset
 * `m-0` cannot collapse the control → validation sibling.
 */
export const fieldAnatomyStackVariants = cva('flex flex-col', {
  variants: {
    size: {
      /** Entity-card utility band and extra-dense controls — 4px label-to-control gap. */
      xs: 'gap-y-1',
      /** Dense forms (`FormDensity: 'compact'`) — 4px label-to-control gap. */
      sm: 'gap-y-1',
      /** Comfortable default — 6px label-to-control / control-to-message gap. */
      md: 'gap-y-1.5',
      lg: 'gap-y-1.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Stacked label→control alignment gap — same size map as {@link fieldAnatomyStackVariants}. */
export const fieldAnatomyAlignVariants = cva('flex flex-col', {
  variants: {
    size: {
      xs: 'gap-y-1',
      sm: 'gap-y-1',
      md: 'gap-y-1.5',
      lg: 'gap-y-1.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Subgrid row track for label regions inside {@link fieldRowParticipationClasses} columns. */
export const fieldAnatomyLabelRegionRowTrackClasses =
  'in-data-[field-row-participant]:row-start-1 in-data-[field-row-participant]:row-end-2'

/** Subgrid row track for control regions inside row participants. */
export const fieldAnatomyControlRegionRowTrackClasses =
  'in-data-[field-row-participant]:row-start-2 in-data-[field-row-participant]:row-end-3'

/** Subgrid row track for message regions inside row participants. */
export const fieldAnatomyMessageRegionRowTrackClasses =
  'in-data-[field-row-participant]:row-start-3 in-data-[field-row-participant]:row-end-4'

/**
 * Label-region → control spacing for flat three-region anatomy.
 * Padding applies via `has-[*]` so empty regions (null children / whitespace only)
 * contribute no height. Lockstep with {@link fieldAnatomyStackVariants}.
 */
export const fieldLabelRegionVariants = cva(
  cn('min-w-0 in-data-[field-row-participant]:self-end', fieldAnatomyLabelRegionRowTrackClasses),
  {
    variants: {
      size: {
        xs: 'has-[*]:pb-1',
        sm: 'has-[*]:pb-1',
        md: 'has-[*]:pb-1.5',
        lg: 'has-[*]:pb-1.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/**
 * Control → message-region spacing for flat three-region anatomy.
 * Padding applies via `has-[*]` so empty regions contribute no height.
 */
export const fieldMessageRegionVariants = cva(
  cn('min-w-0', fieldAnatomyMessageRegionRowTrackClasses),
  {
    variants: {
      size: {
        xs: 'has-[*]:pt-1.5',
        sm: 'has-[*]:pt-1.5',
        md: 'has-[*]:pt-1.5',
        lg: 'has-[*]:pt-1.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/** Control region — no intrinsic spacing; band sizing lives on the control band. */
export const fieldControlRegionClasses = cn('min-w-0', fieldAnatomyControlRegionRowTrackClasses)

/** Comfortable default — prefer {@link fieldAnatomyStackVariants} when `size` is known. */
export const fieldAnatomyStackClasses = fieldAnatomyStackVariants({ size: 'md' })
/** Label + required marker + info — one inline cluster so hint stacks cannot split the asterisk. */
export const fieldLabelContentClusterClasses = 'inline-flex items-center gap-1.5'
/** Label + below-label hint — 2px; cluster → control gap is the anatomy token. */
export const fieldLabelHintStackClasses = 'flex flex-col gap-0.5'
/** Inline recommendation row below the label/hint stack — supporting text + text action. */
export const fieldRecommendationRowClasses = 'mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5'
/** Caption scale with foreground ink — same size as field hints, not muted. */
export const fieldRecommendationSupportingTextClasses = 'text-style-caption text-foreground'
/** Decoration overrides for recommendation text actions — geometry stays on `Button` text tokens. */
export const fieldRecommendationActionVariants = 'no-underline hover:no-underline'

/** Field recommendation group — internal layout only; field band spacing is `fieldRecommendationRowClasses`. */
export const fieldRecommendationFieldGroupClasses =
  'flex w-fit max-w-full flex-col items-start gap-1'

/** Collection recommendation stack — host adds spacing before the collection body. */
export const fieldRecommendationCollectionGroupClasses =
  'mb-2 flex w-fit max-w-full flex-col items-start gap-1'

/** @deprecated Use {@link fieldRecommendationFieldGroupClasses} or {@link fieldRecommendationCollectionGroupClasses}. */
export const fieldRecommendationGroupClasses = fieldRecommendationCollectionGroupClasses

/** Source label + optional bulk action — wraps together with token gap. */
export const fieldRecommendationGroupHeaderClasses =
  'flex max-w-full flex-wrap items-center gap-x-1 gap-y-0.5'

/** Wrapping row of outline recommendation actions (no metadata separators). */
export const fieldRecommendationGroupItemsClasses = 'flex max-w-full flex-wrap gap-2'

export const fieldGroupStackClasses = 'flex flex-col gap-6'
export const fieldGroupBottomMarginClasses = 'mb-8'
/** Omits standalone group bottom margin when a parent rhythm stack owns sibling gap. */
export const fieldGroupSectionOuterMarginResetClasses = 'mb-0'
export const fieldGroupFlexStackClasses = 'flex flex-col gap-8'
export const formSectionStackClasses = 'flex flex-col gap-7'
/** Horizontal + wrap gap between chip pills — vertical label→chips spacing is the anatomy token. */
export const fieldChipWrapGapClasses = 'gap-2'
/** Vertical gap between a group legend and its optional hint. */
export const fieldGroupLegendHeaderStackVariants = cva('flex flex-col', {
  variants: {
    rhythm: {
      comfortable: 'gap-2',
      compact: 'gap-1',
    },
  },
  defaultVariants: {
    rhythm: 'comfortable',
  },
})

/** Comfortable default — prefer {@link fieldGroupLegendHeaderStackVariants} when rhythm is known. */
export const fieldGroupLegendHeaderStackClasses = fieldGroupLegendHeaderStackVariants({
  rhythm: 'comfortable',
})
/** Repeatable array section legend — matches leaf field label typography. */
export const fieldLabelTypographyVariants = cva('', {
  variants: {
    size: {
      xs: 'text-style-field-label-sm',
      sm: 'text-style-field-label-sm',
      md: 'text-style-field-label-md',
      lg: 'text-style-field-label-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Legend-to-list spacing — mirrors {@link fieldAnatomyStackVariants} label→control gap. */
export const fieldArrayLegendSpacingVariants = cva('', {
  variants: {
    size: {
      xs: 'mb-1',
      sm: 'mb-1',
      md: 'mb-1.5',
      lg: 'mb-1.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Typography + spacing for array section `<legend>` — SSOT with leaf field labels. */
export function resolveArrayLegendClassName(size: FieldSizeToken = 'md'): string {
  return cn(fieldLabelTypographyVariants({ size }), fieldArrayLegendSpacingVariants({ size }))
}

/**
 * @deprecated Prefer {@link formSectionHeaderActionLayoutClasses} from form presentation.
 * Retained for class drift tests only.
 */
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
/** Column stack for a reset leaf `<fieldset>` whose chrome lives on a wrapping shell. */
export const fieldSetChromeContainClasses = 'flex flex-col'
/** `contents` so legend children participate in fieldset flex gap. */
export const fieldSetInFlowLegendClasses = 'contents min-w-0 p-0'
/** Prose connectors share a row with compact controls — center on the control band, not the box bottom. */
export const fieldInlineSentenceClasses = 'flex flex-wrap items-center gap-x-2 gap-y-2'
/** Inline sentence inside an anatomy row — same cross-axis alignment with row min-width guard. */
export const fieldInlineSentenceRowClasses = 'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2'
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
export type FieldRhythm = 'compact' | 'comfortable'

/**
 * Closed group heading opt-in. `'field'` replaces structural legend and description
 * type with the field label and hint scale. It is not a size token.
 */
export type GroupHeadingScale = 'field'

/** Group legend description typography — follows form density (`rhythm`), not legend title scale. */
export function resolveFieldGroupDescriptionTypography(
  rhythm: FieldRhythm = 'comfortable',
  headingScale?: GroupHeadingScale,
): string {
  if (headingScale === 'field') return 'text-style-caption'
  return rhythm === 'compact'
    ? 'text-style-field-group-description-compact'
    : 'text-style-field-group-description'
}

export const fieldStackRhythmVariants = cva('flex flex-col', {
  variants: {
    rhythm: {
      compact: 'gap-4',
      comfortable: 'gap-6',
    },
  },
  defaultVariants: {
    rhythm: 'compact',
  },
})

export type FieldStackRhythmVariantProps = VariantProps<typeof fieldStackRhythmVariants>

/**
 * Total dependent content inset by rhythm — includes 8px leading gutter (`left-2` rail offset)
 * plus rhythm content offset (compact 24px / comfortable 28px) → `pl-8` / `pl-9`.
 */
export const formDependentInsetSpacing = {
  compact: 8,
  comfortable: 9,
} as const satisfies Record<FieldRhythm, number>

/** Content offset from controller after the 8px rail gutter — compact 24px, comfortable 28px. */
export const formDependentContentOffsetSpacing = {
  compact: 6,
  comfortable: 7,
} as const satisfies Record<FieldRhythm, number>

/** @deprecated Use {@link formDependentInsetSpacing}. */
export const formRailInnerSpacing = formDependentInsetSpacing

/** @deprecated Use {@link formDependentInsetSpacing}. */
export const formInsetSpacing = formDependentInsetSpacing

export const fieldDependentInsetVariants = cva('', {
  variants: {
    rhythm: {
      compact: 'pl-8',
      comfortable: 'pl-9',
    },
  },
  defaultVariants: {
    rhythm: 'comfortable',
  },
})

/** @deprecated Use {@link fieldDependentInsetVariants}. */
export const fieldRailInnerPaddingVariants = fieldDependentInsetVariants

/** @deprecated Use {@link fieldDependentInsetVariants}. */
export const fieldInsetLeftPaddingVariants = fieldDependentInsetVariants

export const fieldInsetPaddingVariants = cva('', {
  variants: {
    rhythm: {
      compact: 'p-8',
      comfortable: 'p-9',
    },
  },
  defaultVariants: {
    rhythm: 'comfortable',
  },
})

export type FormInsetPaddingAxis = 'left' | 'all'

/** Projects dependent content inset spacing onto the requested axis. */
export function resolveFormInsetPaddingClasses(
  rhythm: FieldRhythm = 'comfortable',
  axis: FormInsetPaddingAxis = 'left',
): string {
  return axis === 'left'
    ? fieldDependentInsetVariants({ rhythm })
    : fieldInsetPaddingVariants({ rhythm })
}

/** @deprecated Use {@link fieldDependentInsetVariants}. */
export const fieldGroupInsetPaddingVariants = fieldDependentInsetVariants

/** @deprecated Use {@link resolveFormInsetPaddingClasses}. */
export function resolveFieldGroupInsetPaddingClasses(rhythm: FieldRhythm = 'comfortable'): string {
  return resolveFormInsetPaddingClasses(rhythm, 'left')
}

/** @deprecated Use {@link resolveDependentInsetClasses}. */
export function resolveFieldRailInnerPaddingClasses(rhythm: FieldRhythm = 'comfortable'): string {
  return resolveFormInsetPaddingClasses(rhythm, 'left')
}

/** Horizontal offset of dependent content from its controller — `pl-8` / `pl-9` (8px rail gutter + content offset). */
export function resolveDependentInsetClasses(
  inset: boolean,
  rhythm: FieldRhythm = 'comfortable',
): string {
  return inset ? fieldDependentInsetVariants({ rhythm }) : ''
}

/**
 * Vertical gap between sibling array items (list + Add button).
 * Item body field stacks use {@link fieldStackRhythmVariants} instead.
 */
export function fieldArrayItemListClasses(
  options: {
    rhythm: FieldRhythm
    size: FieldSizeToken
  },
  stackTreatment: 'merged' | 'separated' = 'separated',
  listGap: 'rhythm' | 'tight' | 'merged' | 'disclosure' = 'rhythm',
): string {
  if (stackTreatment === 'merged' || listGap === 'merged') {
    return cn('flex flex-col', 'gap-0')
  }

  if (listGap === 'disclosure') {
    return cn('flex flex-col', options.rhythm === 'comfortable' ? 'gap-3' : 'gap-2')
  }

  if (listGap === 'tight') {
    return cn('flex flex-col', 'gap-2')
  }

  if (options.rhythm === 'comfortable') {
    return cn('flex flex-col', options.size === 'md' ? 'gap-6' : 'gap-3')
  }

  return cn('flex flex-col', 'gap-3')
}

/** Compact toggle-dependent stack rhythm — prefer `fieldStackRhythmVariants` for configurable stacks. */
export const fieldToggleDependentStackClasses = fieldStackRhythmVariants({ rhythm: 'compact' })

export const chooseFromChipsSentenceClasses = fieldInlineSentenceClasses

/** Trailing divider tone — maps to the global border ladder in design-tokens.md. */
export type FieldSeparator = BorderStrength

const fieldSeparatorStrengthClasses = {
  subtle: borderStrength('subtle'),
  default: borderStrength(),
  strong: borderStrength('strong'),
} satisfies Record<FieldSeparator, string>

export const fieldSeparatorVariants = cva('border-b', {
  variants: {
    tone: fieldSeparatorStrengthClasses,
    rhythm: {
      compact: 'pb-2',
      comfortable: 'pb-7',
    },
  },
  defaultVariants: {
    tone: 'subtle',
    rhythm: 'comfortable',
  },
})

export type FieldSeparatorVariantProps = VariantProps<typeof fieldSeparatorVariants>

/**
 * Side-by-side fields in a wrapping flex row — compose widths via leaf `width` tokens.
 *
 * @deprecated Prefer `resolveFieldRowClasses({ layout: 'flow', align: 'control-edge', gap: 'form' })`
 * from `field-row-presentation.lib.ts`. Kept as a sync’d alias (`items-end` control-edge).
 */
export const fieldRowLayoutClasses = cn('flex flex-wrap items-end', 'gap-6')

/** Where helper text renders relative to the label and control. */
export type FieldHintPosition = 'below-label' | 'below-control'

/** Label and control arrangement for standard field wrappers. */
export type FieldLabelPosition = 'above' | 'settings'

export const fieldLabelVariants = cva(['flex w-fit self-start items-center gap-1.5'], {
  variants: {
    size: {
      xs: 'text-style-field-label-sm',
      sm: 'text-style-field-label-sm',
      md: 'text-style-field-label-md',
      lg: 'text-style-field-label-lg',
    },
    /** First-line min-height for inline toggles — type stays on the size utility. */
    placement: {
      default: '',
      inlineSwitch: 'min-h-5',
      inlineCheckbox: 'min-h-4',
    },
  },
  compoundVariants: [
    { placement: 'default', size: 'xs', class: 'min-h-4' },
    { placement: 'default', size: 'sm', class: 'min-h-4' },
    { placement: 'default', size: 'md', class: 'min-h-[1.375rem]' },
    { placement: 'default', size: 'lg', class: 'min-h-[1.375rem]' },
  ],
  defaultVariants: {
    size: 'md',
    placement: 'default',
  },
})

export type FieldLabelPlacement = NonNullable<VariantProps<typeof fieldLabelVariants>['placement']>

export const fieldErrorTextVariants = cva('', {
  variants: {
    size: {
      xs: 'text-style-field-error',
      sm: 'text-style-field-error',
      md: 'text-style-field-error',
      lg: 'text-style-field-error',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Layout preset for controller + dependent field stacks. */
export type FieldStackLayout = 'default' | 'dependent'

export type FieldGroupLegendSize = 'section' | 'subsection' | 'array'

/** @deprecated Array legends use {@link resolveArrayLegendClassName} — scale is unused. */
export type FieldGroupLegendScale = 'default' | 'sm'

/** @deprecated Array legends use {@link resolveArrayLegendClassName}. */
export function resolveArrayLegendScale(size: FieldSizeToken): FieldGroupLegendScale {
  return size === 'sm' || size === 'xs' ? 'sm' : 'default'
}

/**
 * Legend-row disclosure trigger inside `<FieldGroupLegend>`.
 * Title scale is on the label span inside the trigger, not on `<legend>`.
 */
export const fieldGroupLegendDisclosureTriggerVariants = cva(
  cn(
    'flex min-w-0 flex-1 items-center justify-between gap-2 text-left transition-all',
    'hover:text-foreground/80',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  ),
  {
    variants: {
      rhythm: {
        comfortable: 'py-2',
        compact: 'py-0',
      },
    },
    defaultVariants: {
      rhythm: 'comfortable',
    },
  },
)

/** Collapsible panel for legend disclosure — animation only; spacing comes from the field stack. */
export const fieldGroupLegendDisclosureContentVariants =
  'overflow-hidden data-[state=open]:overflow-visible data-[state=closed]:h-0 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:pointer-events-none data-[state=closed]:inert'

export const fieldGroupLegendVariants = cva('', {
  variants: {
    size: {
      section: '',
      subsection: '',
      array: '',
    },
    scale: {
      default: '',
      sm: '',
    },
    rhythm: {
      comfortable: '',
      compact: '',
    },
  },
  compoundVariants: [
    { size: 'section', rhythm: 'comfortable', class: 'text-style-field-legend' },
    { size: 'subsection', rhythm: 'comfortable', class: 'text-style-field-legend-sub' },
    { size: 'section', rhythm: 'compact', class: 'text-style-field-legend-compact' },
    { size: 'subsection', rhythm: 'compact', class: 'text-style-field-legend-compact' },
  ],
  defaultVariants: {
    size: 'section',
    scale: 'default',
    rhythm: 'comfortable',
  },
})

/**
 * Legacy bottom margin on a legend header block — not the FieldGroup legend→body API.
 * {@link StandardFieldGroupBody} applies {@link resolveFieldGroupBodyGap} on the body side.
 */
export const fieldGroupLegendHeaderMarginVariants = cva('', {
  variants: {
    size: {
      section: '',
      subsection: '',
      array: 'mb-1.5',
    },
    rhythm: {
      comfortable: '',
      compact: '',
    },
  },
  compoundVariants: [
    { size: 'section', rhythm: 'comfortable', class: 'mb-5' },
    { size: 'subsection', rhythm: 'comfortable', class: 'mb-4' },
    { size: 'section', rhythm: 'compact', class: 'mb-3' },
    { size: 'subsection', rhythm: 'compact', class: 'mb-3' },
  ],
  defaultVariants: {
    size: 'section',
    rhythm: 'comfortable',
  },
})

/** Top margin between a FieldGroup legend and its body — composer applies when a body is visible. */
export const fieldGroupBodyGapVariants = cva('', {
  variants: {
    size: {
      section: '',
      subsection: '',
      array: '',
    },
    rhythm: {
      comfortable: '',
      compact: '',
    },
    fieldSize: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    { size: 'section', rhythm: 'comfortable', class: 'mt-5' },
    { size: 'subsection', rhythm: 'comfortable', class: 'mt-4' },
    { size: 'section', rhythm: 'compact', class: 'mt-3' },
    { size: 'subsection', rhythm: 'compact', class: 'mt-3' },
    { size: 'array', fieldSize: 'xs', class: 'mt-1' },
    { size: 'array', fieldSize: 'sm', class: 'mt-1' },
    { size: 'array', fieldSize: 'md', class: 'mt-1.5' },
    { size: 'array', fieldSize: 'lg', class: 'mt-1.5' },
  ],
  defaultVariants: {
    size: 'section',
    rhythm: 'comfortable',
    fieldSize: 'md',
  },
})

export function resolveFieldGroupBodyGap(options: {
  size: FieldGroupLegendSize
  rhythm: FieldRhythm
  fieldSize?: FieldSizeToken
}): string {
  const fieldSize = options.fieldSize ?? 'md'
  if (options.size === 'array') {
    return fieldGroupBodyGapVariants({ size: 'array', rhythm: options.rhythm, fieldSize })
  }
  return fieldGroupBodyGapVariants({
    size: options.size,
    rhythm: options.rhythm,
    fieldSize,
  })
}

export type FieldGroupLegendVariantProps = VariantProps<typeof fieldGroupLegendVariants>

/** Typography + header margin for `<legend>` on groups and subgroups. */
export function resolveFieldGroupLegendClassName(
  options: FieldGroupLegendVariantProps & {
    fieldSize?: FieldSizeToken
    rhythm?: FieldRhythm
  } = {},
): string {
  const size = options.size ?? 'section'
  const rhythm = options.rhythm ?? 'comfortable'
  if (size === 'array') {
    return resolveArrayLegendClassName(options.fieldSize ?? 'sm')
  }
  return cn(
    fieldGroupLegendVariants({ size, scale: options.scale, rhythm }),
    fieldGroupLegendHeaderMarginVariants({ size, rhythm }),
  )
}

/** Stack + bottom margin for a legend/hint header block nested inside `<legend>`. */
export function resolveFieldGroupLegendHeaderStackClassName(
  size: NonNullable<FieldGroupLegendVariantProps['size']> = 'section',
  rhythm: FieldRhythm = 'comfortable',
): string {
  return cn(
    fieldGroupLegendHeaderStackVariants({ rhythm }),
    fieldGroupLegendHeaderMarginVariants({ size, rhythm }),
  )
}
