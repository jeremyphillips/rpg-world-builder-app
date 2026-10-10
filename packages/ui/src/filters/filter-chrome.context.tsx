'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { FILTER_DENSITY_DEFAULT } from './filter-bar.variants'
import type { FilterDensity } from './filter-schema.types'

/**
 * How omitted select `layout` resolves.
 * `per-field` keeps the global default (stacked). `floating` is the catalog-region default.
 */
export type FilterSelectPresentation = 'per-field' | 'floating'

/** Section-level filter presentation — not values, schema, or behavior. */
export type FilterChromeContextValue = {
  density: FilterDensity
  selectPresentation?: FilterSelectPresentation
}

const FILTER_SELECT_PRESENTATION_DEFAULT: FilterSelectPresentation = 'per-field'

const FilterChromeContext = createContext<FilterChromeContextValue | undefined>(undefined)

export function FilterChromeProvider({
  density,
  selectPresentation,
  children,
}: {
  density?: FilterDensity
  selectPresentation?: FilterSelectPresentation
  children: ReactNode
}) {
  const parent = useOptionalFilterChrome()
  const value: FilterChromeContextValue = {
    density: density ?? parent?.density ?? FILTER_DENSITY_DEFAULT,
    selectPresentation:
      selectPresentation ?? parent?.selectPresentation ?? FILTER_SELECT_PRESENTATION_DEFAULT,
  }

  return <FilterChromeContext.Provider value={value}>{children}</FilterChromeContext.Provider>
}

/** Strict hook for schema-owned filter components. Defaults to compact outside provider. */
export function useFilterChrome(): FilterChromeContextValue {
  const context = useContext(FilterChromeContext)
  return (
    context ?? {
      density: FILTER_DENSITY_DEFAULT,
      selectPresentation: FILTER_SELECT_PRESENTATION_DEFAULT,
    }
  )
}

/** Optional hook for general primitives — undefined when outside filter chrome. */
export function useOptionalFilterChrome(): FilterChromeContextValue | undefined {
  return useContext(FilterChromeContext)
}
