import { cva, type VariantProps } from 'class-variance-authority'

import type { IconName } from './icon/icon-glyphs'

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

type StatusIconDefinition = {
  icon: IconName
  /** Edge-to-edge glyphs: smaller box plus compensating heavier stroke. */
  optical?: 'reduced-heavy'
}

export const STATUS_ICON_DEFINITIONS = {
  ready: { icon: 'check' },
  incomplete: { icon: 'ellipsis' },
  off: { icon: 'slash', optical: 'reduced-heavy' },
  none: { icon: 'minus' },
  notConfigured: { icon: 'ellipsis' },
  needsAttention: { icon: 'exclamation' },
} as const satisfies Record<StatusIconVariant, StatusIconDefinition>

export const STATUS_ICON_OPTICAL_REDUCED_HEAVY_CLASS = 'ui-status-icon--optical-reduced-heavy'

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

export type StatusIconVariantProps = VariantProps<typeof statusIconVariants>
