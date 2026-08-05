'use client'

import type { TerritorialAuthorityKind } from '@rpg/contracts'
import { ContentCardRemoveButton, SelectField, Text } from '@rpg/ui'

import { buildTerritorialAuthorityKindOptions } from '@/features/content/locations/lib/territorial-authority.lib'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import type { OrganizationConnectedRegionPreviewItem } from '../lib/organization-display'

export type OrganizationConnectedRegionPreviewListProps = {
  items: OrganizationConnectedRegionPreviewItem[]
  total: number
  pendingRelationshipId?: string
  onRemoveTerritorialAuthority?: (input: {
    regionId: string
    relationshipId: string
    regionName: string
  }) => void
  onUpdateTerritorialAuthorityKind?: (input: {
    regionId: string
    relationshipId: string
    kind: TerritorialAuthorityKind
  }) => void
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
  pendingRelationshipId,
  onRemoveTerritorialAuthority,
  onUpdateTerritorialAuthorityKind,
}: OrganizationConnectedRegionPreviewListProps) {
  const hiddenCount = resolveHiddenCount(items, total)
  const kindOptions = buildTerritorialAuthorityKindOptions('region')

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map((item) => {
          const {
            relationshipId,
            card,
            detailHref,
            canEditTerritorial,
            regionId,
            relationshipKind,
          } = item
          const isPending = pendingRelationshipId === relationshipId

          return (
            <li key={relationshipId}>
              <ContentEntityCard
                heading={card.name}
                subheading={card.summary}
                surface="outline"
                headingEndSlot={<ContentEntityCardViewLink href={detailHref} />}
                endSlot={
                  canEditTerritorial ? (
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <SelectField
                        id={`connected-region-kind-${relationshipId}`}
                        label="Authority type"
                        value={relationshipKind}
                        options={kindOptions}
                        disabled={isPending}
                        onValueChange={(value) =>
                          onUpdateTerritorialAuthorityKind?.({
                            regionId,
                            relationshipId,
                            kind: value as TerritorialAuthorityKind,
                          })
                        }
                      />
                      <ContentCardRemoveButton
                        label={`${card.name} territorial authority`}
                        onRemove={() => {
                          if (isPending) return
                          onRemoveTerritorialAuthority?.({
                            regionId,
                            relationshipId,
                            regionName: card.name,
                          })
                        }}
                      />
                    </div>
                  ) : undefined
                }
              />
            </li>
          )
        })}
      </ul>
      {hiddenCount > 0 ? <Text variant="muted">+ {hiddenCount} more</Text> : null}
    </div>
  )
}
