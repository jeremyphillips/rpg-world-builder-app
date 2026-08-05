'use client'

import type { LocationConnectedPartyRow } from '@rpg/contracts'
import { Pencil } from 'lucide-react'
import { Badge, ContentCardIconAction, ContentCardRemoveButton } from '@rpg/ui'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

type LocationConnectedPartyRowCardProps = {
  campaignId: string
  row: LocationConnectedPartyRow
  href?: string
  subjectSummary: string
  canEdit?: boolean
  canRemove?: boolean
  isPending?: boolean
  isMutationPending?: boolean
  onEditConnection?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
}

export function LocationConnectedPartyRowCard({
  campaignId: _campaignId,
  row,
  href,
  subjectSummary,
  canEdit = false,
  canRemove = false,
  isPending = false,
  isMutationPending = false,
  onEditConnection,
  onRemoveConnection,
}: LocationConnectedPartyRowCardProps) {
  return (
    <ContentEntityCard
      heading={row.subject.name}
      subheading={subjectSummary}
      href={href}
      headingEndSlot={href ? <ContentEntityCardViewLink href={href} /> : undefined}
      endSlot={
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{row.label}</Badge>
          {canEdit && onEditConnection ? (
            <ContentCardIconAction
              type="button"
              aria-label={`Edit ${row.subject.name} ${row.label}`}
              onClick={() =>
                onEditConnection({
                  relationshipId: row.relationshipId,
                  subjectType: row.subject.type,
                  subjectId: row.subject.id,
                  kind: row.kind,
                })
              }
            >
              <Pencil aria-hidden />
            </ContentCardIconAction>
          ) : null}
          {canRemove && onRemoveConnection ? (
            <ContentCardRemoveButton
              label={`${row.subject.name} ${row.label}`}
              onRemove={() => {
                if (isPending || isMutationPending) return
                void onRemoveConnection({
                  relationshipId: row.relationshipId,
                  subjectType: row.subject.type,
                  subjectId: row.subject.id,
                })
              }}
            />
          ) : null}
        </div>
      }
    />
  )
}
