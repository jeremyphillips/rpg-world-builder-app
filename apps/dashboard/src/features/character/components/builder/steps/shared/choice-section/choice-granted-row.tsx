import type { BuilderChoiceGrantedRow } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'

export type ChoiceGrantedRowProps = {
  row: BuilderChoiceGrantedRow
}

export function ChoiceGrantedRow({ row }: ChoiceGrantedRowProps) {
  return (
    <ContentEntityCard
      entity={{
        heading: row.label,
        description: row.sourceLabel ? (
          <Text as="span" variant="muted">
            {row.sourceLabel}
          </Text>
        ) : undefined,
      }}
      density="compact"
    />
  )
}
