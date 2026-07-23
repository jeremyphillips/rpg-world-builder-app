import { cn } from '../../lib/utils'
import {
  resolveFieldBorderLadderToneClasses,
  type FieldBorderLadderTone,
} from './field-border-ladder.variants'
import {
  DEFAULT_DEPENDENT_SURFACE,
  resolveSurfaceClasses,
  type SemanticSurfaceTone,
} from './surface.variants'
import type { SemanticTone, SurfaceConfig, VisualEmphasis } from './visual-vocabulary.types'

export { fieldSurfaceRaisedShadowClasses, insetPanelSunkenShadowClasses } from './field-surface.lib'
export {
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_DEPENDENT_SURFACE,
  DEFAULT_PANEL_SURFACE,
  resolveSurfaceClasses,
  SEMANTIC_SURFACE_TONES,
  type SemanticSurfaceTone,
  type SurfaceChromeConfig,
} from './surface.variants'

/** Shared rounded border shell — padding is applied separately per surface kind. */
export const fieldShellLayoutClasses = 'min-w-0 rounded-md border'

/** Group panel/outline body padding — 16px (`p-4`). */
export const fieldGroupBodyPaddingClasses = 'p-4'

/** Shared rounded box layout for group panel and outline body chrome. */
export const fieldGroupBodyShellLayoutClasses = cn(
  fieldShellLayoutClasses,
  fieldGroupBodyPaddingClasses,
)

export interface FieldContainerChromeOptions {
  surface?: SurfaceConfig
  tone?: SemanticSurfaceTone
}

/**
 * Resolves border/background classes for array items, dependent containers, and
 * similar shells. Semantic `tone` replaces neutral fill/border from `surface`;
 * raised elevation still applies when present alongside a tone.
 */
export function resolveFieldContainerChromeClasses(
  options: FieldContainerChromeOptions,
  defaults: { surface: SurfaceConfig } = { surface: DEFAULT_DEPENDENT_SURFACE },
): string {
  const { tone } = options
  const surface = options.surface ?? (tone ? DEFAULT_DEPENDENT_SURFACE : defaults.surface)

  return resolveSurfaceClasses({ ...surface, tone })
}

export function isCompactLabelTone(
  value: string,
): value is import('./compact-label.lib').CompactLabelTone {
  return (
    value === 'neutral' ||
    value === 'info' ||
    value === 'success' ||
    value === 'warning' ||
    value === 'destructive'
  )
}

const OUTLINE_SEMANTIC_TONE_CLASS: Record<SemanticSurfaceTone, string> = {
  info: 'border-info-muted',
  success: 'border-success-muted',
  warning: 'border-warning-muted',
  destructive: 'border-destructive',
}

/** Maps visual emphasis to border-ladder utilities for outline chrome. */
export function resolveOutlineBorderClasses(
  emphasis: VisualEmphasis = 'subtle',
  tone?: SemanticTone,
  borderAccent?: 'primary',
): string {
  if (borderAccent === 'primary') {
    return 'border-primary'
  }

  if (tone && tone !== 'neutral') {
    return OUTLINE_SEMANTIC_TONE_CLASS[tone as SemanticSurfaceTone]
  }

  const ladderTone: FieldBorderLadderTone =
    emphasis === 'faint'
      ? 'faint'
      : emphasis === 'default'
        ? 'default'
        : emphasis === 'strong'
          ? 'strong'
          : 'subtle'

  return resolveFieldBorderLadderToneClasses(ladderTone)
}
