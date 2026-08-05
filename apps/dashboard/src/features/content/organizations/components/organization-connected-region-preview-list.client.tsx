'use client'

import { Text } from '@rpg/ui'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import type { OrganizationConnectedRegionPreviewItem } from '../lib/organization-display'

export type OrganizationConnectedRegionPreviewListProps = {
  items: OrganizationConnectedRegionPreviewItem[]
  total: number
}

function resolveHiddenCount(
  items: OrganizationConnectedRegionPreviewItem[],
  total: number,
): number {
  return Math.max(0, total - items.length)
}

/** Truncated connected-region rows with family-labeled summaries. */
export function OrganizationConnectedRegionPreviewList({
  items,
  total,
}: OrganizationConnectedRegionPreviewListProps) {
  const hiddenCount = resolveHiddenCount(items, total)

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map(({ card, detailHref }) => (
          <li key={`${card.id}-${card.summary}`}>
            <ContentEntityCard
              heading={card.name}
              subheading={card.summary}
              surface="outline"
              headingEndSlot={<ContentEntityCardViewLink href={detailHref} />}
            />
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? <Text variant="muted">+ {hiddenCount} more</Text> : null}
    </div>
  )
}
