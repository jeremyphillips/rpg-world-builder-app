import type { FieldSize } from '../../components/ui/field.client'
import type { FieldRhythm } from '../../components/ui/field.variants'
import { DEFAULT_FORM_DENSITY, resolveFormDensity, type FormDensity } from '../form-density'

export type ResolveFormSectionHeaderPresentationInput = {
  density?: FormDensity
  rhythm?: FieldRhythm
  size?: FieldSize
  inheritedDensity?: FormDensity
}

/** Resolves rhythm + control scale for {@link FormSectionHeader} — explicit overrides win, then density, then context. */
export function resolveFormSectionHeaderPresentation(
  options: ResolveFormSectionHeaderPresentationInput,
): { rhythm: FieldRhythm; size: FieldSize } {
  if (options.rhythm !== undefined || options.size !== undefined) {
    return {
      rhythm: options.rhythm ?? 'comfortable',
      size: options.size ?? 'md',
    }
  }
  if (options.density !== undefined) {
    return resolveFormDensity(options.density)
  }
  if (options.inheritedDensity !== undefined) {
    return resolveFormDensity(options.inheritedDensity)
  }
  return resolveFormDensity(DEFAULT_FORM_DENSITY)
}
