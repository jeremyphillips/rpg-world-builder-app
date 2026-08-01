import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'
import { fieldSurfaceRaisedShadowClasses, insetPanelSunkenShadowClasses } from './field-surface.lib'
import type { SemanticTone, SurfaceConfig, VisualEmphasis } from './visual-vocabulary.types'

export type SemanticSurfaceTone = Exclude<SemanticTone, 'neutral'>

export const SEMANTIC_SURFACE_TONES = [
  'info',
  'success',
  'warning',
  'destructive',
] as const satisfies readonly SemanticSurfaceTone[]

export type SurfaceChromeConfig = SurfaceConfig & {
  tone?: SemanticSurfaceTone
}

const SEMANTIC_SURFACE_SUBTLE_CLASSES: Record<SemanticSurfaceTone, string> = {
  info: 'border-info-muted bg-info-subtle',
  success: 'border-success-muted bg-success-subtle',
  warning: 'border-warning-muted bg-warning-subtle',
  destructive: 'border-destructive-muted bg-destructive-subtle',
}

const NEUTRAL_EMPHASIS_CLASSES: Record<Exclude<VisualEmphasis, 'faint'>, string> = {
  subtle: cn('border-border bg-surface-subtle', establishSurfaceCurrent('surface-subtle')),
  default: cn('border-border bg-surface-muted', establishSurfaceCurrent('surface-muted')),
  strong: cn('border-border bg-surface-strong', establishSurfaceCurrent('surface-strong')),
}

function resolveNeutralSurfaceClasses(config: SurfaceConfig): string {
  const { emphasis, elevation } = config

  if (elevation === 'raised') {
    return cn(
      'border-card-border bg-card',
      establishSurfaceCurrent('card'),
      fieldSurfaceRaisedShadowClasses,
    )
  }

  if (elevation === 'sunken') {
    return cn(
      'border-border bg-sunken',
      establishSurfaceCurrent('sunken'),
      insetPanelSunkenShadowClasses,
    )
  }

  if (emphasis && emphasis !== 'faint') {
    return NEUTRAL_EMPHASIS_CLASSES[emphasis]
  }

  return cn('border-border bg-background', establishSurfaceCurrent('background'))
}

/** Resolves border/background classes for neutral and semantic surface planes. */
export function resolveSurfaceClasses(config: SurfaceChromeConfig = {}): string {
  const { tone } = config

  if (tone) {
    const semanticClasses = SEMANTIC_SURFACE_SUBTLE_CLASSES[tone]
    if (config.elevation === 'raised') {
      return cn(semanticClasses, fieldSurfaceRaisedShadowClasses)
    }
    return semanticClasses
  }

  return resolveNeutralSurfaceClasses(config)
}

/** Default neutral panel wash when chrome omits tone and emphasis. */
export const DEFAULT_PANEL_SURFACE: SurfaceConfig = { emphasis: 'subtle', elevation: 'flat' }

/** Default array item shell — raised card plane. */
export const DEFAULT_ARRAY_ITEM_SURFACE: SurfaceConfig = { elevation: 'raised' }

/** Default dependent container wash. */
export const DEFAULT_DEPENDENT_SURFACE: SurfaceConfig = { emphasis: 'subtle', elevation: 'flat' }
