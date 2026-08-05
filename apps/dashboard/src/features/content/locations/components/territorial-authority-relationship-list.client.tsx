'use client'

import type { TerritorialAuthorityKind, TerritorialAuthorityRelationship } from '@rpg/contracts'
import { Badge, ContentCardRemoveButton, Heading } from '@rpg/ui'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import type { TerritorialAuthorityRow } from '../lib/territorial-authority.lib'

export type TerritorialAuthorityRelationshipListProps = {
  groupedRows: Map<TerritorialAuthorityKind, TerritorialAuthorityRelationship[]>
  rowsById: ReadonlyMap<string, TerritorialAuthorityRow>
  variant: 'edit' | 'detail'
  kindHeadingAs?: 'h3' | 'h4'
  onRemoveRelationship?: (relationshipId: string) => void
}

export function TerritorialAuthorityRelationshipList({
  groupedRows,
  rowsById,
  variant,
  kindHeadingAs = variant === 'edit' ? 'h4' : 'h3',
  onRemoveRelationship,
}: TerritorialAuthorityRelationshipListProps) {
  const listItems = [...groupedRows.entries()].map(([kind, kindRelationships]) => {
    const kindLabel = rowsById.get(kindRelationships[0]?.id ?? '')?.kindLabel ?? kind

    const cards = kindRelationships.flatMap((relationship) => {
      const row = rowsById.get(relationship.id)
      if (!row) return []

      if (variant === 'edit') {
        return [
          <ContentEntityCard
            key={relationship.id}
            density="compact"
            surface="card"
            heading={row.organizationLabel}
            subheading={row.organizationSummary}
            endSlot={
              <div className="flex items-center gap-2">
                {row.organizationUnresolved ? <Badge tone="warning">Unavailable</Badge> : null}
                <ContentCardRemoveButton
                  label={`${row.kindLabel}: ${row.organizationLabel}`}
                  onRemove={() => onRemoveRelationship?.(relationship.id)}
                />
              </div>
            }
          />,
        ]
      }

      return [
        <li key={relationship.id}>
          <ContentEntityCard
            heading={row.organizationLabel}
            href={row.organizationHref}
            subheading={row.organizationSummary}
            surface="outline"
            headingEndSlot={
              row.organizationHref ? (
                <ContentEntityCardViewLink href={row.organizationHref} />
              ) : undefined
            }
            endSlot={
              row.organizationUnresolved ? <Badge tone="warning">Unavailable</Badge> : undefined
            }
          />
        </li>,
      ]
    })

    return (
      <div key={kind} className="space-y-2">
        <Heading variant="label" as={kindHeadingAs}>
          {kindLabel}
        </Heading>
        {variant === 'edit' ? (
          <div className="space-y-2" aria-label={kindLabel}>
            {cards}
          </div>
        ) : (
          <ul className="space-y-2">{cards}</ul>
        )}
      </div>
    )
  })

  return <div className="space-y-6">{listItems}</div>
}
