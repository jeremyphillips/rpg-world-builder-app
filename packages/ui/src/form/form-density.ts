import type { FieldSizeToken } from '../components/ui/field-sizing.variants'
import type { FieldRhythm } from '../components/ui/field.variants'

/** Canonical form section density — maps to rhythm + control scale together. */
export type FormDensity = 'comfortable' | 'compact'

export const DEFAULT_FORM_DENSITY: FormDensity = 'comfortable'
export const DEFAULT_ARRAY_SECTION_DENSITY: FormDensity = 'compact'

/** Resolves rhythm and control scale from a single density token. */
export function resolveFormDensity(density: FormDensity = DEFAULT_FORM_DENSITY): {
  rhythm: FieldRhythm
  size: FieldSizeToken
} {
  return density === 'compact'
    ? { rhythm: 'compact', size: 'sm' }
    : { rhythm: 'comfortable', size: 'md' }
}

/** Resolves section density: explicit config → section default → inherited parent. */
export function resolveSectionDensity(options: {
  explicit?: FormDensity | undefined
  inherited: FormDensity
  sectionDefault?: FormDensity | undefined
}): FormDensity {
  return options.explicit ?? options.sectionDefault ?? options.inherited
}
