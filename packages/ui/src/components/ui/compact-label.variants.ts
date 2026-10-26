import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  chipRemovablePaddingClass,
  chipSizeClass,
  compactLabelAppearanceToneClasses,
  compactLabelEmphasisClasses,
  type ChipSize,
  type CompactLabelAppearance,
  type CompactLabelEmphasis,
  type CompactLabelTone,
} from './compact-label.lib'
import { badgeLayoutVariants } from './badge.variants'
import {
  resolveCompactControlIconCompactSmClasses,
  resolveCompactControlRecipeClasses,
} from './compact-control.styles'
export type CompactLabelVariantProps = {
  appearance?: CompactLabelAppearance
  tone?: CompactLabelTone
  emphasis?: CompactLabelEmphasis
  selected?: boolean
  interactive?: boolean
  removable?: boolean
}

/** Internal CVA — not exported from `@rpg/ui`. Size is not a shared axis. */
export const compactLabelVariants = cva('ui-compact-label', {
  variants: {
    selected: {
      true: 'ui-compact-label--selected',
      false: '',
    },
    interactive: {
      true: 'ui-compact-label--interactive ui-focus-ring',
      false: '',
    },
  },
  defaultVariants: {
    selected: false,
    interactive: false,
  },
})

export function resolveCompactLabelClassName({
  appearance = 'outline',
  tone = 'neutral',
  emphasis = 'default',
  selected = false,
  interactive = false,
  removable = false,
  className,
}: CompactLabelVariantProps & { className?: string }): string {
  const appearanceClasses =
    !selected && !interactive ? compactLabelAppearanceToneClasses(appearance, tone) : null

  return cn(
    compactLabelVariants({
      selected,
      interactive,
    }),
    appearanceClasses,
    compactLabelEmphasisClasses(emphasis),
    removable && !selected ? 'ui-compact-label--soft-neutral' : null,
    className,
  )
}

export function resolveChipSizeClassName(size: ChipSize, removable = false): string {
  return cn(chipSizeClass(size), removable ? chipRemovablePaddingClass(size) : null)
}

export type CompactLabelVariants = VariantProps<typeof compactLabelVariants>

export type CompactLabelClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const COMPACT_LABEL_CLASS_SPECS: readonly CompactLabelClassSpec[] = [
  {
    key: 'badge / outline / neutral / md',
    className: resolveCompactLabelClassName({
      appearance: 'outline',
      tone: 'neutral',
    }),
    keyValues: 'transparent fill, neutral outline foreground',
    useCase: 'Default metadata badge',
  },
  {
    key: 'badge / soft / destructive / sm',
    className: resolveCompactLabelClassName({
      appearance: 'soft',
      tone: 'destructive',
    }),
    keyValues: 'semantic destructive soft fill',
    useCase: 'Compact table or rail status',
  },
  {
    key: 'badge / strong / info / md',
    className: resolveCompactLabelClassName({
      appearance: 'strong',
      tone: 'info',
    }),
    keyValues: 'semantic info strong fill',
    useCase: 'High-emphasis classification',
  },
  {
    key: 'badge / subdued / neutral soft / sm',
    className: resolveCompactLabelClassName({
      appearance: 'soft',
      tone: 'neutral',
      emphasis: 'subdued',
    }),
    keyValues: 'muted foreground, soft neutral well',
    useCase: 'Exhausted or completed labels',
  },
  {
    key: 'badge / counter / destructive soft / sm',
    className: cn(
      resolveCompactLabelClassName({
        appearance: 'soft',
        tone: 'destructive',
      }),
      badgeLayoutVariants({ layout: 'counter' }),
    ),
    keyValues: 'tabular nums, min-width, tight padding-inline',
    useCase: 'Issue or validation counts',
  },
  {
    key: 'chip / selectable / unselected / md',
    className: resolveCompactLabelClassName({
      interactive: true,
      selected: false,
    }),
    keyValues: 'interactive base; hover uses control-hover',
    useCase: 'ChipsField toggle (off)',
  },
  {
    key: 'chip / selectable / selected / md',
    className: resolveCompactLabelClassName({
      interactive: true,
      selected: true,
    }),
    keyValues: 'selected-control fill',
    useCase: 'ChipsField toggle (on)',
  },
  {
    key: 'chip / removable / neutral soft / md',
    className: resolveCompactLabelClassName({
      appearance: 'soft',
      tone: 'neutral',
      removable: true,
    }),
    keyValues: 'removable padding-end; dismiss is __remove',
    useCase: 'Combobox selected value',
  },
]

export const chipRemoveButtonVariants = cva('ui-compact-label__remove ui-focus-ring', {
  variants: {
    size: {
      xs: 'ui-chip__remove--xs',
      sm: resolveCompactControlIconCompactSmClasses(),
      md: resolveCompactControlRecipeClasses('icon-compact'),
      lg: resolveCompactControlRecipeClasses('icon-default'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
