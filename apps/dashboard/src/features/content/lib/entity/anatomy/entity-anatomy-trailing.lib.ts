import type { RowAnatomyCellSpec } from '@rpg/ui'

import type { EntityAnatomyColumn } from './entity-anatomy.types'
import type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'

export type EntityAnatomyTrailingCells = {
  primary: RowAnatomyCellSpec<EntityAnatomyColumn>
}

const TRAILING_BAND_CELL = { slot: 'band', column: 'trailing' } as const
const TRAILING_FULL_CELL = { slot: 'full', column: 'trailing' } as const

/** Consumers declare meaning; the anatomy picks the cell. */
export function resolveEntityAnatomyTrailingCells(
  trailing: EntityAnatomyTrailing,
): EntityAnatomyTrailingCells {
  switch (trailing.kind) {
    case 'action':
      return { primary: TRAILING_BAND_CELL }
    case 'utility':
      return { primary: TRAILING_FULL_CELL }
    case 'indicator':
      return { primary: trailing.variant === 'chevron' ? TRAILING_FULL_CELL : TRAILING_BAND_CELL }
    case 'group':
      // The secondary label sits inline before the control, in the same band cell.
      return { primary: TRAILING_BAND_CELL }
    default: {
      const _exhaustive: never = trailing
      return _exhaustive
    }
  }
}

/** Ghost 24px trailing controls share the leading utilities' optical whitespace. */
export function isEntityAnatomyUtilityTrailing(
  trailing: EntityAnatomyTrailing | undefined,
): boolean {
  if (!trailing) return false
  return (
    trailing.kind === 'utility' || (trailing.kind === 'indicator' && trailing.variant === 'chevron')
  )
}
