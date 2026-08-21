'use client'

import type { ProficiencyGrantedRow as ProficiencyGrantedRowModel } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'

export type ProficiencyGrantedRowProps = {
  row: ProficiencyGrantedRowModel
}

export function ProficiencyGrantedRow({ row }: ProficiencyGrantedRowProps) {
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
