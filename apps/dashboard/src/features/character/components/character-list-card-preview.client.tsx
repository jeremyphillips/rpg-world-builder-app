'use client'

import { Text } from '@rpg/ui'

import { CharacterListCard } from './character-list-card.client'
import type { CharacterListCardPreviewItem } from './character-list-card.lib'

export type CharacterListCardPreviewProps = {
  items: CharacterListCardPreviewItem[]
  total: number
}

function resolveHiddenCount(items: CharacterListCardPreviewItem[], total: number): number {
  return Math.max(0, total - items.length)
}

/** Truncated character card list with generic "+ N more" overflow copy. */
export function CharacterListCardPreview({ items, total }: CharacterListCardPreviewProps) {
  const hiddenCount = resolveHiddenCount(items, total)

  return (
    <div className="space-y-3">
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map(({ card, detailHref }) => (
          <li key={card.id}>
            <CharacterListCard card={card} detailHref={detailHref} />
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? <Text variant="muted">+ {hiddenCount} more</Text> : null}
    </div>
  )
}
