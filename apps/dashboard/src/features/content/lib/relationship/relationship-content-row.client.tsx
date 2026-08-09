'use client'

import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'

import { Button, Text } from '@rpg/ui'

import { relationshipContentRowVariants } from './relationship-content-row.variants'

export type RelationshipContentRowProps = {
  emptyLabel?: ReactNode
  addLabel?: ReactNode
  onAdd?: () => void
}

/**
 * Content-level row for relationship groups: optional empty copy plus the
 * group's Add action in a stable leading cluster.
 *
 * Placement follows group structure, not data state — unlabeled groups render
 * this row in both empty (`emptyLabel` + action) and populated (action only)
 * states so the action never moves. Labeled groups mount their action on the
 * group header (`DetailSectionGroup.endSlot`) and use this row for empty copy
 * only.
 */
export function RelationshipContentRow({
  emptyLabel,
  addLabel,
  onAdd,
}: RelationshipContentRowProps) {
  return (
    <div className={relationshipContentRowVariants()}>
      {emptyLabel ? (
        <Text variant="muted" className="text-sm">
          {emptyLabel}
        </Text>
      ) : null}
      {addLabel && onAdd ? (
        <Button type="button" variant="ghost" size="sm" density="compact" onClick={onAdd}>
          <Plus aria-hidden />
          {addLabel}
        </Button>
      ) : null}
    </div>
  )
}
