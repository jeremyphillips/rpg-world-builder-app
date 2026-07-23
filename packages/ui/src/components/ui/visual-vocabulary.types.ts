export type SemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'destructive'

export type VisualEmphasis = 'faint' | 'subtle' | 'default' | 'strong'

export type ContentTone = 'default' | 'secondary' | 'disabled'

export type ChromeVariant = 'plain' | 'outline' | 'panel' | 'accent' | 'callout'

/** Brand border accent for outline chrome — not a semantic tone. */
export type ChromeBorderAccent = 'primary'

/** Phase 1 — elevation on panel chrome only; accent variant omits elevation. */
export type ChromeConfig = {
  variant: ChromeVariant
  tone?: SemanticTone
  emphasis?: VisualEmphasis
  elevation?: SurfaceElevation
  /** Outline variant only — brand-primary perimeter. */
  borderAccent?: ChromeBorderAccent
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
