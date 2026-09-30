import type { BuilderChoiceGrantedRow } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'

import { GrantedChoiceLeadingIcon } from './granted-choice-leading-icon'

export type ChoiceGrantedRowProps = {
  row: BuilderChoiceGrantedRow
}

export function ChoiceGrantedRow({ row }: ChoiceGrantedRowProps) {
  return (
    <ContentEntityCard
      entity={{
        heading: row.label,
        description: row.sourceLabel ? (
          <Text variant="caption" className="text-muted-foreground">
            {row.sourceLabel}
          </Text>
        ) : undefined,
      }}
      leading={<GrantedChoiceLeadingIcon />}
      density="compact"
    />
  )
}
