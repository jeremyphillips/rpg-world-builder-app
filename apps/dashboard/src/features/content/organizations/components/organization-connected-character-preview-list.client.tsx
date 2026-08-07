'use client'

import { Text } from '@rpg/ui'

import { formatCharacterInlineSummary } from '@/features/character'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import type { OrganizationConnectedCharacterPreviewItem } from '../lib/organization-display'

export type OrganizationConnectedCharacterPreviewListProps = {
  items: OrganizationConnectedCharacterPreviewItem[]
  total: number
}

function resolveHiddenCount(
  items: OrganizationConnectedCharacterPreviewItem[],
  total: number,
): number {
  return Math.max(0, total - items.length)
}

/** Truncated connected-character rows with generic "+ N more" overflow copy. */
export function OrganizationConnectedCharacterPreviewList({
  items,
  total,
}: OrganizationConnectedCharacterPreviewListProps) {
  const hiddenCount = resolveHiddenCount(items, total)

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map(({ summary, detailHref }) => (
          <li key={summary.id}>
            <ContentEntityCard
              heading={summary.name}
              subheading={
                formatCharacterInlineSummary(summary, { includeCharacterType: true }) || undefined
              }
              headingEndSlot={<ContentEntityCardViewLink href={detailHref} />}
            />
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? <Text variant="muted">+ {hiddenCount} more</Text> : null}
    </div>
  )
}
