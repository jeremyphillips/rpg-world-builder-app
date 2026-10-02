import type { ReactNode } from 'react'

import { ContentEntityCard } from '@/features/content'
import { Text } from '@rpg/ui'

import { BuilderInventoryRemoveAction } from '../../../components/builder/inventory/builder-inventory-remove-action'

export type QuickNpcStartingChoiceSelectedRowProps = {
  label: string
  quantity?: ReactNode
  suggestionHint?: string
  suggestionTitle?: string
  alsoGrantedHint?: string
  onRemove: () => void
}

/** Removable starting-choice row — shared ContentEntityCard anatomy for skills, equipment, and spells. */
export function QuickNpcStartingChoiceSelectedRow({
  label,
  quantity,
  suggestionHint,
  suggestionTitle,
  alsoGrantedHint,
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
      }}
      trailing={{
        kind: 'action',
        content: (
          <div className="flex items-center gap-2">
            {quantity}
            <BuilderInventoryRemoveAction itemLabel={label} onRemove={onRemove} />
          </div>
        ),
      }}
      density="compact"
    />
  )
}
