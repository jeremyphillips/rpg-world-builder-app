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

export const STATUS_ICON_STROKE_WIDTH = 4
export const STATUS_ICON_OFF_SLASH_STROKE_WIDTH = 7
/** Overrides default glyph sizing — Lucide slash reads larger/heavier than check/minus. */
export const STATUS_ICON_OFF_SLASH_SIZE_SM_CLASSES = '!size-[6px]'
export const STATUS_ICON_OFF_SLASH_SIZE_MD_CLASSES = '!size-[8px]'

const statusIconNeutralSurfaceClasses =
  'bg-[var(--foreground-subtle)] text-semantic-success-strong-foreground dark:bg-semantic-neutral-strong dark:text-semantic-neutral-strong-foreground'

export const statusIconVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
  {
    variants: {
      variant: {
        ready: 'bg-semantic-success-strong text-semantic-success-strong-foreground',
        needsAttention: 'bg-semantic-warning-strong text-semantic-warning-strong-foreground',
        incomplete:
          'bg-[var(--foreground-disabled)] text-semantic-success-strong-foreground dark:bg-semantic-neutral-strong dark:text-semantic-neutral-strong-foreground',
        off: statusIconNeutralSurfaceClasses,
        none: statusIconNeutralSurfaceClasses,
        notConfigured: statusIconNeutralSurfaceClasses,
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

/** Shared glyph color for solid-disc icons — matches the ready checkmark. */
export const statusIconGlyphForegroundClasses = 'text-semantic-success-strong-foreground'

export const statusIconGlyphVariants = cva('', {
  variants: {
    variant: {
      ready: '',
      incomplete: statusIconGlyphForegroundClasses,
      off: statusIconGlyphForegroundClasses,
      none: statusIconGlyphForegroundClasses,
      notConfigured: statusIconGlyphForegroundClasses,
      needsAttention: '[&>circle]:hidden',
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
      class: STATUS_ICON_OFF_SLASH_SIZE_SM_CLASSES,
    },
    {
      variant: 'off',
      size: 'md',
      class: STATUS_ICON_OFF_SLASH_SIZE_MD_CLASSES,
    },
  ],
  defaultVariants: {
    variant: 'ready',
    size: 'sm',
  },
})

export type StatusIconVariantProps = VariantProps<typeof statusIconVariants>
