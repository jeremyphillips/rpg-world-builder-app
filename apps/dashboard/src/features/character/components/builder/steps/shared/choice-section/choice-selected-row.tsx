import type { BuilderChoiceSelectedRow } from '@rpg/contracts'

import { EntityCard } from '@/features/content'
import { BuilderInventoryRemoveAction } from '../../../inventory/builder-inventory-remove-action'

export const CHOICE_SELECTED_ROW_STALE_BADGE_LABEL = 'Stale' as const

export type ChoiceSelectedRowProps = {
  row: BuilderChoiceSelectedRow
  onRemove: () => void
}

export function ChoiceSelectedRow({ row, onRemove }: ChoiceSelectedRowProps) {
  return (
    <EntityCard
      entity={{
        heading: row.label,
        status: row.isStale
          ? [
              {
                kind: 'badge',
                label: CHOICE_SELECTED_ROW_STALE_BADGE_LABEL,
                appearance: 'soft',
                tone: 'neutral',
                title: row.staleReason,
              },
            ]
          : undefined,
      }}
      trailing={{
        kind: 'utility',
        content: <BuilderInventoryRemoveAction itemLabel={row.label} onRemove={onRemove} />,
      }}
      density="compact"
    />
  )
}
