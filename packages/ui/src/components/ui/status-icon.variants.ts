import { cva, type VariantProps } from 'class-variance-authority'

import { iconGlyphRootClasses } from './icon-glyph.variants'

export const STATUS_ICON_VARIANTS = [
  'ready',
  'incomplete',
  'off',
  'none',
  'notConfigured',
  'needsAttention',
] as const

export type StatusIconVariant = (typeof STATUS_ICON_VARIANTS)[number]

export const STATUS_ICON_TOOLTIP_LABELS = {
  ready: 'Ready',
  incomplete: 'Not yet complete',
  needsAttention: 'Needs attention',
  off: 'Off',
  none: 'None configured',
  notConfigured: 'Not configured',
} as const satisfies Record<StatusIconVariant, string>

/** Default Lucide stroke width for every glyph except off-slash. */
export const STATUS_ICON_STROKE_WIDTH = 4
/** Heavier stroke for the off slash — reads lighter at a smaller glyph size. */
export const STATUS_ICON_OFF_SLASH_STROKE_WIDTH = 7

/** Hides the redundant outer ring on Lucide CircleAlert when rendered on a solid disc. */
export const statusIconAlertRingHiddenClasses = '[&>circle]:hidden'

const statusIconNeutralDiscClasses = 'bg-status-icon-idle text-status-icon-neutral-foreground'

const statusIconNeutralGlyphClasses = 'text-status-icon-neutral-foreground'

export const statusIconVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
  {
    variants: {
      variant: {
        ready: 'bg-semantic-success-strong text-semantic-success-strong-foreground',
        needsAttention: 'bg-semantic-warning-strong text-semantic-warning-strong-foreground',
        incomplete: 'bg-status-icon-incomplete text-status-icon-neutral-foreground',
        off: statusIconNeutralDiscClasses,
        none: statusIconNeutralDiscClasses,
        notConfigured: statusIconNeutralDiscClasses,
      },
      size: {
        sm: 'size-4',
        md: 'size-5',
      },
    },
    defaultVariants: {
      variant: 'ready',
      size: 'sm',
    },
  },
)

export const statusIconGlyphVariants = cva('', {
  variants: {
    variant: {
      ready: '',
      incomplete: statusIconNeutralGlyphClasses,
      off: statusIconNeutralGlyphClasses,
      none: statusIconNeutralGlyphClasses,
      notConfigured: statusIconNeutralGlyphClasses,
      needsAttention: statusIconAlertRingHiddenClasses,
    },
    size: {
      sm: '',
      md: '',
    },
  },
  compoundVariants: [
    { variant: 'ready', size: 'sm', class: iconGlyphRootClasses.xs },
    { variant: 'ready', size: 'md', class: iconGlyphRootClasses.sm },
    {
      variant: 'incomplete',
      size: 'sm',
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'incomplete',
      size: 'md',
      class: iconGlyphRootClasses.sm,
    },
    {
      variant: 'none',
      size: 'sm',
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'none',
      size: 'md',
      class: iconGlyphRootClasses.sm,
    },
    {
      variant: 'notConfigured',
      size: 'sm',
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'notConfigured',
      size: 'md',
      class: iconGlyphRootClasses.sm,
    },
    {
      variant: 'needsAttention',
      size: 'sm',
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'needsAttention',
      size: 'md',
      class: iconGlyphRootClasses.sm,
    },
    {
      variant: 'off',
      size: 'sm',
      class: 'size-status-icon-slash-sm',
    },
    {
      variant: 'off',
      size: 'md',
      class: 'size-status-icon-slash-md',
    },
  ],
  defaultVariants: {
    variant: 'ready',
    size: 'sm',
  },
})

export type StatusIconVariantProps = VariantProps<typeof statusIconVariants>
