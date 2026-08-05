'use client'

import * as React from 'react'

import type { Location, Organization } from '@rpg/contracts'
import { Badge, Heading, Text } from '@rpg/ui'

import { useOrganizations } from '@/features/content'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import { resolveLocationAuthoringType } from '../lib/location-authoring-type'
import {
  buildTerritorialAuthorityRows,
  groupTerritorialAuthorityRelationshipsByKind,
  shouldShowTerritorialAuthoritySection,
  TERRITORIAL_AUTHORITY_EMPTY_TEXT,
  TERRITORIAL_AUTHORITY_SECTION_LABEL,
} from '../lib/territorial-authority.lib'

export function TerritorialAuthorityDetailSection({
  location,
  campaignId,
}: {
  location: Location
  campaignId: string
}) {
  const isRegion = location.kind === 'region'
  const relationships = React.useMemo(
    () => (isRegion ? (location.territorialAuthority ?? []) : []),
    [isRegion, location],
  )
  const authoringType = resolveLocationAuthoringType(location)
  const showSection = shouldShowTerritorialAuthoritySection({
    authoringType,
    relationships,
  })

  const { data: organizations = [] } = useOrganizations(campaignId)

  const organizationsById = React.useMemo(
    () =>
      new Map(organizations.map((organization: Organization) => [organization.id, organization])),
    [organizations],
  )

  const rows = React.useMemo(
    () =>
      buildTerritorialAuthorityRows({
        relationships,
        campaignId,
        organizationsById,
      }),
    [campaignId, organizationsById, relationships],
  )

  const groupedRows = React.useMemo(
    () => groupTerritorialAuthorityRelationshipsByKind(relationships),
    [relationships],
  )

  const rowsById = React.useMemo(
    () => new Map(rows.map((row) => [row.relationship.id, row])),
    [rows],
  )

  if (!isRegion || !showSection) {
    return null
  }

  return (
    <section className="space-y-4" aria-labelledby="location-territorial-authority-heading">
      <Heading variant="label" as="h2" id="location-territorial-authority-heading">
        {TERRITORIAL_AUTHORITY_SECTION_LABEL}
      </Heading>

      {relationships.length === 0 ? (
        <Text variant="muted">{TERRITORIAL_AUTHORITY_EMPTY_TEXT}</Text>
      ) : (
        <div className="space-y-6">
          {[...groupedRows.entries()].map(([kind, kindRelationships]) => {
            const kindLabel = rowsById.get(kindRelationships[0]?.id ?? '')?.kindLabel ?? kind
            return (
              <div key={kind} className="space-y-2">
                <Heading variant="label" as="h3">
                  {kindLabel}
                </Heading>
                <ul className="space-y-2">
                  {kindRelationships.map((relationship) => {
                    const row = rowsById.get(relationship.id)
                    if (!row) return null

                    return (
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
                            row.organizationUnresolved ? (
                              <Badge tone="warning">Unavailable</Badge>
                            ) : undefined
                          }
                        />
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
