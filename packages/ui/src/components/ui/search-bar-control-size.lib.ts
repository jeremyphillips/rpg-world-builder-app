import type { FieldSize } from './field.client'
import { fieldGroupedControlHeightClasses } from './field-sizing.variants'
import { DEFAULT_FORM_DENSITY, type FormDensity } from '../../form/form-density'
import { resolveFieldControlSize } from '../../form/resolve-field-control-size.lib'
import { resolveFilterControlSize } from '../../filters/filter-presentation.lib'
import type { FilterDensity } from '../../filters/filter-schema.types'

export type ResolveSearchBarControlSizeOptions = {
  explicitSize?: FieldSize | undefined
  filterDensity?: FilterDensity | undefined
  formDensity?: FormDensity
}

/**
 * SearchBar control scale precedence:
 * 1. explicit `size` prop
 * 2. nearest FilterChromeProvider density
 * 3. FormSection density
 */
export function resolveSearchBarControlSize(
  options: ResolveSearchBarControlSizeOptions,
): FieldSize {
  if (options.explicitSize) {
    return options.explicitSize
  }
  if (options.filterDensity) {
    return resolveFilterControlSize(options.filterDensity)
  }
  return resolveFieldControlSize({
    density: options.formDensity ?? DEFAULT_FORM_DENSITY,
  })
}

/** Maps resolved field size to height utility for class-contract tests. */
export function searchBarControlHeightClass(size: FieldSize): string {
  return fieldGroupedControlHeightClasses[size]
}
