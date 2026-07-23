export type SemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'destructive'

export type VisualEmphasis = 'faint' | 'subtle' | 'default' | 'strong'

export type ContentTone = 'default' | 'secondary' | 'disabled'

export type ChromeVariant = 'plain' | 'outline' | 'panel' | 'accent' | 'callout'

/** Phase 1 — no elevation on chrome (avoids incoherent accent+sunken combos). */
export type ChromeConfig = {
  variant: ChromeVariant
  tone?: SemanticTone
  emphasis?: VisualEmphasis
}

/** Documented + exported for future subsystem migrations; not on ChromeConfig yet. */
export type SurfaceElevation = 'flat' | 'raised' | 'sunken'

export type SurfaceConfig = {
  emphasis?: VisualEmphasis
  elevation?: SurfaceElevation
}

/** Phase 1 closed union — expand deliberately as consumers appear. */
export type SupportedSemanticChrome =
  | { tone: 'warning'; emphasis: 'faint' | 'subtle' }
  | { tone: 'neutral'; emphasis: 'subtle' }
