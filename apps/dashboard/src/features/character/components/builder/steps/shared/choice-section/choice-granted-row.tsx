import type { BuilderChoiceGrantedRow } from '@rpg/contracts'
import { Text } from '@rpg/ui'
import { BadgeCheck } from 'lucide-react'

import { ContentEntityCard } from '@/features/content'

import { choiceGrantedRowIconClasses } from './choice-granted-row.variants'

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
      leading={<BadgeCheck className={choiceGrantedRowIconClasses} aria-hidden />}
      density="compact"
    />
  )
}
