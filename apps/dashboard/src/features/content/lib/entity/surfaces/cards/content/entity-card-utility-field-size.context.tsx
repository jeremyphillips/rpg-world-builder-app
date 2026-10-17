import { createContext, useContext, type ReactNode } from 'react'
import type { ContentCardDensity, FieldSize } from '@rpg/ui'

const EntityCardUtilityFieldSizeContext = createContext<FieldSize | null>(null)

/** Compact entity cards expose xs utility-band controls to trailing slot descendants. */
export function resolveEntityCardUtilityFieldSize(density: ContentCardDensity): FieldSize | null {
  return density === 'compact' ? 'xs' : null
}

export function EntityCardUtilityFieldSizeProvider({
  size,
  children,
}: {
  size: FieldSize | null
  children: ReactNode
}) {
  return (
    <EntityCardUtilityFieldSizeContext.Provider value={size}>
      {children}
    </EntityCardUtilityFieldSizeContext.Provider>
  )
}

/** Field scale for controls rendered in a card trailing utility band; defaults to md outside compact cards. */
export function useEntityCardUtilityFieldSize(): FieldSize {
  return useContext(EntityCardUtilityFieldSizeContext) ?? 'md'
}
