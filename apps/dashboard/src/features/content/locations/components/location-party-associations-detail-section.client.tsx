'use client'

import * as React from 'react'

import type { Location, Organization } from '@rpg/contracts'
import { Badge, Heading, InsetPanel, Text } from '@rpg/ui'

import { useCampaignCharacters } from '@/features/campaign'
import { useNpcs } from '@/features/character/npc/hooks/use-npcs'
import { useOrganizations } from '@/features/content/organizations/hooks/use-organizations'

import {
  buildLocationPartyAssociationRows,
  groupLocationPartyAssociationRows,
  LOCATION_PARTY_EMPTY_TEXT,
  LOCATION_PARTY_SECTION_LABEL,
  type LocationPartyCharacterOption,
} from '../lib/location-party-associations.lib'

export function LocationPartyAssociationsDetailSection({
  location,
  campaignId,
}: {
  location: Location
  campaignId: string
}) {
  const associations = location.partyAssociations ?? []
  const { data: campaignCharacters = [] } = useCampaignCharacters(campaignId)
  const { data: npcs = [] } = useNpcs(campaignId)
  const { data: organizations = [] } = useOrganizations(campaignId)

  const charactersById = React.useMemo(() => {
    const entries: LocationPartyCharacterOption[] = [
      ...campaignCharacters.map(({ character }) => ({
        id: character.id,
        name: character.name,
        summary: character.summary,
        characterType: 'pc' as const,
      })),
      ...npcs.map(({ character }) => ({
        id: character.id,
        name: character.name,
        summary: '',
        characterType: 'npc' as const,
      })),
    ]
    return new Map(entries.map((entry) => [entry.id, entry]))
  }, [campaignCharacters, npcs])

  const organizationsById = React.useMemo(
    () =>
      new Map(organizations.map((organization: Organization) => [organization.id, organization])),
    [organizations],
  )

  const rows = React.useMemo(
    () =>
      buildLocationPartyAssociationRows({
        associations,
        charactersById,
        organizationsById,
      }),
    [associations, charactersById, organizationsById],
  )
  const groupedRows = React.useMemo(() => groupLocationPartyAssociationRows(rows), [rows])

  if (associations.length === 0) {
    return (
      <section className="space-y-3" aria-labelledby="location-party-associations-heading">
        <Heading variant="label" as="h2" id="location-party-associations-heading">
          {LOCATION_PARTY_SECTION_LABEL}
        </Heading>
        <InsetPanel borderStyle="dashed" surface={{}} size="md" align="center" className="py-6">
          <InsetPanel.Text>{LOCATION_PARTY_EMPTY_TEXT}</InsetPanel.Text>
        </InsetPanel>
      </section>
    )
  }

  return (
    <section className="space-y-4" aria-labelledby="location-party-associations-heading">
      <Heading variant="label" as="h2" id="location-party-associations-heading">
        {LOCATION_PARTY_SECTION_LABEL}
      </Heading>
      <div className="space-y-6">
        {[...groupedRows.entries()].map(([relationshipKey, relationshipRows]) => (
          <div key={relationshipKey} className="space-y-2">
            <Heading variant="label" as="h3">
              {relationshipRows[0]?.semanticLabel ?? relationshipKey}
            </Heading>
            <ul className="space-y-2">
              {relationshipRows.map((row) => (
                <li
                  key={row.association.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <Text as="span">{row.partyLabel}</Text>
                  {row.partyUnresolved ? <Badge tone="warning">Unavailable</Badge> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
