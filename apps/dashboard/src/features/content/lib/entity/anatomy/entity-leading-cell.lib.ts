import type { RowAnatomyCellSpec } from '@rpg/ui'

import type { EntityAnatomyLeading } from './entity-anatomy-leading.types'
import type { EntityAnatomyColumn } from './entity-anatomy.types'

const LEADING_BAND_CELL = {
  slot: 'band',
  column: 'leading',
} as const satisfies RowAnatomyCellSpec<EntityAnatomyColumn>
const LEADING_FULL_CELL = {
  slot: 'full',
  column: 'leading',
} as const satisfies RowAnatomyCellSpec<EntityAnatomyColumn>

/** Consumers declare meaning; anatomy picks the row track. */
export function resolveEntityLeadingCell(
  leading: EntityAnatomyLeading,
): RowAnatomyCellSpec<EntityAnatomyColumn> {
  switch (leading.kind) {
    case 'title':
      return LEADING_BAND_CELL
    case 'selection':
      return LEADING_FULL_CELL
    default: {
      const _exhaustive: never = leading
      return _exhaustive
    }
  }
}
