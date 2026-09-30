import { ContentEntityCard } from '@/features/content'
import { Text } from '@rpg/ui'

import { BuilderInventoryRemoveAction } from '../../../components/builder/inventory/builder-inventory-remove-action'

export type QuickNpcStartingChoiceSelectedRowProps = {
  label: string
  alsoGrantedHint?: string
  onRemove: () => void
}

/** Removable starting-choice row — same ContentEntityCard chrome as builder choice-selected-row. */
export function QuickNpcStartingChoiceSelectedRow({
  label,
  alsoGrantedHint,
  onRemove,
}: QuickNpcStartingChoiceSelectedRowProps) {
  return (
    <ContentEntityCard
      entity={{
        heading: label,
        description: alsoGrantedHint ? (
          <Text variant="caption" className="text-muted-foreground">
            {alsoGrantedHint}
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
