import { fieldSizeToBadgeSize, fieldSizeToChipSize, type FieldSize } from '@rpg/ui'

import { useEntityCardUtilityFieldSize } from './entity-card-utility-field-size.context'

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
