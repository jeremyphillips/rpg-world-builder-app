import type { FieldGroupLegendScale, FieldGroupLegendSize } from '../components/ui/field.variants'
import { resolveArrayLegendScale } from '../components/ui/field.variants'
import type { FieldSizeToken } from '../components/ui/field-sizing.variants'
import type { FieldHintConfig } from './field-config'

/** Resolved typography tier — label and hint always share this tier. */
export type FormHeadingTier = 'section' | 'subsection' | 'leaf'

/** Feature-level heading — tier is never authored on dashboard form JSON. */
export type FormHeading = {
  label: string
  hint?: string | FieldHintConfig
}

export type FieldLabelVisibility = 'visible' | 'srOnly'

type LabelVisibilitySource = {
  labelVisibility?: FieldLabelVisibility
  /** @deprecated Use `labelVisibility: 'srOnly'`. */
  labelHidden?: boolean
  /** @deprecated Use `labelVisibility: 'srOnly'`. */
  hideLabel?: boolean
}

/** Single resolver for visible vs screen-reader-only leaf labels. */
export function resolveFieldLabelVisibility(source: LabelVisibilitySource): FieldLabelVisibility {
  if (source.labelVisibility) return source.labelVisibility
  if (source.labelHidden || source.hideLabel) return 'srOnly'
  return 'visible'
}

/** Maps named-group depth to structural section typography (capped at subsection). */
export function resolveGroupHeadingTier(namedGroupDepth: number): 'section' | 'subsection' {
  return namedGroupDepth === 0 ? 'section' : 'subsection'
}

/** Increments depth only when entering a named structural group or array. */
export function resolveNamedGroupDepthAfterEntering(
  hasNamedHeading: boolean,
  parentNamedGroupDepth: number,
): number {
  return hasNamedHeading ? parentNamedGroupDepth + 1 : parentNamedGroupDepth
}

/** Bridges structural tier to existing group legend size tokens. */
export function resolveGroupLegendSize(tier: 'section' | 'subsection'): FieldGroupLegendSize {
  return tier
}

/** Derives array legend presentation from structural depth and section density scale. */
export function resolveArrayLegendPresentation(
  namedGroupDepth: number,
  fieldSize: FieldSizeToken,
): { legendSize: FieldGroupLegendSize; legendScale: FieldGroupLegendScale } {
  if (namedGroupDepth >= 1) {
    return { legendSize: 'subsection', legendScale: 'default' }
  }
  return { legendSize: 'array', legendScale: resolveArrayLegendScale(fieldSize) }
}

/** Resolves explicit `legendSize` override during migration, else structural tier. */
export function resolveGroupLegendSizeWithLegacyOverride(
  tier: 'section' | 'subsection',
  legacyLegendSize?: FieldGroupLegendSize,
): FieldGroupLegendSize {
  if (legacyLegendSize) return legacyLegendSize
  return resolveGroupLegendSize(tier)
}

/** Resolves array legend during migration — explicit override wins until Phase 3 removal. */
export function resolveArrayLegendPresentationWithLegacyOverride(
  namedGroupDepth: number,
  fieldSize: FieldSizeToken,
  legacyLegendSize?: FieldGroupLegendSize,
): { legendSize: FieldGroupLegendSize; legendScale: FieldGroupLegendScale } {
  if (legacyLegendSize && legacyLegendSize !== 'array') {
    return { legendSize: legacyLegendSize, legendScale: 'default' }
  }
  return resolveArrayLegendPresentation(namedGroupDepth, fieldSize)
}

export function isNonWhitespaceLabel(label: string | undefined): label is string {
  return Boolean(label?.trim())
}
