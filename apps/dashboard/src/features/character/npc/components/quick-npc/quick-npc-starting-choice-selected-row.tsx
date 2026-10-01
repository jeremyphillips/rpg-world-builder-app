import { ContentEntityCard } from '@/features/content'
import { Text } from '@rpg/ui'

import { BuilderInventoryRemoveAction } from '../../../components/builder/inventory/builder-inventory-remove-action'

export type QuickNpcStartingChoiceSelectedRowProps = {
  label: string
  suggestionHint?: string
  suggestionTitle?: string
  alsoGrantedHint?: string
  onRemove: () => void
}

/** Removable starting-choice row — same ContentEntityCard chrome as builder choice-selected-row. */
export function QuickNpcStartingChoiceSelectedRow({
  label,
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
        content: <BuilderInventoryRemoveAction itemLabel={label} onRemove={onRemove} />,
      }}
      density="compact"
    />
  )
}
