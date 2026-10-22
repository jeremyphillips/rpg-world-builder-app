import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  compactLabelAppearanceToneClasses,
  compactLabelEmphasisClasses,
  type CompactLabelAppearance,
  type CompactLabelEmphasis,
  type CompactLabelSize,
  type CompactLabelTone,
} from './compact-label.lib'
import { badgeLayoutVariants } from './badge.variants'
import {
  resolveCompactControlIconCompactSmClasses,
  resolveCompactControlRecipeClasses,
} from './compact-control.styles'
import { compactLabelIconGlyphClasses } from './icon-glyph.variants'

export type CompactLabelVariantProps = {
  size?: CompactLabelSize
  appearance?: CompactLabelAppearance
  tone?: CompactLabelTone
  emphasis?: CompactLabelEmphasis
  filled?: boolean
  selected?: boolean
  interactive?: boolean
  removable?: boolean
}

/** Chip/Badge sm fixed height — 22px @ 16px root. */
export const COMPACT_LABEL_SM_HEIGHT_CLASS = 'h-[22px]'

/** Reserved row height for Badge/Chip sm — matches {@link COMPACT_LABEL_SM_HEIGHT_CLASS}. */
export const COMPACT_LABEL_SM_MIN_HEIGHT_CLASS = 'min-h-[22px]'

const compactLabelRemovablePaddingClasses: Record<CompactLabelSize, string> = {
  sm: 'ui-compact-label--removable-sm',
  md: 'ui-compact-label--removable-md',
  lg: 'ui-compact-label--removable-lg',
}

const compactLabelIconSizeClasses: Record<CompactLabelSize, string> = {
  sm: compactLabelIconGlyphClasses('sm'),
  md: compactLabelIconGlyphClasses('md'),
  lg: compactLabelIconGlyphClasses('lg'),
}

/** Internal CVA — not exported from `@rpg/ui`. */
export const compactLabelVariants = cva('ui-compact-label', {
  variants: {
    size: {
      sm: 'ui-compact-label--sm',
      md: 'ui-compact-label--md',
      lg: 'ui-compact-label--lg',
    },
    filled: {
      true: '',
      false: '',
    },
    selected: {
      true: 'ui-compact-label--selected',
      false: '',
    },
    interactive: {
      true: cn(
        'ui-compact-label--interactive ui-focus-ring',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      ),
      false: '',
    },
    removable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      removable: true,
      size: 'sm',
      className: compactLabelRemovablePaddingClasses.sm,
    },
    {
      removable: true,
      size: 'md',
      className: compactLabelRemovablePaddingClasses.md,
    },
    {
      removable: true,
      size: 'lg',
      className: compactLabelRemovablePaddingClasses.lg,
    },
  ],
  defaultVariants: {
    size: 'md',
    filled: false,
    selected: false,
    interactive: false,
    removable: false,
  },
})

export function resolveCompactLabelClassName({
  size = 'md',
  appearance = 'outline',
  tone = 'neutral',
  emphasis = 'default',
  filled,
  selected = false,
  interactive = false,
  removable = false,
  className,
}: CompactLabelVariantProps & { className?: string }): string {
  const resolvedFilled = filled ?? (selected || appearance === 'soft' || appearance === 'strong')

  const appearanceClasses =
    !selected && !interactive ? compactLabelAppearanceToneClasses(appearance, tone) : null

  return cn(
    compactLabelVariants({
      size,
      filled: resolvedFilled,
      selected,
      interactive,
      removable,
    }),
    compactLabelIconSizeClasses[size],
    appearanceClasses,
    compactLabelEmphasisClasses(emphasis),
    removable && !selected ? 'ui-compact-label--soft-neutral' : null,
    className,
  )
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
      size: 'md',
      appearance: 'outline',
      tone: 'neutral',
    }),
    keyValues: 'transparent fill, neutral outline foreground',
    useCase: 'Default metadata badge',
  },
  {
    key: 'badge / soft / destructive / sm',
    className: resolveCompactLabelClassName({
      size: 'sm',
      appearance: 'soft',
      tone: 'destructive',
      filled: true,
    }),
    keyValues: 'semantic destructive soft fill',
    useCase: 'Compact table or rail status',
  },
  {
    key: 'badge / strong / info / md',
    className: resolveCompactLabelClassName({
      size: 'md',
      appearance: 'strong',
      tone: 'info',
      filled: true,
    }),
    keyValues: 'semantic info strong fill',
    useCase: 'High-emphasis classification',
  },
  {
    key: 'badge / subdued / neutral soft / sm',
    className: resolveCompactLabelClassName({
      size: 'sm',
      appearance: 'soft',
      tone: 'neutral',
      emphasis: 'subdued',
      filled: true,
    }),
    keyValues: 'muted foreground, soft neutral well',
    useCase: 'Exhausted or completed labels',
  },
  {
    key: 'badge / counter / destructive soft / sm',
    className: cn(
      resolveCompactLabelClassName({
        size: 'sm',
        appearance: 'soft',
        tone: 'destructive',
        filled: true,
      }),
      badgeLayoutVariants({ layout: 'counter' }),
    ),
    keyValues: 'tabular nums, min-width, tight padding-inline',
    useCase: 'Issue or validation counts',
  },
  {
    key: 'chip / selectable / unselected / md',
    className: resolveCompactLabelClassName({
      size: 'md',
      interactive: true,
      selected: false,
    }),
    keyValues: 'interactive base; hover uses control-hover',
    useCase: 'ChipsField toggle (off)',
  },
  {
    key: 'chip / selectable / selected / md',
    className: resolveCompactLabelClassName({
      size: 'md',
      interactive: true,
      selected: true,
      filled: true,
    }),
    keyValues: 'selected-control fill',
    useCase: 'ChipsField toggle (on)',
  },
  {
    key: 'chip / removable / neutral soft / md',
    className: resolveCompactLabelClassName({
      size: 'md',
      appearance: 'soft',
      tone: 'neutral',
      filled: true,
      removable: true,
    }),
    keyValues: 'removable padding-end; dismiss is __remove',
    useCase: 'Combobox selected value',
  },
]

export const chipRemoveButtonVariants = cva(
  cn(
    'ui-compact-label__remove ui-focus-ring',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ),
  {
    variants: {
      size: {
        sm: resolveCompactControlIconCompactSmClasses(),
        md: resolveCompactControlRecipeClasses('icon-compact'),
        lg: resolveCompactControlRecipeClasses('icon-default'),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)
