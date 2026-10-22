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

const STATUS_ICON_TONE_CLASS: Record<StatusIconVariant, string> = {
  ready: 'ui-status-icon--ready',
  needsAttention: 'ui-status-icon--needs-attention',
  incomplete: 'ui-status-icon--incomplete',
  off: 'ui-status-icon--off',
  none: 'ui-status-icon--none',
  notConfigured: 'ui-status-icon--not-configured',
}

const STATUS_ICON_SIZE_CLASS = {
  sm: 'ui-status-icon--sm',
  md: 'ui-status-icon--md',
  lg: 'ui-status-icon--lg',
} as const

export const statusIconVariants = cva('ui-status-icon', {
  variants: {
    variant: STATUS_ICON_TONE_CLASS,
    size: STATUS_ICON_SIZE_CLASS,
  },
  defaultVariants: {
    variant: 'ready',
    size: STATUS_ICON_DEFAULT_SIZE,
  },
})

export const statusIconGlyphVariants = cva('ui-status-icon__glyph', {
  variants: {
    variant: {
      ready: '',
      incomplete: 'ui-status-icon__glyph--neutral',
      off: 'ui-status-icon__glyph--neutral',
      none: 'ui-status-icon__glyph--neutral',
      notConfigured: 'ui-status-icon__glyph--neutral',
      needsAttention: 'ui-status-icon__glyph--needs-attention',
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
    { variant: 'incomplete', size: 'sm', class: iconGlyphRootClasses.xs },
    { variant: 'incomplete', size: 'md', class: iconGlyphRootClasses.xs },
    { variant: 'incomplete', size: 'lg', class: iconGlyphRootClasses.sm },
    { variant: 'none', size: 'sm', class: iconGlyphRootClasses.xs },
    { variant: 'none', size: 'md', class: iconGlyphRootClasses.xs },
    { variant: 'none', size: 'lg', class: iconGlyphRootClasses.sm },
    { variant: 'notConfigured', size: 'sm', class: iconGlyphRootClasses.xs },
    { variant: 'notConfigured', size: 'md', class: iconGlyphRootClasses.xs },
    { variant: 'notConfigured', size: 'lg', class: iconGlyphRootClasses.sm },
    { variant: 'needsAttention', size: 'sm', class: iconGlyphRootClasses.xs },
    { variant: 'needsAttention', size: 'md', class: iconGlyphRootClasses.xs },
    { variant: 'needsAttention', size: 'lg', class: iconGlyphRootClasses.sm },
    { variant: 'off', size: 'sm', class: 'size-status-icon-slash-sm' },
    { variant: 'off', size: 'md', class: 'size-status-icon-slash-sm' },
    { variant: 'off', size: 'lg', class: 'size-status-icon-slash-md' },
  ],
  defaultVariants: {
    variant: 'ready',
    size: STATUS_ICON_DEFAULT_SIZE,
  },
})

export type StatusIconVariantProps = VariantProps<typeof statusIconVariants>
