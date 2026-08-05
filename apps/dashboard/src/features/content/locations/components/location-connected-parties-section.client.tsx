'use client'

import * as React from 'react'

import type { LocationConnectedPartyRow, LocationConnectedPartySectionGroup } from '@rpg/contracts'
import { Badge, ContentCardRemoveButton, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'

export const LOCATION_CONNECTED_PARTIES_SECTION_LABELS: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: 'Territorial Authority',
  people_and_organizations: 'People & organizations',
}

export const LOCATION_CONNECTED_PARTIES_EMPTY_TEXT: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: 'No territorial authority relationships yet.',
  people_and_organizations: 'No people or organization relationships yet.',
}

function subjectDetailHref(
  campaignId: string,
  subject: LocationConnectedPartyRow['subject'],
): string | undefined {
  if (subject.type === 'character') {
    return ROUTES.campaign.characters.detail(campaignId, subject.id)
  }
  return ROUTES.content.organizations.detail(campaignId, subject.id)
}

function subjectSummary(subject: LocationConnectedPartyRow['subject']): string {
  return subject.type === 'character' ? 'Character' : 'Organization'
}

export type LocationConnectedPartiesSectionProps = {
  campaignId: string
  sectionGroup: LocationConnectedPartySectionGroup
  rows: readonly LocationConnectedPartyRow[]
  canManage?: boolean
  isMutationPending?: boolean
  pendingRelationshipId?: string
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
}

export function LocationConnectedPartiesSection({
  campaignId,
  sectionGroup,
  rows,
  canManage = false,
  isMutationPending = false,
  pendingRelationshipId,
  onRemoveConnection,
}: LocationConnectedPartiesSectionProps) {
  const sectionRows = React.useMemo(
    () => rows.filter((row) => row.sectionGroup === sectionGroup),
    [rows, sectionGroup],
  )

  const groupedRows = React.useMemo(() => {
    const groups = new Map<string, LocationConnectedPartyRow[]>()
    for (const row of sectionRows) {
      const existing = groups.get(row.label) ?? []
      existing.push(row)
      groups.set(row.label, existing)
    }
    return groups
  }, [sectionRows])

  const showSection = sectionRows.length > 0 || sectionGroup === 'territorial_authority'

  if (!showSection && sectionGroup === 'people_and_organizations') {
    return null
  }

  return (
    <section
      className="space-y-4"
      aria-labelledby={`location-connected-parties-${sectionGroup}-heading`}
    >
      <Heading variant="label" as="h2" id={`location-connected-parties-${sectionGroup}-heading`}>
        {LOCATION_CONNECTED_PARTIES_SECTION_LABELS[sectionGroup]}
      </Heading>

      {sectionRows.length === 0 ? (
        <Text variant="muted">{LOCATION_CONNECTED_PARTIES_EMPTY_TEXT[sectionGroup]}</Text>
      ) : (
        <div className="space-y-6">
          {[...groupedRows.entries()].map(([relationshipLabel, relationshipRows]) => (
            <div key={relationshipLabel} className="space-y-2">
              <Heading variant="label" as="h3">
                {relationshipLabel}
              </Heading>
              <ul className="space-y-2">
                {relationshipRows.map((row) => {
                  const href = subjectDetailHref(campaignId, row.subject)
                  const isPending = pendingRelationshipId === row.relationshipId

                  return (
                    <li key={row.relationshipId}>
                      <ContentEntityCard
                        heading={row.subject.name}
                        subheading={subjectSummary(row.subject)}
                        href={href}
                        surface="outline"
                        headingEndSlot={
                          href ? <ContentEntityCardViewLink href={href} /> : undefined
                        }
                        endSlot={
                          <div className="flex items-center gap-2">
                            <Badge tone="neutral">{row.label}</Badge>
                            {canManage && onRemoveConnection ? (
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
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
