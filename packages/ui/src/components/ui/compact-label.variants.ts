import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  compactLabelAppearanceToneClasses,
  type CompactLabelAppearance,
  type CompactLabelSize,
  type CompactLabelTone,
} from './compact-label.lib'

export type CompactLabelVariantProps = {
  size?: CompactLabelSize
  appearance?: CompactLabelAppearance
  tone?: CompactLabelTone
  filled?: boolean
  selected?: boolean
  interactive?: boolean
  removable?: boolean
}

const compactLabelRemovablePaddingClasses: Record<'md' | 'lg', string> = {
  md: 'pr-0.5',
  lg: 'pr-1',
}

const compactLabelIconSizeClasses: Record<CompactLabelSize, string> = {
  sm: '[&_svg]:size-2.5',
  md: '[&_svg]:size-3',
  lg: '[&_svg]:size-3.5',
}

/** Internal CVA — not exported from `@rpg/ui`. */
export const compactLabelVariants = cva(
  'inline-flex max-w-full items-center gap-1 rounded-full border border-transparent',
  {
    variants: {
      size: {
        sm: 'px-2 py-px text-xs-meta',
        md: 'px-3 py-1 text-sm-meta',
        lg: 'px-4 py-2 text-md',
      },
      filled: {
        true: 'font-medium',
        false: 'font-light',
      },
      selected: {
        true: 'border-selected-control-border bg-selected-control text-selected-control-foreground',
        false: '',
      },
      interactive: {
        true: cn(
          'cursor-pointer transition-colors',
          'hover:bg-control-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
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
        selected: false,
        interactive: true,
        className: 'border-border bg-transparent text-foreground',
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
  },
)

export function resolveCompactLabelClassName({
  size = 'md',
  appearance = 'outline',
  tone = 'neutral',
  filled,
  selected = false,
  interactive = false,
  removable = false,
  className,
}: CompactLabelVariantProps & { className?: string }): string {
  const resolvedFilled = filled ?? (selected || appearance === 'soft' || appearance === 'neutral')

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
    removable && !selected ? 'border-border bg-semantic-neutral-subtle text-foreground' : null,
    className,
  )
}

export type CompactLabelVariants = VariantProps<typeof compactLabelVariants>

export const chipRemoveButtonVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground',
    'hover:bg-control-hover hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  {
    variants: {
      size: {
        md: 'size-6 [&_svg]:size-3',
        lg: 'size-8 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)
