'use client'

import type { ReactNode } from 'react'

import { Button, Text } from '@rpg/ui'

export type RelationshipEmptyInlineRowProps = {
  emptyLabel: ReactNode
  addLabel?: ReactNode
  onAdd?: () => void
}

export function RelationshipEmptyInlineRow({
  emptyLabel,
  addLabel,
  onAdd,
}: RelationshipEmptyInlineRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <Text variant="muted" className="text-sm">
        {emptyLabel}
      </Text>
      {addLabel && onAdd ? (
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          {addLabel}
        </Button>
      ) : null}
    </div>
  )
}
