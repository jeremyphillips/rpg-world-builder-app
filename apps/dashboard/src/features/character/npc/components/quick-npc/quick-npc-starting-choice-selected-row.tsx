import type { ReactNode } from 'react'

import {
  ContentEntityCard,
  DetailEntityRowActions,
  type EntitySummaryStatusItem,
} from '@/features/content'
import { Text } from '@rpg/ui'

import { BuilderInventoryRemoveAction } from '../../../components/builder/inventory/builder-inventory-remove-action'

export type QuickNpcStartingChoiceSelectedRowProps = {
  label: string
  quantity?: ReactNode
  suggestionHint?: string
  suggestionTitle?: string
  alsoGrantedHint?: string
  /** Selection-row status for this owned item (compatibility badges). */
  status?: EntitySummaryStatusItem[]
  onRemove: () => void
}

/** Removable starting-choice row — shared ContentEntityCard anatomy for skills, equipment, and spells. */
export function QuickNpcStartingChoiceSelectedRow({
  label,
  quantity,
  suggestionHint,
  suggestionTitle,
  alsoGrantedHint,
  status,
  onRemove,
}: QuickNpcStartingChoiceSelectedRowProps) {
  const description = [suggestionHint, alsoGrantedHint].filter(Boolean).join(' ')
  return (
    <ContentEntityCard
      entity={{
        heading: label,
        description: description ? (
          <Text variant="caption" title={suggestionTitle} className="text-muted-foreground">
            {description}
          </Text>
        ) : undefined,
        ...(status?.length ? { status, statusComposition: 'metadata' as const } : {}),
      }}
      trailing={{
        kind: 'utility',
        content:
          quantity != null ? (
            <DetailEntityRowActions>
              {quantity}
              <BuilderInventoryRemoveAction itemLabel={label} onRemove={onRemove} />
            </DetailEntityRowActions>
          ) : (
            <BuilderInventoryRemoveAction itemLabel={label} onRemove={onRemove} />
          ),
      }}
      density="compact"
    />
  )
}
