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
  selected?: boolean
  interactive?: boolean
  removable?: boolean
}

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
    size: 'md',
    selected: false,
    interactive: false,
  },
})

export function resolveCompactLabelClassName({
  size = 'md',
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
      size,
      selected,
      interactive,
    }),
    compactLabelIconSizeClasses[size],
    appearanceClasses,
    compactLabelEmphasisClasses(emphasis),
    removable ? compactLabelRemovablePaddingClasses[size] : null,
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
      removable: true,
    }),
    keyValues: 'removable padding-end; dismiss is __remove',
    useCase: 'Combobox selected value',
  },
]

export const chipRemoveButtonVariants = cva('ui-compact-label__remove ui-focus-ring', {
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
})
