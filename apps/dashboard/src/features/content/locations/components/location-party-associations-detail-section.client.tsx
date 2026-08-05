'use client'

import * as React from 'react'

import type { Location, Organization } from '@rpg/contracts'
import { Badge, Heading, Text } from '@rpg/ui'

import { useCampaignCharacters } from '@/features/campaign'
import { useNpcs } from '@/features/character'
import { useOrganizations } from '@/features/content'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import {
  buildLocationPartyAssociationRows,
  buildLocationPartyCharactersById,
  groupLocationPartyAssociationRows,
  LOCATION_PARTY_EMPTY_TEXT,
  LOCATION_PARTY_SECTION_LABEL,
} from '../lib/location-party-associations.lib'
import { resolveLocationAuthoringType } from '../lib/location-authoring-type'
import { shouldShowLocationPartyAssociationsSection } from '../lib/location-party-authoring-policy'

export function LocationPartyAssociationsDetailSection({
  location,
  campaignId,
}: {
  location: Location
  campaignId: string
}) {
  const associations = location.partyAssociations ?? []
  const authoringType = resolveLocationAuthoringType(location)
  const showSection = shouldShowLocationPartyAssociationsSection({
    authoringType,
    associations,
  })

  const { data: campaignCharacters = [] } = useCampaignCharacters(campaignId)
  const { data: npcs = [] } = useNpcs(campaignId)
  const { data: organizations = [] } = useOrganizations(campaignId)

  const charactersById = React.useMemo(
    () => buildLocationPartyCharactersById(campaignCharacters, npcs),
    [campaignCharacters, npcs],
  )

  const organizationsById = React.useMemo(
    () =>
      new Map(organizations.map((organization: Organization) => [organization.id, organization])),
    [organizations],
  )

  const rows = React.useMemo(
    () =>
      buildLocationPartyAssociationRows({
        associations,
        campaignId,
        charactersById,
        organizationsById,
      }),
    [associations, campaignId, charactersById, organizationsById],
  )
  const groupedRows = React.useMemo(() => groupLocationPartyAssociationRows(rows), [rows])

  if (!showSection) {
    return null
  }

  return (
    <section className="space-y-4" aria-labelledby="location-party-associations-heading">
      <Heading variant="label" as="h2" id="location-party-associations-heading">
        {LOCATION_PARTY_SECTION_LABEL}
      </Heading>

      {associations.length === 0 ? (
        <Text variant="muted">{LOCATION_PARTY_EMPTY_TEXT}</Text>
      ) : (
        <div className="space-y-6">
          {[...groupedRows.entries()].map(([relationshipKey, relationshipRows]) => (
            <div key={relationshipKey} className="space-y-2">
              <Heading variant="label" as="h3">
                {relationshipRows[0]?.semanticLabel ?? relationshipKey}
              </Heading>
              <ul className="space-y-2">
                {relationshipRows.map((row) => (
                  <li key={row.association.id}>
                    <ContentEntityCard
                      heading={row.partyLabel}
                      href={row.partyHref}
                      subheading={row.partySummary}
                      surface="outline"
                      headingEndSlot={
                        row.partyHref ? (
                          <ContentEntityCardViewLink href={row.partyHref} />
                        ) : undefined
                      }
                      endSlot={
                        row.partyUnresolved ? <Badge tone="warning">Unavailable</Badge> : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
