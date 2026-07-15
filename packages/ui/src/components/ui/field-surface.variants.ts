import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { compactLabelAppearanceToneClasses, type CompactLabelTone } from './compact-label.lib'

/** Shared rounded box layout for group panel and outline body chrome. */
export const fieldGroupBodyShellLayoutClasses = 'min-w-0 rounded-md border p-4'

/** Subtle raised emboss for card-plane surfaces — inset highlight + drop shadow. */
export const fieldSurfaceRaisedShadowClasses = 'shadow-surface-raised'

/** Surface tone for stack dependents and array item shells. */
export type FieldSurfaceTone = 'main' | 'elevated' | 'subtle' | 'medium' | 'warning' | 'error'

/**
 * Border/bg tone only — no layout padding. Shared by stack dependents wrapper
 * chrome and array item shells when `dependentsChromeScope: 'arrayItems'`.
 */
export const fieldSurfaceToneVariants = cva('', {
  variants: {
    tone: {
      main: 'border-border bg-background',
      /** Opaque lift above the page plane — maps to the card surface token. */
      elevated: cn('border-border bg-card', fieldSurfaceRaisedShadowClasses),
      /** Very light wash — default for dependents and group panels. */
      subtle: 'border-border bg-muted/10',
      /** Medium wash — former `subtle` / `muted` panel strength. */
      medium: 'border-border bg-muted/30',
      warning: 'border-border bg-accent/30',
      error: 'border-destructive/50 bg-destructive/10',
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
})

export type FieldSurfaceToneVariantProps = VariantProps<typeof fieldSurfaceToneVariants>

/** Filled panel wash tones for group `fieldsChrome: { variant: 'panel' }`. */
export type FieldGroupPanelTone =
  | 'subtle'
  | 'medium'
  | 'emphasis'
  | 'main'
  | 'elevated'
  | 'warning'
  | 'error'
  | CompactLabelTone
  /** @deprecated Use `medium` */
  | 'muted'
  /** @deprecated Use `subtle` */
  | 'subtle20'

/** Border-only outline tones for group `fieldsChrome: { variant: 'outline' }`. */
export type FieldGroupOutlineTone = 'border' | 'primary' | 'destructive' | 'warning'

const PANEL_TONE_CLASS: Record<Exclude<FieldGroupPanelTone, CompactLabelTone>, string> = {
  subtle: 'border-border bg-muted/10',
  medium: 'border-border bg-muted/30',
  muted: 'border-border bg-muted/30',
  subtle20: 'border-border bg-muted/10',
  emphasis: 'border-border bg-muted/50',
  main: 'border-border bg-background',
  elevated: cn('border-border bg-card', fieldSurfaceRaisedShadowClasses),
  warning: 'border-border bg-accent/30',
  error: 'border-destructive/50 bg-destructive/10',
}

const OUTLINE_TONE_CLASS: Record<FieldGroupOutlineTone, string> = {
  border: 'border-border',
  primary: 'border-primary',
  destructive: 'border-destructive',
  warning: 'border-warning-muted',
}

export function isCompactLabelTone(value: string): value is CompactLabelTone {
  return (
    value === 'neutral' ||
    value === 'informative' ||
    value === 'positive' ||
    value === 'caution' ||
    value === 'negative'
  )
}

function normalizeFieldGroupPanelTone(tone: FieldGroupPanelTone): FieldGroupPanelTone {
  if (tone === 'muted') return 'medium'
  if (tone === 'subtle20') return 'subtle'
  return tone
}

/** Resolves panel border/bg classes for neutral, status, and semantic tones. */
export function resolveFieldGroupPanelToneClasses(tone: FieldGroupPanelTone = 'subtle'): string {
  const resolved = normalizeFieldGroupPanelTone(tone)
  if (isCompactLabelTone(resolved)) {
    return compactLabelAppearanceToneClasses('soft', resolved)
  }

  return PANEL_TONE_CLASS[resolved]
}

/** Resolves outline border classes (no background wash). */
export function resolveFieldGroupOutlineToneClasses(
  tone: FieldGroupOutlineTone = 'border',
): string {
  return OUTLINE_TONE_CLASS[tone]
}
