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

/**
 * StatusIcon size semantics (semantic rename + 12px tier):
 * - New `sm` → 12px disc (introduced compact tier)
 * - Old `sm` (16px) → `md`
 * - Old `md` (20px) → `lg`
 * Default `md` keeps implicit 16px renders unchanged.
 */
export const STATUS_ICON_DEFAULT_SIZE = 'md' as const

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
        sm: 'size-3',
        md: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: {
      variant: 'ready',
      size: STATUS_ICON_DEFAULT_SIZE,
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
      lg: '',
    },
  },
  compoundVariants: [
    { variant: 'ready', size: 'sm', class: iconGlyphRootClasses.xs },
    { variant: 'ready', size: 'md', class: iconGlyphRootClasses.xs },
    { variant: 'ready', size: 'lg', class: iconGlyphRootClasses.sm },
    {
      variant: 'incomplete',
      size: 'sm',
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'incomplete',
      size: 'md',
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'incomplete',
      size: 'lg',
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
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'none',
      size: 'lg',
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
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'notConfigured',
      size: 'lg',
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
      class: iconGlyphRootClasses.xs,
    },
    {
      variant: 'needsAttention',
      size: 'lg',
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
      class: 'size-status-icon-slash-sm',
    },
    {
      variant: 'off',
      size: 'lg',
      class: 'size-status-icon-slash-md',
    },
  ],
  defaultVariants: {
    variant: 'ready',
    size: STATUS_ICON_DEFAULT_SIZE,
  },
})

export type StatusIconVariantProps = VariantProps<typeof statusIconVariants>
