import type { BuilderChoiceGrantedRow } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { EntityCard } from '@/features/content'

import { GrantedChoiceLeadingIcon } from './granted-choice-leading-icon'

export type ChoiceGrantedRowProps = {
  row: BuilderChoiceGrantedRow
}

export function ChoiceGrantedRow({ row }: ChoiceGrantedRowProps) {
  return (
    <EntityCard
      entity={{
        heading: row.label,
        description: row.sourceLabel ? <Text variant="caption">{row.sourceLabel}</Text> : undefined,
      }}
      leading={{ kind: 'title', content: <GrantedChoiceLeadingIcon /> }}
      density="compact"
    />
  )
}
