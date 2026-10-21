import {
  fieldSizeToBadgeSize,
  fieldSizeToChipSize,
  type ContentCardDensity,
  type FieldSize,
} from '@rpg/ui'
import { useContext } from 'react'

import { EntityCardUtilityFieldSizeContext } from './entity-card-utility-field-size.context'

/** Compact entity cards expose xs utility-band controls to trailing slot descendants. */
export function resolveEntityCardUtilityFieldSize(density: ContentCardDensity): FieldSize | null {
  return density === 'compact' ? 'xs' : null
}

/** Field scale for controls rendered in a card trailing utility band; defaults to md outside compact cards. */
export function useEntityCardUtilityFieldSize(): FieldSize {
  return useContext(EntityCardUtilityFieldSizeContext) ?? 'md'
}

/** Field + compact-label sizes for controls rendered in a compact card trailing utility band. */
export function useEntityCardUtilityControlSizes(): {
  fieldSize: FieldSize
  chipSize: (typeof fieldSizeToChipSize)[FieldSize]
  badgeSize: (typeof fieldSizeToBadgeSize)[FieldSize]
} {
  const fieldSize = useEntityCardUtilityFieldSize()
  return {
    fieldSize,
    chipSize: fieldSizeToChipSize[fieldSize],
    badgeSize: fieldSizeToBadgeSize[fieldSize],
  }
}
