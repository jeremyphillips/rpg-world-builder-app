import type { ProficiencyChoiceSelectedRow } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'
import { BuilderInventoryRemoveAction } from '../../inventory/builder-inventory-remove-action'

export const PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL = 'Stale' as const

export type ProficiencySelectedRowProps = {
  row: ProficiencyChoiceSelectedRow
  onRemove: () => void
}

export function ProficiencySelectedRow({ row, onRemove }: ProficiencySelectedRowProps) {
  return (
    <ContentEntityCard
      entity={{
        heading: row.label,
        description: row.sourceLabel ? (
          <Text as="span" variant="muted">
            {row.sourceLabel}
          </Text>
        ) : undefined,
        status: row.isStale
          ? [
              {
                kind: 'badge',
                label: PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL,
                appearance: 'soft',
                tone: 'neutral',
                title: row.staleReason,
              },
            ]
          : undefined,
      }}
      trailing={{
        kind: 'action',
        content: <BuilderInventoryRemoveAction itemLabel={row.label} onRemove={onRemove} />,
      }}
      density="compact"
    />
  )
}
