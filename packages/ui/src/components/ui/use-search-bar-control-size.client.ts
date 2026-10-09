'use client'

import type { FieldSize } from './field.client'
import { useFormSectionContext } from '../../form/context/form-section.context'
import { useOptionalFilterChrome } from '../../filters/filter-chrome.context'
import { resolveSearchBarControlSize } from './search-bar-control-size.lib'

/** Resolves SearchBar control size from explicit prop, filter chrome, then form section. */
export function useSearchBarControlSize(explicitSize?: FieldSize): FieldSize {
  const filterChrome = useOptionalFilterChrome()
  const { density: formDensity } = useFormSectionContext()

  return resolveSearchBarControlSize({
    explicitSize,
    filterDensity: filterChrome?.density,
    formDensity,
  })
}
