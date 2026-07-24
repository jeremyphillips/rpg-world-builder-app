'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { FILTER_DENSITY_DEFAULT } from './filter-bar.variants'
import type { FilterDensity } from './filter-schema.types'

/** Section-level filter presentation — not values, schema, or behavior. */
export type FilterChromeContextValue = {
  density: FilterDensity
}

const FilterChromeContext = createContext<FilterChromeContextValue | undefined>(undefined)

export function FilterChromeProvider({
  density,
  children,
}: {
  density?: FilterDensity
  children: ReactNode
}) {
  const parent = useOptionalFilterChrome()
  const value: FilterChromeContextValue = {
    density: density ?? parent?.density ?? FILTER_DENSITY_DEFAULT,
  }

  return <FilterChromeContext.Provider value={value}>{children}</FilterChromeContext.Provider>
}

/** Strict hook for schema-owned filter components. Defaults to compact outside provider. */
export function useFilterChrome(): FilterChromeContextValue {
  const context = useContext(FilterChromeContext)
  return context ?? { density: FILTER_DENSITY_DEFAULT }
}

/** Optional hook for general primitives — undefined when outside filter chrome. */
export function useOptionalFilterChrome(): FilterChromeContextValue | undefined {
  return useContext(FilterChromeContext)
}
