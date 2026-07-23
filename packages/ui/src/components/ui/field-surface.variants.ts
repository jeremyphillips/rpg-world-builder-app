import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { compactLabelAppearanceToneClasses, type CompactLabelTone } from './compact-label.lib'
import {
  DEFAULT_FIELD_BORDER_LADDER_TONE,
  isFieldBorderLadderTone,
  resolveFieldBorderLadderToneClasses,
  type FieldBorderLadderTone,
} from './field-border-ladder.variants'

/** Shared rounded border shell — padding is applied separately per surface kind. */
export const fieldShellLayoutClasses = 'min-w-0 rounded-md border'

/** Group panel/outline body padding — 16px (`p-4`). */
export const fieldGroupBodyPaddingClasses = 'p-4'

/** Shared rounded box layout for group panel and outline body chrome. */
export const fieldGroupBodyShellLayoutClasses = cn(
  fieldShellLayoutClasses,
  fieldGroupBodyPaddingClasses,
)

/** Subtle raised emboss for card-plane surfaces — inset highlight + drop shadow. */
export const fieldSurfaceRaisedShadowClasses = 'shadow-surface-raised'

/** Structural background plane for container chrome. */
export const FIELD_SURFACE_VARIANTS = ['base', 'raised', 'subtle', 'muted', 'strong'] as const

export type FieldSurfaceVariant = (typeof FIELD_SURFACE_VARIANTS)[number]

/** Semantic emphasis for container chrome. */
export const FIELD_STATUS_TONES = ['info', 'success', 'warning', 'destructive'] as const

export type FieldStatusTone = (typeof FIELD_STATUS_TONES)[number]

const fieldSurfaceVariantClasses = {
  base: 'border-border bg-background',
  raised: cn('border-border bg-card', fieldSurfaceRaisedShadowClasses),
  subtle: 'border-border bg-surface-subtle',
  muted: 'border-border bg-surface-muted',
  strong: 'border-border bg-surface-strong',
} satisfies Record<FieldSurfaceVariant, string>

const fieldStatusToneClasses = {
  info: 'border-info-muted bg-info-subtle',
  success: 'border-success-muted bg-success-subtle',
  warning: 'border-warning-muted bg-warning-subtle',
  destructive: 'border-destructive-muted bg-destructive-subtle',
} satisfies Record<FieldStatusTone, string>

export function isFieldSurfaceVariant(value: string): value is FieldSurfaceVariant {
  return (FIELD_SURFACE_VARIANTS as readonly string[]).includes(value)
}

export function isFieldStatusTone(value: string): value is FieldStatusTone {
  return (FIELD_STATUS_TONES as readonly string[]).includes(value)
}

export interface FieldContainerChromeOptions {
  surface?: FieldSurfaceVariant
  status?: FieldStatusTone
}

/**
 * Resolves border/background classes for array items, dependent containers, and
 * similar shells. `status` replaces neutral fill/border from `surface`; `raised`
 * shadow still applies when `surface === 'raised'` and a status is present.
 */
export function resolveFieldContainerChromeClasses(
  options: FieldContainerChromeOptions,
  defaults: { surface: FieldSurfaceVariant } = { surface: 'subtle' },
): string {
  const surface = options.surface ?? (options.status ? 'subtle' : defaults.surface)
  const { status } = options

  if (status) {
    const statusClasses = fieldStatusToneClasses[status]
    if (surface === 'raised') {
      return cn(statusClasses, fieldSurfaceRaisedShadowClasses)
    }
    return statusClasses
  }

  return fieldSurfaceVariantClasses[surface]
}

/** Filled panel wash tones for group `chrome: { variant: 'panel' }`. */
export type FieldGroupPanelTone = FieldSurfaceVariant | FieldStatusTone | CompactLabelTone

/** Border-only outline tones for group `chrome: { variant: 'outline' }`. */
export type FieldGroupOutlineTone = FieldBorderLadderTone | 'primary' | FieldStatusTone

const OUTLINE_STATUS_TONE_CLASS: Record<FieldStatusTone, string> = {
  info: 'border-info-muted',
  success: 'border-success-muted',
  warning: 'border-warning-muted',
  destructive: 'border-destructive',
}

/** Resolves outline border classes (no background wash). */
export function resolveFieldGroupOutlineToneClasses(
  tone: FieldGroupOutlineTone = DEFAULT_FIELD_BORDER_LADDER_TONE,
): string {
  if (isFieldBorderLadderTone(tone)) {
    return resolveFieldBorderLadderToneClasses(tone)
  }

  if (tone === 'primary') {
    return 'border-primary'
  }

  return OUTLINE_STATUS_TONE_CLASS[tone]
}

export function isCompactLabelTone(value: string): value is CompactLabelTone {
  return (
    value === 'neutral' ||
    value === 'info' ||
    value === 'success' ||
    value === 'warning' ||
    value === 'destructive'
  )
}

/** Resolves panel border/bg classes for neutral, status, and semantic tones. */
export function resolveFieldGroupPanelToneClasses(tone: FieldGroupPanelTone = 'subtle'): string {
  if (isCompactLabelTone(tone)) {
    return compactLabelAppearanceToneClasses('soft', tone)
  }

  if (isFieldStatusTone(tone)) {
    return resolveFieldContainerChromeClasses({ status: tone })
  }

  return resolveFieldContainerChromeClasses({ surface: tone })
}

/** @deprecated Use `resolveFieldContainerChromeClasses` with `surface` / `status`. */
export const fieldSurfaceToneVariants = cva('', {
  variants: {
    tone: {
      main: fieldSurfaceVariantClasses.base,
      elevated: fieldSurfaceVariantClasses.raised,
      subtle: fieldSurfaceVariantClasses.subtle,
      muted: fieldSurfaceVariantClasses.muted,
      warning: fieldStatusToneClasses.warning,
      error: fieldStatusToneClasses.destructive,
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
})
