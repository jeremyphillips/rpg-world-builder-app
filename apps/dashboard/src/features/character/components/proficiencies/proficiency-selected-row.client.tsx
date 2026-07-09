'use client'

import type { ProficiencyChoiceSelectedRow } from '@rpg/contracts'
import { Badge, Text } from '@rpg/ui'

import { BuilderInventoryRow } from '../builder/builder-inventory-row.client'

export const PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL = 'Stale' as const

export type ProficiencySelectedRowProps = {
  row: ProficiencyChoiceSelectedRow
  onRemove: () => void
}

export function ProficiencySelectedRow({ row, onRemove }: ProficiencySelectedRowProps) {
  return (
    <BuilderInventoryRow
      label={<Text as="span">{row.label}</Text>}
      itemLabel={row.label}
      meta={
        row.isStale ? (
          <Badge variant="secondary" size="sm" title={row.staleReason}>
            {PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL}
          </Badge>
        ) : undefined
      }
      sourceLabel={row.sourceLabel}
      onRemove={onRemove}
    />
  )
}
